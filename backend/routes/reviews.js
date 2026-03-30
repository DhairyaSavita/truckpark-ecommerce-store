const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Product = require('../models/Product');
const User = require('../models/User');
const { verifyToken } = require('../config/auth');

// Get product reviews
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { product_id: req.params.productId },
      include: [{ model: User, attributes: ['id', 'name'] }],
      order: [['created_at', 'DESC']]
    });
    
    const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / (reviews.length || 1);
    
    res.json({
      reviews,
      averageRating,
      totalReviews: reviews.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add review
router.post('/', verifyToken, async (req, res) => {
  try {
    const { product_id, rating, title, comment } = req.body;
    
    // Check if user already reviewed
    const existingReview = await Review.findOne({
      where: { product_id, user_id: req.user.id }
    });
    
    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this product' });
    }
    
    const review = await Review.create({
      product_id,
      user_id: req.user.id,
      rating,
      title,
      comment
    });
    
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
