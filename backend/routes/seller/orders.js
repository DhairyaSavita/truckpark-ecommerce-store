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

// Get seller's orders
router.get('/', verifyToken, isSellerOrAdmin, async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        { model: OrderItem, as: 'OrderItems', include: [{ model: Product, as: 'Product' }] },
        { model: User, as: 'User', attributes: ['id', 'name', 'email'] }
      ],
      order: [['created_at', 'DESC']]
    });
    
    // Filter orders that contain seller's products
    const sellerOrders = orders.filter(order => 
      order.OrderItems.some(item => item.Product?.seller_id === req.user.id)
    );
    
    res.json(sellerOrders);
  } catch (error) {
    console.error('Error fetching seller orders:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update order status
router.put('/:id/status', verifyToken, isSellerOrAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByPk(req.params.id);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    order.status = status;
    await order.save();
    
    res.json({ success: true, message: 'Order status updated', order });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
