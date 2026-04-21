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
const TechnicianProfile = require('../models/TechnicianProfile');
const TechnicianHireRequest = require('../models/TechnicianHireRequest');
const DriverProfile = require('../models/DriverProfile');
const DriverHireRequest = require('../models/DriverHireRequest');
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

// Reject logistics
router.put('/logistics/:id/reject', verifyToken, isAdmin, async (req, res) => {
  try {
    const { reason } = req.body;
    const logistics = await User.findByPk(req.params.id);
    if (!logistics) {
      return res.status(404).json({ error: 'Logistics not found' });
    }
    logistics.logistics_verified = false;
    logistics.rejection_reason = reason;
    await logistics.save();
    res.json({ success: true, message: 'Logistics rejected' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reject seller
router.put('/sellers/:id/reject', verifyToken, isAdmin, async (req, res) => {
  try {
    const { reason } = req.body;
    const seller = await User.findByPk(req.params.id);
    if (!seller) return res.status(404).json({ error: 'Seller not found' });
    seller.is_approved = false;
    seller.rejection_reason = reason;
    await seller.save();
    res.json({ success: true, message: 'Seller rejected' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ SUPER ADMIN STATS ============
router.get('/super-stats', verifyToken, isAdmin, async (req, res) => {
  try {
    const [
      totalUsers,
      totalSellers,
      totalTechnicians,
      totalDrivers,
      totalLogistics,
      totalRefurbishers,
      totalOrders,
      totalProducts,
    ] = await Promise.all([
      User.count(),
      User.count({ where: { role: 'seller' } }),
      User.count({ where: { is_technician: true } }),
      User.count({ where: { is_driver: true } }),
      User.count({ where: { is_logistics: true } }),
      User.count({ where: { is_refurbisher: true } }),
      require('../models/Order').count(),
      require('../models/Product').count(),
    ]);

    const allOrders = await require('../models/Order').findAll({ attributes: ['total_amount'] });
    const totalRevenue = allOrders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);

    // Recent users as activity feed
    const recentUsers = await User.findAll({
      limit: 10,
      order: [['created_at', 'DESC']],
      attributes: ['id', 'name', 'email', 'role', 'created_at', 'is_technician', 'is_driver', 'is_logistics', 'is_refurbisher']
    });

    const recentActivities = recentUsers.map(u => ({
      message: `${u.name} registered as ${u.is_technician ? 'Technician' : u.is_driver ? 'Driver' : u.is_logistics ? 'Logistics' : u.is_refurbisher ? 'Refurbisher' : u.role}`,
      time: new Date(u.created_at).toLocaleString('en-IN')
    }));

    res.json({
      totalUsers,
      totalSellers,
      totalTechnicians,
      totalDrivers,
      totalLogistics,
      totalRefurbishers,
      totalOrders,
      totalProducts,
      totalRevenue,
      commissionRate: 10,
      recentActivities
    });
  } catch (error) {
    console.error('Error fetching super stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ PENDING APPROVALS BY TYPE ============

// Pending sellers
router.get('/pending/sellers', verifyToken, isAdmin, async (req, res) => {
  try {
    const sellers = await User.findAll({
      where: {
        [Op.or]: [
          { store_name: { [Op.not]: null } },
          { role: 'seller' }
        ],
        is_approved: { [Op.or]: [false, null] }
      },
      attributes: { exclude: ['password'] },
      order: [['created_at', 'DESC']]
    });
    res.json(sellers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Pending technicians
router.get('/pending/technicians', verifyToken, isAdmin, async (req, res) => {
  try {
    const technicians = await User.findAll({
      where: {
        is_technician: true,
        technician_verified: false
      },
      attributes: { exclude: ['password'] },
      order: [['created_at', 'DESC']]
    });
    res.json(technicians);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Pending drivers
router.get('/pending/drivers', verifyToken, isAdmin, async (req, res) => {
  try {
    const drivers = await User.findAll({
      where: {
        is_driver: true,
        driver_verified: false
      },
      attributes: { exclude: ['password'] },
      order: [['created_at', 'DESC']]
    });
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Pending logistics
router.get('/pending/logistics', verifyToken, isAdmin, async (req, res) => {
  try {
    const logistics = await User.findAll({
      where: {
        is_logistics: true,
        logistics_verified: false
      },
      attributes: { exclude: ['password'] },
      order: [['created_at', 'DESC']]
    });
    res.json(logistics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Pending refurbishers
router.get('/pending/refurbishers', verifyToken, isAdmin, async (req, res) => {
  try {
    const refurbishers = await User.findAll({
      where: {
        is_refurbisher: true,
        refurbisher_verified: false
      },
      attributes: { exclude: ['password'] },
      order: [['created_at', 'DESC']]
    });
    res.json(refurbishers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ UNIFIED APPROVE / REJECT ============

// Approve any role type: seller | technician | driver | logistics | refurbisher
router.put('/approve/:type/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { type, id } = req.params;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    switch (type) {
      case 'seller':
        user.role = 'seller';
        user.is_approved = true;
        break;
      case 'technician':
        user.technician_verified = true;
        break;
      case 'driver':
        user.driver_verified = true;
        break;
      case 'logistics':
        user.logistics_verified = true;
        break;
      case 'refurbisher':
        user.refurbisher_verified = true;
        break;
      default:
        return res.status(400).json({ error: `Unknown type: ${type}` });
    }

    await user.save();
    res.json({ success: true, message: `${type} approved successfully` });
  } catch (error) {
    console.error('Error approving user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Reject any role type
router.put('/reject/:type/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { type, id } = req.params;
    const { reason } = req.body;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    switch (type) {
      case 'seller':
        user.is_approved = false;
        user.rejection_reason = reason;
        break;
      case 'technician':
        user.technician_verified = false;
        user.rejection_reason = reason;
        break;
      case 'driver':
        user.driver_verified = false;
        user.rejection_reason = reason;
        break;
      case 'logistics':
        user.logistics_verified = false;
        user.rejection_reason = reason;
        break;
      case 'refurbisher':
        user.refurbisher_verified = false;
        user.rejection_reason = reason;
        break;
      default:
        return res.status(400).json({ error: `Unknown type: ${type}` });
    }

    await user.save();
    res.json({ success: true, message: `${type} rejected` });
  } catch (error) {
    console.error('Error rejecting user:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ URGENT SUPPORT TICKETS ============
router.get('/support-tickets/urgent', verifyToken, isAdmin, async (req, res) => {
  try {
    const tickets = await SupportTicket.findAll({
      where: { priority: 'high', status: 'open' },
      include: [{ model: User, as: 'User', attributes: ['id', 'name', 'email'] }],
      order: [['created_at', 'ASC']]
    });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete support ticket
router.delete('/support-tickets/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const ticket = await SupportTicket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    await ticket.destroy();
    res.json({ success: true, message: 'Ticket deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ ADMIN — TECHNICIAN MANAGEMENT ============

// Get ALL technicians (full detail)
router.get('/technicians', verifyToken, isAdmin, async (req, res) => {
  try {
    const { status, verified, search, limit = 50, offset = 0 } = req.query;

    const userWhere = { is_technician: true };
    if (verified === 'true') userWhere.technician_verified = true;
    if (verified === 'false') userWhere.technician_verified = false;
    if (search) {
      userWhere[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const profileWhere = {};
    if (status) profileWhere.approval_status = status;

    const technicians = await TechnicianProfile.findAll({
      where: profileWhere,
      include: [{
        model: User,
        as: 'User',
        where: userWhere,
        attributes: { exclude: ['password'] }
      }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({ success: true, data: technicians, total: technicians.length });
  } catch (error) {
    console.error('Admin get technicians error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single technician full detail + hire history
router.get('/technicians/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const profile = await TechnicianProfile.findOne({
      where: { user_id: req.params.id },
      include: [{
        model: User,
        as: 'User',
        attributes: { exclude: ['password'] }
      }]
    });

    if (!profile) return res.status(404).json({ error: 'Technician profile not found' });

    // Get hire history
    const hireHistory = await TechnicianHireRequest.findAll({
      where: { technician_id: req.params.id },
      include: [{
        model: User,
        as: 'Requester',
        attributes: ['id', 'name', 'email', 'store_name']
      }],
      order: [['created_at', 'DESC']],
      limit: 20
    });

    res.json({ success: true, data: { profile, hireHistory } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin approve technician profile
router.put('/technicians/:id/approve', verifyToken, isAdmin, async (req, res) => {
  try {
    const { notes } = req.body;
    const profile = await TechnicianProfile.findOne({ where: { user_id: req.params.id } });
    if (!profile) return res.status(404).json({ error: 'Technician not found' });

    profile.is_verified = true;
    profile.approval_status = 'approved';
    if (notes) profile.admin_notes = notes;
    await profile.save();

    // Sync user flags
    await User.update(
      { technician_verified: true },
      { where: { id: req.params.id } }
    );

    res.json({ success: true, message: 'Technician approved successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin reject technician profile
router.put('/technicians/:id/reject', verifyToken, isAdmin, async (req, res) => {
  try {
    const { reason, notes } = req.body;
    const profile = await TechnicianProfile.findOne({ where: { user_id: req.params.id } });
    if (!profile) return res.status(404).json({ error: 'Technician not found' });

    profile.is_verified = false;
    profile.approval_status = 'rejected';
    profile.rejection_reason = reason;
    if (notes) profile.admin_notes = notes;
    await profile.save();

    await User.update(
      { technician_verified: false, rejection_reason: reason },
      { where: { id: req.params.id } }
    );

    res.json({ success: true, message: 'Technician rejected' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin suspend technician
router.put('/technicians/:id/suspend', verifyToken, isAdmin, async (req, res) => {
  try {
    const { reason } = req.body;
    const profile = await TechnicianProfile.findOne({ where: { user_id: req.params.id } });
    if (!profile) return res.status(404).json({ error: 'Technician not found' });

    profile.is_verified = false;
    profile.is_available = false;
    profile.approval_status = 'suspended';
    profile.admin_notes = reason || 'Suspended by admin';
    await profile.save();

    res.json({ success: true, message: 'Technician suspended' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin update technician role/assignment
router.put('/technicians/:id/role', verifyToken, isAdmin, async (req, res) => {
  try {
    const { appointed_vendor_id, is_available, admin_notes } = req.body;
    const profile = await TechnicianProfile.findOne({ where: { user_id: req.params.id } });
    if (!profile) return res.status(404).json({ error: 'Technician not found' });

    if (appointed_vendor_id !== undefined) profile.appointed_vendor_id = appointed_vendor_id;
    if (is_available !== undefined) profile.is_available = is_available;
    if (admin_notes !== undefined) profile.admin_notes = admin_notes;
    await profile.save();

    res.json({ success: true, message: 'Technician role/assignment updated', data: profile });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ ADMIN — ALL HIRE REQUESTS PLATFORM-WIDE ============

// Get all hire requests
router.get('/technician-hires', verifyToken, isAdmin, async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    const where = {};
    if (status) where.status = status;

    const hires = await TechnicianHireRequest.findAll({
      where,
      include: [
        { model: User, as: 'Requester', attributes: ['id', 'name', 'email', 'store_name', 'role'] },
        { model: User, as: 'Technician', attributes: ['id', 'name', 'email', 'technician_rating', 'technician_address'] }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({ success: true, data: hires, total: hires.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin approve a hire request
router.put('/technician-hires/:id/approve', verifyToken, isAdmin, async (req, res) => {
  try {
    const { notes } = req.body;
    const hireReq = await TechnicianHireRequest.findByPk(req.params.id);
    if (!hireReq) return res.status(404).json({ error: 'Hire request not found' });

    hireReq.admin_approval = true;
    hireReq.status = 'admin_approved';
    hireReq.admin_notes = notes;
    hireReq.admin_reviewed_at = new Date();
    await hireReq.save();

    res.json({ success: true, message: 'Hire request approved by admin', data: hireReq });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin reject a hire request
router.put('/technician-hires/:id/reject', verifyToken, isAdmin, async (req, res) => {
  try {
    const { reason } = req.body;
    const hireReq = await TechnicianHireRequest.findByPk(req.params.id);
    if (!hireReq) return res.status(404).json({ error: 'Hire request not found' });

    hireReq.admin_approval = false;
    hireReq.status = 'admin_rejected';
    hireReq.rejection_reason = reason;
    hireReq.admin_reviewed_at = new Date();
    await hireReq.save();

    res.json({ success: true, message: 'Hire request rejected by admin', data: hireReq });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin technician stats
router.get('/technicians/stats/overview', verifyToken, isAdmin, async (req, res) => {
  try {
    const [total, verified, pending, rejected, suspended] = await Promise.all([
      TechnicianProfile.count(),
      TechnicianProfile.count({ where: { approval_status: 'approved' } }),
      TechnicianProfile.count({ where: { approval_status: 'pending' } }),
      TechnicianProfile.count({ where: { approval_status: 'rejected' } }),
      TechnicianProfile.count({ where: { approval_status: 'suspended' } })
    ]);

    const [totalHires, pendingHires, activeHires, completedHires] = await Promise.all([
      TechnicianHireRequest.count(),
      TechnicianHireRequest.count({ where: { status: 'pending' } }),
      TechnicianHireRequest.count({ where: { status: ['technician_accepted', 'admin_approved', 'in_progress'] } }),
      TechnicianHireRequest.count({ where: { status: 'completed' } })
    ]);

    res.json({
      success: true,
      technicians: { total, verified, pending, rejected, suspended },
      hires: { total: totalHires, pending: pendingHires, active: activeHires, completed: completedHires }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ ADMIN — DRIVER MANAGEMENT ============

// Get ALL drivers (full detail)
router.get('/drivers', verifyToken, isAdmin, async (req, res) => {
  try {
    const { status, verified, search, limit = 50, offset = 0 } = req.query;

    const userWhere = { is_driver: true };
    if (verified === 'true') userWhere.driver_verified = true;
    if (verified === 'false') userWhere.driver_verified = false;
    if (search) {
      userWhere[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const profileWhere = {};
    if (status) profileWhere.approval_status = status;

    const drivers = await DriverProfile.findAll({
      where: profileWhere,
      include: [{
        model: User,
        as: 'User',
        where: userWhere,
        attributes: { exclude: ['password'] }
      }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({ success: true, data: drivers, total: drivers.length });
  } catch (error) {
    console.error('Admin get drivers error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin driver stats overview — MUST be before /drivers/:id
router.get('/drivers/stats/overview', verifyToken, isAdmin, async (req, res) => {
  try {
    const [total, verified, pending, rejected, suspended] = await Promise.all([
      DriverProfile.count(),
      DriverProfile.count({ where: { approval_status: 'approved' } }),
      DriverProfile.count({ where: { approval_status: 'pending' } }),
      DriverProfile.count({ where: { approval_status: 'rejected' } }),
      DriverProfile.count({ where: { approval_status: 'suspended' } })
    ]);

    const [totalHires, pendingHires, activeHires, completedHires] = await Promise.all([
      DriverHireRequest.count(),
      DriverHireRequest.count({ where: { status: 'pending' } }),
      DriverHireRequest.count({ where: { status: ['driver_accepted', 'admin_approved', 'in_progress'] } }),
      DriverHireRequest.count({ where: { status: 'completed' } })
    ]);

    res.json({
      success: true,
      drivers: { total, verified, pending, rejected, suspended },
      hires: { total: totalHires, pending: pendingHires, active: activeHires, completed: completedHires }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single driver full detail + hire history
router.get('/drivers/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const profile = await DriverProfile.findOne({
      where: { user_id: req.params.id },
      include: [{ model: User, as: 'User', attributes: { exclude: ['password'] } }]
    });

    if (!profile) return res.status(404).json({ error: 'Driver profile not found' });

    const hireHistory = await DriverHireRequest.findAll({
      where: { driver_id: req.params.id },
      include: [{ model: User, as: 'Requester', attributes: ['id', 'name', 'email', 'store_name'] }],
      order: [['created_at', 'DESC']],
      limit: 20
    });

    res.json({ success: true, data: { profile, hireHistory } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin approve driver profile
router.put('/drivers/:id/approve', verifyToken, isAdmin, async (req, res) => {
  try {
    const { notes } = req.body;
    const profile = await DriverProfile.findOne({ where: { user_id: req.params.id } });
    if (!profile) return res.status(404).json({ error: 'Driver not found' });

    profile.is_verified = true;
    profile.approval_status = 'approved';
    if (notes) profile.admin_notes = notes;
    await profile.save();

    await User.update({ driver_verified: true }, { where: { id: req.params.id } });

    res.json({ success: true, message: 'Driver approved successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin reject driver profile
router.put('/drivers/:id/reject', verifyToken, isAdmin, async (req, res) => {
  try {
    const { reason, notes } = req.body;
    const profile = await DriverProfile.findOne({ where: { user_id: req.params.id } });
    if (!profile) return res.status(404).json({ error: 'Driver not found' });

    profile.is_verified = false;
    profile.approval_status = 'rejected';
    profile.rejection_reason = reason;
    if (notes) profile.admin_notes = notes;
    await profile.save();

    await User.update({ driver_verified: false, rejection_reason: reason }, { where: { id: req.params.id } });

    res.json({ success: true, message: 'Driver rejected' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin suspend driver
router.put('/drivers/:id/suspend', verifyToken, isAdmin, async (req, res) => {
  try {
    const { reason } = req.body;
    const profile = await DriverProfile.findOne({ where: { user_id: req.params.id } });
    if (!profile) return res.status(404).json({ error: 'Driver not found' });

    profile.is_verified = false;
    profile.is_available = false;
    profile.approval_status = 'suspended';
    profile.admin_notes = reason || 'Suspended by admin';
    await profile.save();

    res.json({ success: true, message: 'Driver suspended' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin update driver role/assignment
router.put('/drivers/:id/role', verifyToken, isAdmin, async (req, res) => {
  try {
    const { appointed_vendor_id, is_available, admin_notes } = req.body;
    const profile = await DriverProfile.findOne({ where: { user_id: req.params.id } });
    if (!profile) return res.status(404).json({ error: 'Driver not found' });

    if (appointed_vendor_id !== undefined) profile.appointed_vendor_id = appointed_vendor_id;
    if (is_available !== undefined) profile.is_available = is_available;
    if (admin_notes !== undefined) profile.admin_notes = admin_notes;
    await profile.save();

    res.json({ success: true, message: 'Driver role/assignment updated', data: profile });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ ADMIN — ALL DRIVER HIRE REQUESTS ============

// Get all driver hire requests
router.get('/driver-hires', verifyToken, isAdmin, async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    const where = {};
    if (status) where.status = status;

    const hires = await DriverHireRequest.findAll({
      where,
      include: [
        { model: User, as: 'Requester', attributes: ['id', 'name', 'email', 'store_name', 'role'] },
        { model: User, as: 'Driver', attributes: ['id', 'name', 'email', 'driver_rating', 'driver_home_city', 'driver_vehicle_type'] }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({ success: true, data: hires, total: hires.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin approve a driver hire request
router.put('/driver-hires/:id/approve', verifyToken, isAdmin, async (req, res) => {
  try {
    const { notes } = req.body;
    const hireReq = await DriverHireRequest.findByPk(req.params.id);
    if (!hireReq) return res.status(404).json({ error: 'Hire request not found' });

    hireReq.admin_approval = true;
    hireReq.status = 'admin_approved';
    hireReq.admin_notes = notes;
    hireReq.admin_reviewed_at = new Date();
    await hireReq.save();

    res.json({ success: true, message: 'Driver hire request approved', data: hireReq });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin reject a driver hire request
router.put('/driver-hires/:id/reject', verifyToken, isAdmin, async (req, res) => {
  try {
    const { reason } = req.body;
    const hireReq = await DriverHireRequest.findByPk(req.params.id);
    if (!hireReq) return res.status(404).json({ error: 'Hire request not found' });

    hireReq.admin_approval = false;
    hireReq.status = 'admin_rejected';
    hireReq.rejection_reason = reason;
    hireReq.admin_reviewed_at = new Date();
    await hireReq.save();

    res.json({ success: true, message: 'Driver hire request rejected', data: hireReq });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

