const express = require('express');
const router = express.Router();
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const { verifyToken } = require('../config/auth');

// Get wishlist
router.get('/', verifyToken, async (req, res) => {
  try {
    const wishlist = await Wishlist.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']]
    });
    
    const wishlistWithProducts = await Promise.all(wishlist.map(async (item) => {
      const product = await Product.findByPk(item.product_id, {
        attributes: ['id', 'name', 'price', 'brand', 'image_url']
      });
      return {
        ...item.toJSON(),
        Product: product
      };
    }));
    
    res.json(wishlistWithProducts);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add to wishlist
router.post('/', verifyToken, async (req, res) => {
  try {
    const { product_id } = req.body;
    
    const existing = await Wishlist.findOne({
      where: { user_id: req.user.id, product_id }
    });
    
    if (existing) {
      return res.status(400).json({ error: 'Product already in wishlist' });
    }
    
    const wishlistItem = await Wishlist.create({
      user_id: req.user.id,
      product_id
    });
    
    res.status(201).json(wishlistItem);
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ error: error.message });
  }
});

// Remove from wishlist
router.delete('/:productId', verifyToken, async (req, res) => {
  try {
    await Wishlist.destroy({
      where: { user_id: req.user.id, product_id: req.params.productId }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ error: error.message });
  }
});

// Check wishlist status
router.get('/check/:productId', verifyToken, async (req, res) => {
  try {
    const exists = await Wishlist.findOne({
      where: { user_id: req.user.id, product_id: req.params.productId }
    });
    res.json({ isWishlisted: !!exists });
  } catch (error) {
    console.error('Error checking wishlist:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
