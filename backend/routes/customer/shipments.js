const express = require('express');
const router = express.Router();
const ShipmentRequest = require('../../models/ShipmentRequest');
const LogisticsProfile = require('../../models/LogisticsProfile');
const User = require('../../models/User');
const { verifyToken } = require('../../config/auth');

// Create shipment request
router.post('/', verifyToken, async (req, res) => {
  try {
    const {
      pickup_address,
      delivery_address,
      pickup_city,
      delivery_city,
      pickup_pincode,
      delivery_pincode,
      weight_kg,
      dimensions,
      goods_type,
      is_fragile,
      is_hazardous,
      special_instructions,
      pickup_date
    } = req.body;
    
    // Calculate estimated cost (simplified: ₹10 per kg + ₹500 base)
    const estimated_cost = (weight_kg || 0) * 10 + 500;
    
    const shipment = await ShipmentRequest.create({
      customer_id: req.user.id,
      pickup_address,
      delivery_address,
      pickup_city,
      delivery_city,
      pickup_pincode,
      delivery_pincode,
      weight_kg: weight_kg || 0,
      dimensions,
      goods_type,
      is_fragile: is_fragile || false,
      is_hazardous: is_hazardous || false,
      special_instructions,
      pickup_date,
      estimated_cost,
      status: 'pending'
    });
    
    res.status(201).json({ success: true, shipment });
  } catch (error) {
    console.error('Error creating shipment request:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get customer's shipments
router.get('/my-shipments', verifyToken, async (req, res) => {
  try {
    const shipments = await ShipmentRequest.findAll({
      where: { customer_id: req.user.id },
      include: [
        { model: User, as: 'Logistics', attributes: ['id', 'name', 'logistics_company_name', 'logistics_rating'] }
      ],
      order: [['pickup_date', 'DESC']]
    });
    
    res.json(shipments);
  } catch (error) {
    console.error('Error fetching customer shipments:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get available logistics companies
router.get('/logistics/nearby', verifyToken, async (req, res) => {
  try {
    const logistics = await LogisticsProfile.findAll({
      where: {
        is_verified: true
      },
      include: [{ model: User, attributes: ['id', 'name', 'email', 'phone', 'logistics_rating'] }],
      limit: 20
    });
    
    res.json(logistics);
  } catch (error) {
    console.error('Error fetching logistics companies:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rate logistics company
router.post('/:id/rate', verifyToken, async (req, res) => {
  try {
    const { rating, review, timeliness_rating, packaging_rating, communication_rating, value_rating } = req.body;
    const LogisticsReview = require('../../models/LogisticsReview');
    const shipment = await ShipmentRequest.findByPk(req.params.id);
    
    if (!shipment || shipment.customer_id !== req.user.id) {
      return res.status(404).json({ error: 'Shipment not found' });
    }
    
    if (shipment.status !== 'delivered') {
      return res.status(400).json({ error: 'Can only rate delivered shipments' });
    }
    
    const logisticsReview = await LogisticsReview.create({
      shipment_request_id: shipment.id,
      customer_id: req.user.id,
      logistics_id: shipment.logistics_id,
      rating,
      review,
      timeliness_rating,
      packaging_rating,
      communication_rating,
      value_rating
    });
    
    // Update logistics rating
    const allReviews = await LogisticsReview.findAll({
      where: { logistics_id: shipment.logistics_id }
    });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    
    await LogisticsProfile.update(
      { rating: avgRating },
      { where: { user_id: shipment.logistics_id } }
    );
    
    res.json({ success: true, review: logisticsReview });
  } catch (error) {
    console.error('Error rating logistics:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
