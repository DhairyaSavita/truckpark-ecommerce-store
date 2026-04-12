const express = require('express');
const router = express.Router();
const ServiceRequest = require('../../models/ServiceRequest');
const TechnicianProfile = require('../../models/TechnicianProfile');
const User = require('../../models/User');
const Product = require('../../models/Product');
const { verifyToken } = require('../../config/auth');
const { Op } = require('sequelize');

// Get nearby service requests (for technicians)
router.get('/nearby', verifyToken, async (req, res) => {
  try {
    const technician = await TechnicianProfile.findOne({ where: { user_id: req.user.id } });
    if (!technician) {
      return res.status(404).json({ error: 'Technician profile not found' });
    }
    
    // Get pending requests
    const requests = await ServiceRequest.findAll({
      where: {
        status: 'pending',
        technician_id: null
      },
      include: [
        { model: User, as: 'Customer', attributes: ['id', 'name', 'email', 'phone'] },
        { model: Product, attributes: ['id', 'name', 'price'] }
      ],
      order: [['created_at', 'ASC']],
      limit: 20
    });
    
    res.json(requests);
  } catch (error) {
    console.error('Error fetching nearby requests:', error);
    res.status(500).json({ error: error.message });
  }
});

// Accept service request
router.post('/:id/accept', verifyToken, async (req, res) => {
  try {
    const request = await ServiceRequest.findByPk(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Service request not found' });
    }
    
    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Request already accepted' });
    }
    
    request.technician_id = req.user.id;
    request.status = 'accepted';
    await request.save();
    
    res.json({ success: true, message: 'Service request accepted', request });
  } catch (error) {
    console.error('Error accepting request:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get technician's assigned requests
router.get('/my-requests', verifyToken, async (req, res) => {
  try {
    const requests = await ServiceRequest.findAll({
      where: { technician_id: req.user.id },
      include: [
        { model: User, as: 'Customer', attributes: ['id', 'name', 'email', 'phone', 'address'] },
        { model: Product, attributes: ['id', 'name', 'price', 'image_url'] }
      ],
      order: [['created_at', 'DESC']]
    });
    
    res.json(requests);
  } catch (error) {
    console.error('Error fetching technician requests:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update request status (start service, complete, etc.)
router.put('/:id/status', verifyToken, async (req, res) => {
  try {
    const { status, final_cost, notes } = req.body;
    const request = await ServiceRequest.findByPk(req.params.id);
    
    if (!request) {
      return res.status(404).json({ error: 'Service request not found' });
    }
    
    if (request.technician_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    request.status = status;
    if (final_cost) request.final_cost = final_cost;
    if (notes) request.notes = notes;
    await request.save();
    
    res.json({ success: true, request });
  } catch (error) {
    console.error('Error updating request status:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get technician earnings
router.get('/earnings', verifyToken, async (req, res) => {
  try {
    const completedRequests = await ServiceRequest.findAll({
      where: {
        technician_id: req.user.id,
        status: 'completed'
      }
    });
    
    const totalEarnings = completedRequests.reduce((sum, req) => sum + (req.final_cost || req.estimated_cost || 0), 0);
    const pendingEarnings = await ServiceRequest.sum('estimated_cost', {
      where: {
        technician_id: req.user.id,
        status: 'accepted',
        payment_status: 'pending'
      }
    });
    
    res.json({
      total_earnings: totalEarnings,
      pending_earnings: pendingEarnings || 0,
      completed_jobs: completedRequests.length,
      requests: completedRequests
    });
  } catch (error) {
    console.error('Error fetching earnings:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
