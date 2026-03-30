const express = require('express');
const router = express.Router();
const Product = require('../../models/Product');
const { verifyToken } = require('../../config/auth');

// Middleware to check if user is seller or admin
const isSellerOrAdmin = (req, res, next) => {
  if (req.user.role !== 'seller' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Seller or admin access required' });
  }
  next();
};

// Get seller's products
router.get('/', verifyToken, isSellerOrAdmin, async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { seller_id: req.user.id },
      order: [['created_at', 'DESC']]
    });
    res.json(products);
  } catch (error) {
    console.error('Error fetching seller products:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add new product
router.post('/', verifyToken, isSellerOrAdmin, async (req, res) => {
  try {
    console.log('Received product data:', req.body);
    
    const { 
      name, 
      description, 
      price, 
      stock_quantity, 
      category_id, 
      brand, 
      part_number, 
      image_url, 
      specifications 
    } = req.body;
    
    // Validate required fields
    if (!name || !description || !price || !stock_quantity || !category_id) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, description, price, stock_quantity, category_id are required' 
      });
    }
    
    const productData = {
      name,
      description,
      price: parseFloat(price),
      stock_quantity: parseInt(stock_quantity),
      category_id: parseInt(category_id),
      brand: brand || null,
      part_number: part_number || null,
      image_url: image_url || null,
      specifications: specifications || {},
      seller_id: req.user.id,
      approval_status: 'pending',
      is_approved: false
    };
    
    const product = await Product.create(productData);
    console.log(`✅ Product added successfully: ${product.name} (ID: ${product.id})`);
    
    res.status(201).json({ 
      success: true, 
      message: 'Product added successfully! Waiting for admin approval.',
      product 
    });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update product
router.put('/:id', verifyToken, isSellerOrAdmin, async (req, res) => {
  try {
    const product = await Product.findOne({
      where: { id: req.params.id, seller_id: req.user.id }
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    await product.update(req.body);
    res.json({ success: true, message: 'Product updated successfully', product });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete product
router.delete('/:id', verifyToken, isSellerOrAdmin, async (req, res) => {
  try {
    const product = await Product.findOne({
      where: { id: req.params.id, seller_id: req.user.id }
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    await product.destroy();
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
