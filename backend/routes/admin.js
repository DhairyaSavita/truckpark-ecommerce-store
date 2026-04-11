const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const User = require('../models/User');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Message = require('../models/Message');
const SupportTicket = require('../models/SupportTicket');
const { verifyToken, isAdmin } = require('../config/auth');

// Get dashboard stats
router.get('/stats', verifyToken, isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalSellers = await User.count({ where: { role: 'seller' } });
    const totalProducts = await Product.count();
    const totalOrders = await Order.count();
    const pendingOrders = await Order.count({ where: { status: 'pending' } });
    const pendingSellers = await User.count({ 
      where: { 
        role: 'user',
        store_name: { [Op.not]: null },
        is_approved: false
      } 
    });
    const lowStockProducts = await Product.count({ where: { stock_quantity: { [Op.lt]: 10 } } });
    const urgentTickets = await SupportTicket.count({ where: { priority: 'urgent', status: ['open', 'in_progress'] } });
    
    const allOrders = await Order.findAll();
    const totalRevenue = allOrders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);
    
    const recentOrders = await Order.findAll({
      limit: 5,
      order: [['created_at', 'DESC']],
      include: [{ model: User, as: 'User', attributes: ['name', 'email'] }]
    });
    
    const recentUsers = await User.findAll({
      limit: 5,
      order: [['created_at', 'DESC']],
      attributes: { exclude: ['password'] }
    });
    
    res.json({
      totalUsers,
      totalSellers,
      totalProducts,
      totalOrders,
      pendingOrders,
      pendingSellers,
      lowStockProducts,
      totalRevenue,
      urgentTickets,
      recentOrders,
      recentUsers
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
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

// ============ SUPPORT TICKETS ADMIN ENDPOINTS ============

// Get ALL support tickets (admin) - FIXED
router.get('/support-tickets', verifyToken, isAdmin, async (req, res) => {
  try {
    console.log('=== ADMIN FETCHING ALL TICKETS ===');
    
    const tickets = await SupportTicket.findAll({
      include: [{ model: User, as: 'User', attributes: ['id', 'name', 'email', 'phone'] }],
      order: [['created_at', 'DESC']]
    });
    
    console.log(`✅ Admin found ${tickets.length} tickets`);
    res.json(tickets);
  } catch (error) {
    console.error('Error fetching admin tickets:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get urgent tickets (admin)
router.get('/support-tickets/urgent', verifyToken, isAdmin, async (req, res) => {
  try {
    console.log('=== ADMIN FETCHING URGENT TICKETS ===');
    
    const tickets = await SupportTicket.findAll({
      where: { priority: 'urgent', status: ['open', 'in_progress'] },
      include: [{ model: User, as: 'User', attributes: ['id', 'name', 'email', 'phone'] }],
      order: [['created_at', 'DESC']]
    });
    
    console.log(`✅ Admin found ${tickets.length} urgent tickets`);
    res.json(tickets);
  } catch (error) {
    console.error('Error fetching urgent tickets:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update support ticket (admin)
router.put('/support-tickets/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { status, resolution, priority } = req.body;
    const ticket = await SupportTicket.findByPk(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    if (status) ticket.status = status;
    if (resolution) ticket.resolution = resolution;
    if (priority) ticket.priority = priority;
    await ticket.save();
    
    console.log(`✅ Ticket ${ticket.id} updated: status=${status}, priority=${priority}`);
    
    res.json({ success: true, message: 'Ticket updated successfully', ticket });
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete support ticket (admin)
router.delete('/support-tickets/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const ticket = await SupportTicket.findByPk(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    await ticket.destroy();
    res.json({ success: true, message: 'Ticket deleted' });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ END SUPPORT TICKETS ============

// Create user
router.post('/users', verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, email, password, phone, address, role } = req.body;
    
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    const user = await User.create({
      name,
      email,
      password,
      phone,
      address,
      role: role || 'user'
    });
    
    res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (error) {
    console.error('Error creating user:', error);
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

// Block/Unblock user
router.put('/users/:id/block', verifyToken, isAdmin, async (req, res) => {
  try {
    const { block } = req.body;
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    user.status = block ? 'blocked' : 'active';
    await user.save();
    res.json({ success: true, message: block ? 'User blocked' : 'User unblocked', user });
  } catch (error) {
    console.error('Error blocking user:', error);
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
    
    if (user.email === 'admin@truckparts.com') {
      return res.status(400).json({ error: 'Cannot delete the main admin user' });
    }
    
    await user.destroy();
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all sellers
router.get('/sellers', verifyToken, isAdmin, async (req, res) => {
  try {
    const sellers = await User.findAll({
      where: { 
        [Op.or]: [
          { role: 'seller' },
          { store_name: { [Op.not]: null } }
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

// Get all products (for inventory)
router.get('/products', verifyToken, isAdmin, async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [{ model: Category, as: 'Category' }],
      order: [['created_at', 'DESC']]
    });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all orders
router.get('/orders', verifyToken, isAdmin, async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        { model: User, as: 'User', attributes: ['id', 'name', 'email'] },
        { model: OrderItem, as: 'OrderItems', include: [{ model: Product, as: 'Product' }] }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
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
