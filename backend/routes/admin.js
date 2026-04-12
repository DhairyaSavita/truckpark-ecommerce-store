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

// Dashboard stats
router.get('/stats', verifyToken, isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalSellers = await User.count({ where: { role: 'seller' } });
    const totalProducts = await Product.count();
    const totalOrders = await Order.count();
    const pendingOrders = await Order.count({ where: { status: 'pending' } });
    const pendingSellers = await User.count({ 
      where: { 
        store_name: { [Op.not]: null },
        is_approved: false
      } 
    });
    const lowStockProducts = await Product.count({ where: { stock_quantity: { [Op.lt]: 10 } } });
    
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
    
    res.json({ success: true, message: 'Seller approved successfully' });
  } catch (error) {
    console.error('Error approving seller:', error);
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

// Update product
router.put('/products/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    await product.update(req.body);
    res.json({ success: true, product });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete product
router.delete('/products/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    await product.destroy();
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    console.error('Error deleting product:', error);
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

// Update order status
router.put('/orders/:id/status', verifyToken, isAdmin, async (req, res) => {
  try {
    const { status, tracking_number } = req.body;
    const order = await Order.findByPk(req.params.id);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    order.status = status;
    if (tracking_number) order.tracking_number = tracking_number;
    await order.save();
    
    res.json({ success: true, message: 'Order status updated', order });
  } catch (error) {
    console.error('Error updating order:', error);
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

// Get support tickets
router.get('/support-tickets', verifyToken, isAdmin, async (req, res) => {
  try {
    const tickets = await SupportTicket.findAll({
      include: [{ model: User, as: 'User', attributes: ['id', 'name', 'email'] }],
      order: [['created_at', 'DESC']]
    });
    res.json(tickets);
  } catch (error) {
    console.error('Error fetching support tickets:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update support ticket
router.put('/support-tickets/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { status, resolution } = req.body;
    const ticket = await SupportTicket.findByPk(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    if (status) ticket.status = status;
    if (resolution) ticket.resolution = resolution;
    await ticket.save();
    
    res.json({ success: true, ticket });
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get logistics
router.get('/logistics', verifyToken, isAdmin, async (req, res) => {
  try {
    const logistics = await User.findAll({
      where: { is_logistics: true },
      attributes: { exclude: ['password'] }
    });
    res.json(logistics);
  } catch (error) {
    console.error('Error fetching logistics:', error);
    res.status(500).json({ error: error.message });
  }
});

// Approve logistics
router.put('/logistics/:id/approve', verifyToken, isAdmin, async (req, res) => {
  try {
    const logistics = await User.findByPk(req.params.id);
    if (!logistics) {
      return res.status(404).json({ error: 'Logistics not found' });
    }
    
    logistics.logistics_verified = true;
    await logistics.save();
    
    res.json({ success: true, message: 'Logistics approved' });
  } catch (error) {
    console.error('Error approving logistics:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
