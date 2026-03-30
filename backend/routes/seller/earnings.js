const express = require('express');
const router = express.Router();
const Order = require('../../models/Order');
const OrderItem = require('../../models/OrderItem');
const Product = require('../../models/Product');
const { verifyToken } = require('../../config/auth');

// Middleware to check if user is seller or admin
const isSellerOrAdmin = (req, res, next) => {
  if (req.user.role !== 'seller' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Seller or admin access required' });
  }
  next();
};

// Get seller's earnings
router.get('/', verifyToken, isSellerOrAdmin, async (req, res) => {
  try {
    // Get all completed orders with seller's products
    const orders = await Order.findAll({
      where: { status: 'delivered' },
      include: [
        { model: OrderItem, as: 'OrderItems', include: [{ model: Product, as: 'Product' }] }
      ],
      order: [['created_at', 'DESC']]
    });
    
    // Calculate earnings from seller's products
    let totalEarnings = 0;
    const earnings = [];
    
    for (const order of orders) {
      let orderEarnings = 0;
      const sellerItems = order.OrderItems.filter(item => item.Product?.seller_id === req.user.id);
      
      if (sellerItems.length > 0) {
        for (const item of sellerItems) {
          const itemTotal = item.price * item.quantity;
          orderEarnings += itemTotal;
          totalEarnings += itemTotal;
        }
        
        earnings.push({
          order_id: order.id,
          amount: orderEarnings,
          status: order.status,
          created_at: order.created_at
        });
      }
    }
    
    res.json({
      earnings,
      totalEarnings,
      pendingEarnings: totalEarnings // Simplified for now
    });
  } catch (error) {
    console.error('Error fetching earnings:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
