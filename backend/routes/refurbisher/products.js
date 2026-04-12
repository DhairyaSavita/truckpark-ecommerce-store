const express = require('express');
const router = express.Router();
const RefurbishedProduct = require('../../models/RefurbishedProduct');
const User = require('../../models/User');
const { verifyToken } = require('../../config/auth');

// Add refurbished product
router.post('/add', verifyToken, async (req, res) => {
  try {
    const {
      title,
      description,
      condition,
      refurbishment_details,
      original_price,
      selling_price,
      stock_quantity,
      warranty_months,
      certification,
      images
    } = req.body;

    const product = await RefurbishedProduct.create({
      seller_id: req.user.id,
      title,
      description,
      condition: condition || 'refurbished',
      refurbishment_details,
      original_price,
      selling_price,
      discount_percentage: original_price ? ((original_price - selling_price) / original_price * 100).toFixed(2) : 0,
      stock_quantity: stock_quantity || 1,
      warranty_months: warranty_months || 0,
      certification,
      images: images || [],
      is_verified: false,
      status: 'active'
    });

    res.status(201).json({ success: true, product });
  } catch (error) {
    console.error('Error adding refurbished product:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get my refurbished products
router.get('/my-products', verifyToken, async (req, res) => {
  try {
    const products = await RefurbishedProduct.findAll({
      where: { seller_id: req.user.id },
      order: [['created_at', 'DESC']]
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update product
router.put('/products/:id', verifyToken, async (req, res) => {
  try {
    const product = await RefurbishedProduct.findOne({
      where: { id: req.params.id, seller_id: req.user.id }
    });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    await product.update(req.body);
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete product
router.delete('/products/:id', verifyToken, async (req, res) => {
  try {
    const product = await RefurbishedProduct.findOne({
      where: { id: req.params.id, seller_id: req.user.id }
    });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    await product.destroy();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
