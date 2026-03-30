const express = require('express');
const { Op } = require('sequelize');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');
const { verifyToken, isAdmin } = require('../config/auth');

// Get all products with proper category filtering
router.get('/', async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, brand, sort } = req.query;
    let where = {};
    
    // Only show approved products
    where.approval_status = 'approved';
    where.is_approved = true;
    
    // Category filter - FIXED
    if (category && category !== 'undefined' && category !== 'null' && category !== '') {
      where.category_id = parseInt(category);
      console.log('Filtering by category ID:', category);
    }
    
    // Search filter
    if (search && search.trim() !== '') {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { brand: { [Op.iLike]: `%${search}%` } },
        { part_number: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    // Brand filter
    if (brand && brand !== 'undefined' && brand !== 'null' && brand !== '') {
      where.brand = brand;
    }
    
    // Price range filter
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice && minPrice !== 'undefined') where.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice && maxPrice !== 'undefined') where.price[Op.lte] = parseFloat(maxPrice);
    }
    
    // Sorting
    let order = [];
    if (sort === 'price_asc') order = [['price', 'ASC']];
    else if (sort === 'price_desc') order = [['price', 'DESC']];
    else if (sort === 'newest') order = [['created_at', 'DESC']];
    else order = [['created_at', 'DESC']];
    
    const products = await Product.findAll({
      where,
      include: [{ model: Category, as: 'Category', attributes: ['id', 'name'] }],
      order,
      limit: 100
    });
    
    console.log(`Found ${products.length} products for category: ${category || 'all'}`);
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: Category, as: 'Category', attributes: ['id', 'name'] }]
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    if (product.approval_status !== 'approved') {
      return res.status(404).json({ error: 'Product not available' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get products by category - NEW ENDPOINT
router.get('/category/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const products = await Product.findAll({
      where: { 
        category_id: categoryId,
        approval_status: 'approved',
        is_approved: true
      },
      include: [{ model: Category, as: 'Category' }],
      order: [['created_at', 'DESC']]
    });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get categories
router.get('/categories/all', async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin: Get all products (including pending)
router.get('/admin/all', verifyToken, isAdmin, async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [{ model: Category, as: 'Category' }],
      order: [['created_at', 'DESC']]
    });
    res.json(products);
  } catch (error) {
    console.error('Error fetching all products:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin: Approve product
router.put('/:id/approve', verifyToken, isAdmin, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    product.approval_status = 'approved';
    product.is_approved = true;
    await product.save();
    
    res.json({ message: 'Product approved successfully', product });
  } catch (error) {
    console.error('Error approving product:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
