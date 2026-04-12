const express = require('express');
const router = express.Router();
const TripRequest = require('../../models/TripRequest');
const DriverProfile = require('../../models/DriverProfile');
const User = require('../../models/User');
const DriverReview = require('../../models/DriverReview');
const { verifyToken } = require('../../config/auth');

// Create trip request
router.post('/', verifyToken, async (req, res) => {
  try {
    const {
      title,
      description,
      pickup_location,
      dropoff_location,
      pickup_lat,
      pickup_lng,
      dropoff_lat,
      dropoff_lng,
      trip_date,
      trip_time,
      distance_km,
      estimated_duration,
      vehicle_type,
      load_type,
      load_weight,
      special_requirements
    } = req.body;
    
    // Calculate estimated cost
    let estimated_cost = 0;
    if (distance_km) {
      const avgRate = await DriverProfile.findAll({
        where: { is_verified: true, is_available: true },
        attributes: [[sequelize.fn('AVG', sequelize.col('hourly_rate')), 'avgRate']]
      });
      const avgHourlyRate = avgRate[0]?.dataValues.avgRate || 500;
      estimated_cost = avgHourlyRate * (estimated_duration || 2);
    }
    
    const trip = await TripRequest.create({
      customer_id: req.user.id,
      title,
      description,
      pickup_location,
      dropoff_location,
      pickup_lat,
      pickup_lng,
      dropoff_lat,
      dropoff_lng,
      trip_date,
      trip_time,
      distance_km,
      estimated_duration,
      estimated_cost,
      vehicle_type,
      load_type,
      load_weight,
      special_requirements,
      status: 'pending'
    });
    
    res.status(201).json({ success: true, trip });
  } catch (error) {
    console.error('Error creating trip request:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get customer's trips
router.get('/my-trips', verifyToken, async (req, res) => {
  try {
    const trips = await TripRequest.findAll({
      where: { customer_id: req.user.id },
      include: [
        { model: User, as: 'Driver', attributes: ['id', 'name', 'email', 'phone', 'driver_rating'] }
      ],
      order: [['trip_date', 'DESC']]
    });
    
    res.json(trips);
  } catch (error) {
    console.error('Error fetching customer trips:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get available drivers
router.get('/drivers/nearby', verifyToken, async (req, res) => {
  try {
    const { lat, lng, radius = 100 } = req.query;
    
    const drivers = await DriverProfile.findAll({
      where: {
        is_verified: true,
        is_available: true
      },
      include: [{ model: User, attributes: ['id', 'name', 'email', 'phone', 'driver_rating'] }],
      limit: 20
    });
    
    res.json(drivers);
  } catch (error) {
    console.error('Error fetching nearby drivers:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rate driver after trip
router.post('/:id/rate', verifyToken, async (req, res) => {
  try {
    const { rating, review, punctuality_rating, driving_skill_rating, communication_rating } = req.body;
    const trip = await TripRequest.findByPk(req.params.id);
    
    if (!trip || trip.customer_id !== req.user.id) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    
    if (trip.status !== 'completed') {
      return res.status(400).json({ error: 'Can only rate completed trips' });
    }
    
    const driverReview = await DriverReview.create({
      trip_request_id: trip.id,
      customer_id: req.user.id,
      driver_id: trip.driver_id,
      rating,
      review,
      punctuality_rating,
      driving_skill_rating,
      communication_rating
    });
    
    // Update driver rating
    const allReviews = await DriverReview.findAll({
      where: { driver_id: trip.driver_id }
    });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    
    await DriverProfile.update(
      { rating: avgRating },
      { where: { user_id: trip.driver_id } }
    );
    
    res.json({ success: true, review: driverReview });
  } catch (error) {
    console.error('Error rating driver:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
