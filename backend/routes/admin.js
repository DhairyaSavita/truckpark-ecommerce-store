const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Message = require('../models/Message');
const { verifyToken, isAdmin } = require('../config/auth');

// Get dashboard stats
router.get('/stats', verifyToken, isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalProducts = await Product.count();
    const totalOrders = await Order.count();
    const totalCategories = await Category.count();
    const pendingOrders = await Order.count({ where: { status: 'pending' } });
    const totalMessages = await Message.count({ where: { status: 'unread' } });
    
    // Calculate total revenue
    const allOrders = await Order.findAll();
    const totalRevenue = allOrders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);
    
    const recentOrders = await Order.findAll({
      limit: 5,
      order: [['created_at', 'DESC']],
      include: [{ model: User, attributes: ['name', 'email'] }]
    });
    
    const recentMessages = await Message.findAll({
      limit: 5,
      where: { status: 'unread' },
      order: [['created_at', 'DESC']],
      include: [{ model: User, as: 'User', attributes: ['id', 'name', 'email', 'phone'] }]
    });
    
    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalCategories,
      pendingOrders,
      totalMessages,
      totalRevenue,
      recentOrders,
      recentMessages
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all messages (admin)
router.get('/messages', verifyToken, isAdmin, async (req, res) => {
  try {
    const messages = await Message.findAll({
      include: [{ 
        model: User, 
        as: 'User', 
        attributes: ['id', 'name', 'email', 'phone'] 
      }],
      order: [['created_at', 'DESC']]
    });
    console.log(`📬 Admin fetched ${messages.length} messages`);
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all orders (admin)
router.get('/orders', verifyToken, isAdmin, async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        { model: User, attributes: ['id', 'name', 'email'] },
        { model: OrderItem, as: 'OrderItems', include: [Product] }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all users
router.get('/users', verifyToken, isAdmin, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update user role
router.put('/users/:id/role', verifyToken, isAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    user.role = role;
    await user.save();
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete user
router.delete('/users/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    await user.destroy();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

// Get all sellers (pending and approved)
router.get('/sellers', verifyToken, isAdmin, async (req, res) => {
  try {
    const sellers = await User.findAll({
      where: { role: 'seller' },
      attributes: { exclude: ['password'] }
    });
    res.json(sellers);
  } catch (error) {
    console.error('Error fetching sellers:', error);
    res.status(500).json({ error: error.message });
  }
});

// Approve seller
router.put('/sellers/:id/approve', verifyToken, isAdmin, async (req, res) => {
  try {
    const seller = await User.findByPk(req.params.id);
    if (!seller) {
      return res.status(404).json({ error: 'Seller not found' });
    }
    
    seller.is_approved = true;
    seller.role = 'seller';
    await seller.save();
    
    // Create notification for seller
    const Notification = require('../models/Notification');
    await Notification.create({
      user_id: seller.id,
      title: 'Seller Application Approved!',
      message: 'Congratulations! Your seller application has been approved. You can now start listing products.',
      type: 'system'
    });
    
    res.json({ message: 'Seller approved successfully', seller });
  } catch (error) {
    console.error('Error approving seller:', error);
    res.status(500).json({ error: error.message });
  }
});

// Reject seller
router.put('/sellers/:id/reject', verifyToken, isAdmin, async (req, res) => {
  try {
    const { reason } = req.body;
    const seller = await User.findByPk(req.params.id);
    if (!seller) {
      return res.status(404).json({ error: 'Seller not found' });
    }
    
    seller.is_approved = false;
    seller.rejection_reason = reason;
    await seller.save();
    
    // Create notification for seller
    const Notification = require('../models/Notification');
    await Notification.create({
      user_id: seller.id,
      title: 'Seller Application Status',
      message: `Your seller application has been reviewed. Reason: ${reason}`,
      type: 'system'
    });
    
    res.json({ message: 'Seller rejected', seller });
  } catch (error) {
    console.error('Error rejecting seller:', error);
    res.status(500).json({ error: error.message });
  }
});
