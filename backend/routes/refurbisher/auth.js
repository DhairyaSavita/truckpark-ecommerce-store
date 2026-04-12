const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const { verifyToken } = require('../../config/auth');

// Register as refurbisher/scrap dealer
router.post('/register', verifyToken, async (req, res) => {
  try {
    const {
      company_name,
      gst_number,
      warehouse_address,
      license_number
    } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.is_refurbisher) {
      return res.status(400).json({ error: 'Already registered as refurbisher' });
    }

    user.is_refurbisher = true;
    user.refurbisher_company_name = company_name;
    user.refurbisher_gst = gst_number;
    user.refurbisher_verified = false;
    user.refurbisher_warehouse_address = warehouse_address;
    user.refurbisher_license_number = license_number;
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Refurbisher registration submitted. Awaiting verification.',
      user
    });
  } catch (error) {
    console.error('Error registering refurbisher:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get refurbisher profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
