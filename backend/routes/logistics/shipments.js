const express = require('express');
const router = express.Router();
const ShipmentRequest = require('../../models/ShipmentRequest');
const LogisticsProfile = require('../../models/LogisticsProfile');
const User = require('../../models/User');
const { verifyToken } = require('../../config/auth');

// Get available shipments (for logistics companies)
router.get('/available', verifyToken, async (req, res) => {
  try {
    const shipments = await ShipmentRequest.findAll({
      where: {
        status: 'pending',
        logistics_id: null
      },
      include: [
        { model: User, as: 'Customer', attributes: ['id', 'name', 'email', 'phone'] }
      ],
      order: [['pickup_date', 'ASC']],
      limit: 20
    });
    res.json(shipments);
  } catch (error) {
    console.error('Error fetching available shipments:', error);
    res.status(500).json({ error: error.message });
  }
});

// Accept shipment
router.post('/:id/accept', verifyToken, async (req, res) => {
  try {
    const shipment = await ShipmentRequest.findByPk(req.params.id);
    if (!shipment) {
      return res.status(404).json({ error: 'Shipment not found' });
    }
    
    if (shipment.status !== 'pending') {
      return res.status(400).json({ error: 'Shipment already accepted' });
    }
    
    shipment.logistics_id = req.user.id;
    shipment.status = 'accepted';
    await shipment.save();
    
    res.json({ success: true, message: 'Shipment accepted', shipment });
  } catch (error) {
    console.error('Error accepting shipment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get logistics company's shipments
router.get('/my-shipments', verifyToken, async (req, res) => {
  try {
    const shipments = await ShipmentRequest.findAll({
      where: { logistics_id: req.user.id },
      include: [
        { model: User, as: 'Customer', attributes: ['id', 'name', 'email', 'phone'] }
      ],
      order: [['pickup_date', 'DESC']]
    });
    res.json(shipments);
  } catch (error) {
    console.error('Error fetching logistics shipments:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update shipment status
router.put('/:id/status', verifyToken, async (req, res) => {
  try {
    const { status, tracking_number, final_cost } = req.body;
    const shipment = await ShipmentRequest.findByPk(req.params.id);
    
    if (!shipment) {
      return res.status(404).json({ error: 'Shipment not found' });
    }
    
    if (shipment.logistics_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    shipment.status = status;
    if (tracking_number) shipment.tracking_number = tracking_number;
    if (final_cost) shipment.final_cost = final_cost;
    await shipment.save();
    
    res.json({ success: true, shipment });
  } catch (error) {
    console.error('Error updating shipment status:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get logistics earnings
router.get('/earnings', verifyToken, async (req, res) => {
  try {
    const completedShipments = await ShipmentRequest.findAll({
      where: {
        logistics_id: req.user.id,
        status: 'delivered'
      }
    });
    
    const totalEarnings = completedShipments.reduce((sum, s) => sum + (s.final_cost || s.estimated_cost || 0), 0);
    const pendingEarnings = await ShipmentRequest.sum('estimated_cost', {
      where: {
        logistics_id: req.user.id,
        status: 'accepted',
        payment_status: 'pending'
      }
    });
    
    res.json({
      total_earnings: totalEarnings,
      pending_earnings: pendingEarnings || 0,
      completed_shipments: completedShipments.length,
      shipments: completedShipments
    });
  } catch (error) {
    console.error('Error fetching earnings:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
