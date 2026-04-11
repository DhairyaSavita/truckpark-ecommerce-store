const express = require('express');
const router = express.Router();
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const { verifyToken } = require('../config/auth');

// Get user's wishlist
router.get('/', verifyToken, async (req, res) => {
  try {
    console.log('Fetching wishlist for user:', req.user.id);
    
    const wishlistItems = await Wishlist.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']]
    });
    
    // Manually fetch product details
    const wishlistWithProducts = [];
    for (const item of wishlistItems) {
      const product = await Product.findByPk(item.product_id, {
        attributes: ['id', 'name', 'price', 'brand', 'image_url', 'description']
      });
      if (product) {
        wishlistWithProducts.push({
          id: item.id,
          user_id: item.user_id,
          product_id: item.product_id,
          created_at: item.created_at,
          Product: product
        });
      }
    }
    
    console.log(`Found ${wishlistWithProducts.length} wishlist items`);
    res.json(wishlistWithProducts);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add to wishlist
router.post('/', verifyToken, async (req, res) => {
  try {
    console.log('Add to wishlist - User:', req.user.id);
    console.log('Add to wishlist - Body:', req.body);
    
    const { product_id } = req.body;
    
    if (!product_id) {
      return res.status(400).json({ error: 'Product ID is required' });
    }
    
    // Check if product exists
    const product = await Product.findByPk(product_id);
    if (!product) {
      return res.status(404).json({ error: `Product with ID ${product_id} not found` });
    }
    
    // Check if already in wishlist
    const existing = await Wishlist.findOne({
      where: { user_id: req.user.id, product_id }
    });
    
    if (existing) {
      return res.status(400).json({ error: 'Product already in wishlist' });
    }
    
    // Add to wishlist
    const wishlistItem = await Wishlist.create({
      user_id: req.user.id,
      product_id
    });
    
    console.log('Added to wishlist:', wishlistItem.id);
    
    res.status(201).json({
      success: true,
      message: 'Product added to wishlist',
      wishlistItem: {
        id: wishlistItem.id,
        product_id: wishlistItem.product_id,
        created_at: wishlistItem.created_at
      }
    });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ error: error.message });
  }
});

// Remove from wishlist
router.delete('/:productId', verifyToken, async (req, res) => {
  try {
    console.log('Remove from wishlist - User:', req.user.id);
    console.log('Remove from wishlist - Product ID:', req.params.productId);
    
    const deleted = await Wishlist.destroy({
      where: { 
        user_id: req.user.id, 
        product_id: req.params.productId 
      }
    });
    
    if (deleted === 0) {
      return res.status(404).json({ error: 'Item not found in wishlist' });
    }
    
    console.log('Removed from wishlist');
    res.json({ success: true, message: 'Product removed from wishlist' });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ error: error.message });
  }
});

// Check if product is in wishlist
router.get('/check/:productId', verifyToken, async (req, res) => {
  try {
    const exists = await Wishlist.findOne({
      where: { 
        user_id: req.user.id, 
        product_id: req.params.productId 
      }
    });
    res.json({ isWishlisted: !!exists });
  } catch (error) {
    console.error('Error checking wishlist:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
