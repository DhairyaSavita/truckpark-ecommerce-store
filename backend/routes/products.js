const express = require('express');
const { Op } = require('sequelize');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');
const { verifyToken, isAdmin } = require('../config/auth');

// Get all products (public - for buyers)
router.get('/', async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, brand, sort } = req.query;
    let where = {};
    
    // Only show approved products to buyers
    where.approval_status = 'approved';
    where.is_approved = true;
    
    if (category) where.category_id = category;
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { brand: { [Op.iLike]: `%${search}%` } },
        { part_number: { [Op.iLike]: `%${search}%` } }
      ];
    }
    if (brand) where.brand = brand;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
    }
    
    let order = [];
    if (sort === 'price_asc') order = [['price', 'ASC']];
    if (sort === 'price_desc') order = [['price', 'DESC']];
    if (sort === 'newest') order = [['created_at', 'DESC']];
    
    const products = await Product.findAll({
      where,
      include: [{ model: Category, as: 'Category', attributes: ['id', 'name'] }],
      order,
      limit: 100
    });
    
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single product (public)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: Category, as: 'Category', attributes: ['id', 'name'] }]
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Only show if approved
    if (product.approval_status !== 'approved') {
      return res.status(404).json({ error: 'Product not available' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get products by seller (public)
router.get('/seller/:sellerId', async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { 
        seller_id: req.params.sellerId,
        approval_status: 'approved',
        is_approved: true
      },
      include: [{ model: Category, as: 'Category' }]
    });
    res.json(products);
  } catch (error) {
    console.error('Error fetching seller products:', error);
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

// Create product (admin or seller)
router.post('/', verifyToken, async (req, res) => {
  try {
    // Check if user is admin or seller
    if (req.user.role !== 'admin' && req.user.role !== 'seller') {
      return res.status(403).json({ error: 'Not authorized to add products' });
    }
    
    const product = await Product.create({
      ...req.body,
      seller_id: req.user.id,
      approval_status: req.user.role === 'admin' ? 'approved' : 'pending',
      is_approved: req.user.role === 'admin'
    });
    
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update product
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Check ownership
    if (product.seller_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    await product.update(req.body);
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete product
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Check ownership
    if (product.seller_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    await product.destroy();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
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

module.exports = router;
