const express = require('express');
const router = express.Router();
const ServiceRequest = require('../../models/ServiceRequest');
const TechnicianProfile = require('../../models/TechnicianProfile');
const User = require('../../models/User');
const Product = require('../../models/Product');
const ServiceReview = require('../../models/ServiceReview');
const { verifyToken } = require('../../config/auth');
const { Op } = require('sequelize');

// Create service request
router.post('/', verifyToken, async (req, res) => {
  try {
    const {
      product_id,
      title,
      description,
      service_type,
      scheduled_date,
      scheduled_time,
      service_address,
      customer_lat,
      customer_lng,
      estimated_duration
    } = req.body;
    
    // Calculate estimated cost
    let estimated_cost = 500; // Default base price
    if (estimated_duration) {
      const avgRate = await TechnicianProfile.findAll({
        where: { is_verified: true, is_available: true },
        attributes: [[sequelize.fn('AVG', sequelize.col('hourly_rate')), 'avgRate']]
      });
      const avgHourlyRate = avgRate[0]?.dataValues.avgRate || 500;
      estimated_cost = avgHourlyRate * estimated_duration;
    }
    
    const request = await ServiceRequest.create({
      customer_id: req.user.id,
      product_id: product_id || null,
      title,
      description,
      service_type: service_type || 'installation',
      status: 'pending',
      priority: 'normal',
      scheduled_date,
      scheduled_time,
      service_address,
      customer_lat,
      customer_lng,
      estimated_duration,
      estimated_cost
    });
    
    res.status(201).json({ success: true, request });
  } catch (error) {
    console.error('Error creating service request:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get customer's service requests
router.get('/my-requests', verifyToken, async (req, res) => {
  try {
    const requests = await ServiceRequest.findAll({
      where: { customer_id: req.user.id },
      include: [
        { model: User, as: 'Technician', attributes: ['id', 'name', 'email', 'phone'] },
        { model: Product, attributes: ['id', 'name', 'price', 'image_url'] }
      ],
      order: [['created_at', 'DESC']]
    });
    
    res.json(requests);
  } catch (error) {
    console.error('Error fetching customer requests:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get available technicians
router.get('/technicians/nearby', verifyToken, async (req, res) => {
  try {
    const { lat, lng, radius = 50 } = req.query;
    
    const technicians = await TechnicianProfile.findAll({
      where: {
        is_verified: true,
        is_available: true
      },
      include: [{ model: User, attributes: ['id', 'name', 'email', 'phone', 'technician_rating'] }],
      limit: 20
    });
    
    res.json(technicians);
  } catch (error) {
    console.error('Error fetching nearby technicians:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rate technician after service
router.post('/:id/rate', verifyToken, async (req, res) => {
  try {
    const { rating, review, timeliness_rating, quality_rating, communication_rating } = req.body;
    const request = await ServiceRequest.findByPk(req.params.id);
    
    if (!request || request.customer_id !== req.user.id) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    if (request.status !== 'completed') {
      return res.status(400).json({ error: 'Can only rate completed services' });
    }
    
    // Create review
    const serviceReview = await ServiceReview.create({
      service_request_id: request.id,
      customer_id: req.user.id,
      technician_id: request.technician_id,
      rating,
      review,
      timeliness_rating,
      quality_rating,
      communication_rating
    });
    
    // Update technician rating
    const allReviews = await ServiceReview.findAll({
      where: { technician_id: request.technician_id }
    });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    
    await TechnicianProfile.update(
      { rating: avgRating },
      { where: { user_id: request.technician_id } }
    );
    
    res.json({ success: true, review: serviceReview });
  } catch (error) {
    console.error('Error rating technician:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
