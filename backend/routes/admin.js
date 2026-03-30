const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Message = require('../models/Message');
const { verifyToken, isAdmin } = require('../config/auth');

// Get dashboard stats
router.get('/stats', verifyToken, isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalProducts = await Product.count();
    const totalOrders = await Order.count();
    const pendingSellers = await User.count({ 
      where: { 
        role: 'user',
        is_approved: false,
        store_name: { [Op.not]: null }
      } 
    });
    const pendingProducts = await Product.count({ where: { approval_status: 'pending' } });
    const totalMessages = await Message.count({ where: { status: 'unread' } });
    
    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      pendingSellers,
      pendingProducts,
      totalMessages
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all sellers (including pending)
router.get('/sellers', verifyToken, isAdmin, async (req, res) => {
  try {
    const sellers = await User.findAll({
      where: { 
        [Op.or]: [
          { role: 'seller' },
          { 
            role: 'user',
            store_name: { [Op.not]: null }
          }
        ]
      },
      attributes: { exclude: ['password'] },
      order: [['created_at', 'DESC']]
    });
    res.json(sellers);
  } catch (error) {
    console.error('Error fetching sellers:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get pending seller applications
router.get('/sellers/pending', verifyToken, isAdmin, async (req, res) => {
  try {
    const pendingSellers = await User.findAll({
      where: { 
        role: 'user',
        is_approved: false,
        store_name: { [Op.not]: null }
      },
      attributes: { exclude: ['password'] },
      order: [['created_at', 'DESC']]
    });
    res.json(pendingSellers);
  } catch (error) {
    console.error('Error fetching pending sellers:', error);
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
    
    seller.role = 'seller';
    seller.is_approved = true;
    await seller.save();
    
    console.log(`✅ Seller approved: ${seller.name} (${seller.email})`);
    
    res.json({ 
      success: true,
      message: 'Seller approved successfully',
      seller: { id: seller.id, name: seller.name, email: seller.email, role: seller.role }
    });
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
    seller.rejection_reason = reason || 'Application did not meet requirements';
    await seller.save();
    
    console.log(`❌ Seller rejected: ${seller.name} (${seller.email})`);
    
    res.json({ 
      success: true,
      message: 'Seller rejected',
      seller: { id: seller.id, name: seller.name, email: seller.email, status: 'rejected' }
    });
  } catch (error) {
    console.error('Error rejecting seller:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all users
router.get('/users', verifyToken, isAdmin, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['created_at', 'DESC']]
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
    res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
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
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all messages
router.get('/messages', verifyToken, isAdmin, async (req, res) => {
  try {
    const messages = await Message.findAll({
      include: [{ model: User, as: 'User', attributes: ['id', 'name', 'email'] }],
      order: [['created_at', 'DESC']]
    });
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
