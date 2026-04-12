const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const TechnicianProfile = require('../../models/TechnicianProfile');
const { verifyToken } = require('../../config/auth');

// Register as technician
router.post('/register', verifyToken, async (req, res) => {
  try {
    const {
      specialization,
      experience_years,
      license_number,
      hourly_rate,
      service_radius,
      address,
      bio,
      location_lat,
      location_lng
    } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already a technician
    const existingProfile = await TechnicianProfile.findOne({ where: { user_id: req.user.id } });
    if (existingProfile) {
      return res.status(400).json({ error: 'Already registered as technician' });
    }

    // Create technician profile
    const profile = await TechnicianProfile.create({
      user_id: req.user.id,
      specialization: specialization || [],
      experience_years: experience_years || 0,
      license_number,
      hourly_rate,
      service_radius: service_radius || 50,
      address,
      bio,
      location_lat,
      location_lng,
      is_verified: false,
      is_available: true
    });

    // Update user role
    user.is_technician = true;
    user.technician_verified = false;
    user.technician_experience = experience_years || 0;
    user.technician_specialization = specialization || [];
    user.technician_license_number = license_number;
    user.technician_hourly_rate = hourly_rate;
    user.technician_service_radius = service_radius || 50;
    user.technician_address = address;
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Technician registration submitted. Awaiting verification.',
      profile
    });
  } catch (error) {
    console.error('Error registering technician:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get technician profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const profile = await TechnicianProfile.findOne({
      where: { user_id: req.user.id }
    });
    
    if (!profile) {
      return res.status(404).json({ error: 'Technician profile not found' });
    }
    
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update technician profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const profile = await TechnicianProfile.findOne({ where: { user_id: req.user.id } });
    if (!profile) {
      return res.status(404).json({ error: 'Technician profile not found' });
    }
    
    await profile.update(req.body);
    res.json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update availability status
router.put('/availability', verifyToken, async (req, res) => {
  try {
    const { is_available } = req.body;
    const profile = await TechnicianProfile.findOne({ where: { user_id: req.user.id } });
    
    if (!profile) {
      return res.status(404).json({ error: 'Technician profile not found' });
    }
    
    profile.is_available = is_available;
    await profile.save();
    
    res.json({ success: true, is_available: profile.is_available });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
