const express = require('express');
const router = express.Router();
const PriceAlert = require('../models/PriceAlert');
const Product = require('../models/Product');
const User = require('../models/User');
const { verifyToken } = require('../config/auth');
const nodemailer = require('nodemailer');

// Get user's price alerts
router.get('/', verifyToken, async (req, res) => {
  try {
    console.log('Fetching price alerts for user:', req.user.id);
    
    const alerts = await PriceAlert.findAll({
      where: { user_id: req.user.id, is_active: true },
      order: [['created_at', 'DESC']]
    });
    
    // Fetch product details for each alert
    const alertsWithProducts = await Promise.all(alerts.map(async (alert) => {
      const product = await Product.findByPk(alert.product_id, {
        attributes: ['id', 'name', 'price', 'brand', 'image_url']
      });
      return {
        ...alert.toJSON(),
        Product: product
      };
    }));
    
    console.log(`Found ${alertsWithProducts.length} price alerts`);
    res.json(alertsWithProducts);
  } catch (error) {
    console.error('Error fetching price alerts:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create price alert
router.post('/', verifyToken, async (req, res) => {
  try {
    console.log('Create price alert - User:', req.user.id);
    console.log('Create price alert - Body:', req.body);
    
    const { product_id, target_price } = req.body;
    
    if (!product_id) {
      return res.status(400).json({ error: 'Product ID is required' });
    }
    if (!target_price || target_price <= 0) {
      return res.status(400).json({ error: 'Valid target price is required' });
    }
    
    // Check if product exists
    const product = await Product.findByPk(product_id);
    if (!product) {
      return res.status(404).json({ error: `Product with ID ${product_id} not found` });
    }
    
    // Check if alert already exists
    const existingAlert = await PriceAlert.findOne({
      where: { 
        user_id: req.user.id, 
        product_id, 
        is_active: true 
      }
    });
    
    if (existingAlert) {
      return res.status(400).json({ error: 'Price alert already exists for this product' });
    }
    
    // Create price alert
    const alert = await PriceAlert.create({
      user_id: req.user.id,
      product_id,
      target_price,
      is_active: true
    });
    
    console.log('Price alert created:', alert.id);
    
    res.status(201).json({
      success: true,
      message: `Price alert set for ₹${target_price}`,
      alert: {
        id: alert.id,
        product_id: alert.product_id,
        target_price: alert.target_price,
        current_price: product.price,
        created_at: alert.created_at
      }
    });
  } catch (error) {
    console.error('Error creating price alert:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete price alert
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    console.log('Delete price alert - User:', req.user.id);
    console.log('Delete price alert - ID:', req.params.id);
    
    const alert = await PriceAlert.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });
    
    if (!alert) {
      return res.status(404).json({ error: 'Price alert not found' });
    }
    
    await alert.destroy();
    
    console.log('Price alert deleted');
    res.json({ success: true, message: 'Price alert removed' });
  } catch (error) {
    console.error('Error deleting price alert:', error);
    res.status(500).json({ error: error.message });
  }
});

// Check price drops (cron job endpoint)
router.post('/check-drops', async (req, res) => {
  try {
    const alerts = await PriceAlert.findAll({
      where: { is_active: true },
      include: [{ model: Product, as: 'Product' }]
    });
    
    const priceDrops = [];
    for (const alert of alerts) {
      if (alert.Product.price <= alert.target_price) {
        priceDrops.push(alert);
        // Mark as inactive or keep for notification
        // alert.is_active = false;
        // await alert.save();
      }
    }
    
    res.json({ 
      success: true, 
      priceDrops: priceDrops.length,
      alerts: priceDrops.map(a => ({
        product: a.Product.name,
        current_price: a.Product.price,
        target_price: a.target_price
      }))
    });
  } catch (error) {
    console.error('Error checking price drops:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
