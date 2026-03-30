const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken, verifyToken } = require('../config/auth');

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    const user = await User.create({ name, email, password, phone, address });
    const token = generateToken(user);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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

// Become seller
router.post('/become-seller', verifyToken, async (req, res) => {
  try {
    const { store_name, store_description, bank_account, bank_name, tax_id } = req.body;
    
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    user.store_name = store_name;
    user.store_description = store_description;
    user.bank_account = bank_account;
    user.bank_name = bank_name;
    user.tax_id = tax_id;
    user.role = 'seller';
    user.is_approved = false;
    await user.save();
    
    res.json({ message: 'Seller application submitted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;
// Become seller
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
    
    user.store_name = store_name;
    user.store_description = store_description;
    user.bank_account = bank_account;
    user.bank_name = bank_name;
    user.tax_id = tax_id;
    user.role = 'seller';
    user.is_approved = null; // Pending approval
    await user.save();
    
    // Notify admin about new seller application
    const Notification = require('../models/Notification');
    await Notification.create({
      user_id: 1, // Admin user ID
      title: 'New Seller Application',
      message: `${user.name} has applied to become a seller. Store: ${store_name}`,
      type: 'system'
    });
    
    res.json({ message: 'Seller application submitted successfully. Awaiting admin approval.' });
  } catch (error) {
    console.error('Error in become seller:', error);
    res.status(500).json({ error: error.message });
  }
});
