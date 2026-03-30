const express = require('express');
const router = express.Router();
const Product = require('../../models/Product');
const Order = require('../../models/Order');
const OrderItem = require('../../models/OrderItem');
const { verifyToken } = require('../../config/auth');

const isSellerOrAdmin = (req, res, next) => {
  if (req.user.role !== 'seller' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Seller or admin access required' });
  }
  next();
};

router.get('/', verifyToken, isSellerOrAdmin, async (req, res) => {
  try {
    const totalProducts = await Product.count({ where: { seller_id: req.user.id } });
    const totalOrders = await Order.count({
      include: [{
        model: OrderItem,
        as: 'OrderItems',
        include: [{ model: Product, as: 'Product', where: { seller_id: req.user.id } }]
      }]
    });
    
    res.json({ totalProducts, totalOrders });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
