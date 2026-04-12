const express = require('express');
const router = express.Router();
const TripRequest = require('../../models/TripRequest');
const DriverProfile = require('../../models/DriverProfile');
const User = require('../../models/User');
const { verifyToken } = require('../../config/auth');

// Get available trips (for drivers)
router.get('/available', verifyToken, async (req, res) => {
  try {
    const driver = await DriverProfile.findOne({ where: { user_id: req.user.id } });
    if (!driver) {
      return res.status(404).json({ error: 'Driver profile not found' });
    }
    
    const trips = await TripRequest.findAll({
      where: {
        status: 'pending',
        driver_id: null
      },
      include: [
        { model: User, as: 'Customer', attributes: ['id', 'name', 'email', 'phone'] }
      ],
      order: [['trip_date', 'ASC']],
      limit: 20
    });
    
    res.json(trips);
  } catch (error) {
    console.error('Error fetching available trips:', error);
    res.status(500).json({ error: error.message });
  }
});

// Accept trip
router.post('/:id/accept', verifyToken, async (req, res) => {
  try {
    const trip = await TripRequest.findByPk(req.params.id);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    
    if (trip.status !== 'pending') {
      return res.status(400).json({ error: 'Trip already accepted' });
    }
    
    trip.driver_id = req.user.id;
    trip.status = 'accepted';
    await trip.save();
    
    res.json({ success: true, message: 'Trip accepted', trip });
  } catch (error) {
    console.error('Error accepting trip:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get driver's trips
router.get('/my-trips', verifyToken, async (req, res) => {
  try {
    const trips = await TripRequest.findAll({
      where: { driver_id: req.user.id },
      include: [
        { model: User, as: 'Customer', attributes: ['id', 'name', 'email', 'phone'] }
      ],
      order: [['trip_date', 'DESC']]
    });
    
    res.json(trips);
  } catch (error) {
    console.error('Error fetching driver trips:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update trip status
router.put('/:id/status', verifyToken, async (req, res) => {
  try {
    const { status, final_cost } = req.body;
    const trip = await TripRequest.findByPk(req.params.id);
    
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    
    if (trip.driver_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    trip.status = status;
    if (final_cost) trip.final_cost = final_cost;
    await trip.save();
    
    res.json({ success: true, trip });
  } catch (error) {
    console.error('Error updating trip status:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get driver earnings
router.get('/earnings', verifyToken, async (req, res) => {
  try {
    const completedTrips = await TripRequest.findAll({
      where: {
        driver_id: req.user.id,
        status: 'completed'
      }
    });
    
    const totalEarnings = completedTrips.reduce((sum, trip) => sum + (trip.final_cost || trip.estimated_cost || 0), 0);
    const pendingEarnings = await TripRequest.sum('estimated_cost', {
      where: {
        driver_id: req.user.id,
        status: 'accepted',
        payment_status: 'pending'
      }
    });
    
    res.json({
      total_earnings: totalEarnings,
      pending_earnings: pendingEarnings || 0,
      completed_trips: completedTrips.length,
      trips: completedTrips
    });
  } catch (error) {
    console.error('Error fetching earnings:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
