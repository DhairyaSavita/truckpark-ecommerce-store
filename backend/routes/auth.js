const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken, verifyToken } = require('../config/auth');

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    const user = await User.create({
      name,
      email,
      password,
      phone,
      address,
      role: 'user'
    });
    
    const token = generateToken(user);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = generateToken(user);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Become Seller - FIXED
router.post('/become-seller', verifyToken, async (req, res) => {
  try {
    const { store_name, store_description, bank_account, bank_name, tax_id } = req.body;
    
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if already a seller
    if (user.role === 'seller') {
      return res.status(400).json({ error: 'You are already a seller' });
    }
    
    // Update user with seller info - role remains 'user' until approved
    user.store_name = store_name;
    user.store_description = store_description;
    user.bank_account = bank_account;
    user.bank_name = bank_name;
    user.tax_id = tax_id;
    user.is_approved = false; // Pending approval (null or false means pending)
    user.role = 'user'; // Keep as user until approved
    
    await user.save();
    
    console.log(`📝 Seller application submitted by: ${user.name} (${user.email})`);
    console.log(`   Store: ${store_name}`);
    
    res.json({ 
      success: true,
      message: 'Seller application submitted successfully! Admin will review and approve within 24-48 hours.',
      status: 'pending'
    });
  } catch (error) {
    console.error('Error in become seller:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin approve seller
router.put('/approve-seller/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const seller = await User.findByPk(req.params.id);
    if (!seller) {
      return res.status(404).json({ error: 'Seller not found' });
    }
    
    // Update to seller role
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

// Admin reject seller
router.put('/reject-seller/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { reason } = req.body;
    const seller = await User.findByPk(req.params.id);
    if (!seller) {
      return res.status(404).json({ error: 'Seller not found' });
    }
    
    seller.is_approved = false;
    seller.rejection_reason = reason || 'No specific reason provided';
    seller.role = 'user'; // Keep as user
    await seller.save();
    
    console.log(`❌ Seller rejected: ${seller.name} (${seller.email}) - Reason: ${reason}`);
    
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

// Get pending seller applications (Admin only)
router.get('/pending-sellers', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const pendingSellers = await User.findAll({
      where: { 
        role: 'user',
        is_approved: false,
        store_name: { [Op.not]: null }
      },
      attributes: { exclude: ['password'] }
    });
    
    res.json(pendingSellers);
  } catch (error) {
    console.error('Error fetching pending sellers:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
