const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const LogisticsProfile = require('../../models/LogisticsProfile');
const { verifyToken } = require('../../config/auth');

// Register as logistics company
router.post('/register', verifyToken, async (req, res) => {
  try {
    const {
      company_name,
      gst_number,
      registration_number,
      year_established,
      vehicle_count,
      service_pincodes,
      insurance_available,
      tracking_available,
      website,
      description
    } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already a logistics company
    const existingProfile = await LogisticsProfile.findOne({ where: { user_id: req.user.id } });
    if (existingProfile) {
      return res.status(400).json({ error: 'Already registered as logistics company' });
    }

    // Create logistics profile
    const profile = await LogisticsProfile.create({
      user_id: req.user.id,
      company_name,
      gst_number,
      registration_number,
      year_established: year_established || null,
      vehicle_count: vehicle_count || 0,
      service_pincodes: service_pincodes || [],
      insurance_available: insurance_available || false,
      tracking_available: tracking_available || false,
      website,
      description,
      is_verified: false
    });

    // Update user
    user.is_logistics = true;
    user.logistics_company_name = company_name;
    user.logistics_gst_number = gst_number;
    user.logistics_verified = false;
    user.logistics_vehicle_count = vehicle_count || 0;
    user.logistics_service_pincodes = service_pincodes || [];
    user.logistics_insurance_available = insurance_available || false;
    user.logistics_tracking_available = tracking_available || false;
    user.logistics_website = website;
    user.logistics_description = description;
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Logistics company registration submitted. Awaiting verification.',
      profile
    });
  } catch (error) {
    console.error('Error registering logistics:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get logistics profile
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

// Update logistics profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    await user.update(req.body);
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
