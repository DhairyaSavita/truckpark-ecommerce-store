const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const DriverProfile = require('../../models/DriverProfile');
const { verifyToken } = require('../../config/auth');

// Register as driver
router.post('/register', verifyToken, async (req, res) => {
  try {
    const {
      license_number,
      license_expiry,
      experience_years,
      hourly_rate,
      daily_rate,
      home_city,
      vehicle_type,
      license_classes,
      bio,
      preferred_routes
    } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already a driver
    const existingProfile = await DriverProfile.findOne({ where: { user_id: req.user.id } });
    if (existingProfile) {
      return res.status(400).json({ error: 'Already registered as driver' });
    }

    // Create driver profile
    const profile = await DriverProfile.create({
      user_id: req.user.id,
      license_number,
      license_expiry,
      experience_years: experience_years || 0,
      hourly_rate,
      daily_rate,
      home_city,
      vehicle_type,
      license_classes: license_classes || [],
      bio,
      preferred_routes: preferred_routes || [],
      is_verified: false,
      is_available: true
    });

    // Update user
    user.is_driver = true;
    user.driver_verified = false;
    user.driver_license_number = license_number;
    user.driver_license_expiry = license_expiry;
    user.driver_experience_years = experience_years || 0;
    user.driver_hourly_rate = hourly_rate;
    user.driver_daily_rate = daily_rate;
    user.driver_home_city = home_city;
    user.driver_vehicle_type = vehicle_type;
    user.driver_license_classes = license_classes || [];
    user.driver_bio = bio;
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Driver registration submitted. Awaiting verification.',
      profile
    });
  } catch (error) {
    console.error('Error registering driver:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get driver profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const profile = await DriverProfile.findOne({
      where: { user_id: req.user.id }
    });
    
    if (!profile) {
      return res.status(404).json({ error: 'Driver profile not found' });
    }
    
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update driver profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const profile = await DriverProfile.findOne({ where: { user_id: req.user.id } });
    if (!profile) {
      return res.status(404).json({ error: 'Driver profile not found' });
    }
    
    await profile.update(req.body);
    res.json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update availability
router.put('/availability', verifyToken, async (req, res) => {
  try {
    const { is_available, current_location_lat, current_location_lng } = req.body;
    const profile = await DriverProfile.findOne({ where: { user_id: req.user.id } });
    
    if (!profile) {
      return res.status(404).json({ error: 'Driver profile not found' });
    }
    
    profile.is_available = is_available;
    if (current_location_lat) profile.current_location_lat = current_location_lat;
    if (current_location_lng) profile.current_location_lng = current_location_lng;
    await profile.save();
    
    res.json({ success: true, is_available: profile.is_available });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
