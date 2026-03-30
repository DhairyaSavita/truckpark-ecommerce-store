const express = require('express');
const router = express.Router();
const Product = require('../../models/Product');
const { verifyToken, isSeller } = require('../../config/auth');

// Get seller's products
router.get('/', verifyToken, isSeller, async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { seller_id: req.user.id },
      order: [['created_at', 'DESC']]
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new product
router.post('/', verifyToken, isSeller, async (req, res) => {
  try {
    const product = await Product.create({
      ...req.body,
      seller_id: req.user.id,
      approval_status: 'pending'
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update product
router.put('/:id', verifyToken, isSeller, async (req, res) => {
  try {
    const product = await Product.findOne({
      where: { id: req.params.id, seller_id: req.user.id }
    });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    await product.update(req.body);
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete product
router.delete('/:id', verifyToken, isSeller, async (req, res) => {
  try {
    const product = await Product.findOne({
      where: { id: req.params.id, seller_id: req.user.id }
    });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    await product.destroy();
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
