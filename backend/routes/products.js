const express = require('express');
const { Op, fn, col, literal } = require('sequelize');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');
const ProductReview = require('../models/ProductReview');
const { verifyToken, isAdmin } = require('../config/auth');

/**
 * GET /api/products
 * Public route — returns approved products with optional filters.
 * Supports: category, search, minPrice, maxPrice, brand, sort, page, limit
 */
router.get('/', async (req, res) => {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      brand,
      sort,
      page = 1,
      limit = 100, // Frontend handles client pagination; backend cap is 200
    } = req.query;

    let where = {
      approval_status: 'approved',
      is_approved: true,
    };

    if (category && category !== 'undefined' && category !== 'null' && category !== '') {
      where.category_id = parseInt(category);
    }

    if (search && search.trim() !== '') {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search.trim()}%` } },
        { brand: { [Op.iLike]: `%${search.trim()}%` } },
        { part_number: { [Op.iLike]: `%${search.trim()}%` } },
        { description: { [Op.iLike]: `%${search.trim()}%` } },
      ];
    }

    if (brand && brand !== 'undefined' && brand !== 'null' && brand !== '') {
      where.brand = brand;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice && minPrice !== 'undefined') where.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice && maxPrice !== 'undefined') where.price[Op.lte] = parseFloat(maxPrice);
    }

    let order = [['created_at', 'DESC']];
    if (sort === 'price_asc') order = [['price', 'ASC']];
    else if (sort === 'price_desc') order = [['price', 'DESC']];

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(200, Math.max(1, parseInt(limit)));

    const { count, rows: products } = await Product.findAndCountAll({
      where,
      include: [
        {
          model: Category,
          as: 'Category',
          attributes: ['id', 'name'],
        },
      ],
      order,
      limit: limitNum,
      offset: (pageNum - 1) * limitNum,
      distinct: true,
    });

    // Aggregate ratings per product in one query for performance
    const productIds = products.map(p => p.id);
    let ratingMap = {};

    if (productIds.length > 0) {
      try {
        const ratings = await ProductReview.findAll({
          where: { product_id: { [Op.in]: productIds } },
          attributes: [
            'product_id',
            [fn('AVG', col('rating')), 'avg_rating'],
            [fn('COUNT', col('id')), 'reviews_count'],
          ],
          group: ['product_id'],
          raw: true,
        });
        ratings.forEach(r => {
          ratingMap[r.product_id] = {
            rating: parseFloat(r.avg_rating || 0).toFixed(1),
            reviews_count: parseInt(r.reviews_count || 0),
          };
        });
      } catch {
        // ProductReview table may not exist yet — gracefully skip
      }
    }

    // Merge rating data into product responses
    const enrichedProducts = products.map(p => {
      const plain = p.toJSON();
      const ratingData = ratingMap[p.id] || { rating: 0, reviews_count: 0 };
      return { ...plain, ...ratingData };
    });

    // Return with pagination meta — frontend can use count for pages
    res.json(enrichedProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/products/admin/all
 * Admin-only — returns all products regardless of approval status.
 */
router.get('/admin/all', verifyToken, isAdmin, async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [{ model: Category, as: 'Category' }],
      order: [['created_at', 'DESC']],
    });
    res.json(products);
  } catch (error) {
    console.error('Error fetching admin products:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/products/:id
 * Public — returns a single product with category and rating.
 */
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: Category, as: 'Category', attributes: ['id', 'name'] }],
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    let ratingData = { rating: 0, reviews_count: 0 };
    try {
      const rating = await ProductReview.findOne({
        where: { product_id: product.id },
        attributes: [
          [fn('AVG', col('rating')), 'avg_rating'],
          [fn('COUNT', col('id')), 'reviews_count'],
        ],
        raw: true,
      });
      if (rating) {
        ratingData = {
          rating: parseFloat(rating.avg_rating || 0).toFixed(1),
          reviews_count: parseInt(rating.reviews_count || 0),
        };
      }
    } catch {
      // Gracefully skip if table doesn't exist yet
    }

    res.json({ ...product.toJSON(), ...ratingData });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/products
 * Admin-only — create a product.
 */
router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const productData = {
      ...req.body,
      approval_status: 'approved',
      is_approved: true,
    };
    const product = await Product.create(productData);
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/products/:id
 * Admin-only — update a product.
 */
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    await product.update(req.body);
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/products/:id
 * Admin-only — soft delete a product.
 */
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    await product.destroy();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/products/categories/all
 * Public — list all categories.
 */
router.get('/categories/all', async (req, res) => {
  try {
    const categories = await Category.findAll({ order: [['name', 'ASC']] });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
