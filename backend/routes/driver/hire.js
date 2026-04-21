const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const DriverHireRequest = require('../../models/DriverHireRequest');
const DriverProfile = require('../../models/DriverProfile');
const User = require('../../models/User');
const { verifyToken } = require('../../config/auth');

// ============================================================
// PUBLIC — Browse available verified drivers
// GET /api/driver/hire/browse
// ============================================================
router.get('/browse', async (req, res) => {
  try {
    const {
      vehicle_type, min_rating, max_daily_rate, search,
      is_available, limit = 20, offset = 0
    } = req.query;

    const profileWhere = { is_verified: true };
    if (is_available !== undefined) profileWhere.is_available = is_available === 'true';
    if (min_rating) profileWhere.rating = { [Op.gte]: parseFloat(min_rating) };
    if (max_daily_rate) profileWhere.daily_rate = { [Op.lte]: parseFloat(max_daily_rate) };
    if (vehicle_type) profileWhere.vehicle_type = { [Op.iLike]: `%${vehicle_type}%` };

    const userWhere = { is_driver: true };
    if (search) {
      userWhere[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { driver_home_city: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const profiles = await DriverProfile.findAll({
      where: profileWhere,
      include: [{
        model: User,
        as: 'User',
        where: userWhere,
        attributes: ['id', 'name', 'email', 'phone', 'driver_home_city', 'driver_rating',
                     'driver_completed_trips', 'driver_vehicle_type', 'driver_license_classes']
      }],
      order: [['rating', 'DESC'], ['completed_trips', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({ success: true, data: profiles, total: profiles.length });
  } catch (error) {
    console.error('Browse drivers error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// PUBLIC — Get single driver public profile
// GET /api/driver/hire/:driverId/profile
// ============================================================
router.get('/:driverId/profile', async (req, res) => {
  try {
    const profile = await DriverProfile.findOne({
      where: { user_id: req.params.driverId, is_verified: true },
      include: [{
        model: User,
        as: 'User',
        attributes: ['id', 'name', 'email', 'phone', 'driver_home_city', 'driver_rating',
                     'driver_completed_trips', 'driver_vehicle_type', 'driver_license_classes', 'created_at']
      }]
    });

    if (!profile) return res.status(404).json({ error: 'Driver not found or not verified' });
    res.json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// PROTECTED — Create hire request
// POST /api/driver/hire/:driverId/request
// ============================================================
router.post('/:driverId/request', verifyToken, async (req, res) => {
  try {
    const { driverId } = req.params;
    const {
      trip_type, title, description, pickup_location, dropoff_location,
      pickup_lat, pickup_lng, dropoff_lat, dropoff_lng,
      trip_date, trip_time, estimated_days, estimated_distance_km,
      cargo_type, cargo_weight_tons, vehicle_type_required,
      priority, requester_notes
    } = req.body;

    const driverProfile = await DriverProfile.findOne({
      where: { user_id: driverId },
      include: [{ model: User, as: 'User', attributes: ['id', 'name'] }]
    });
    if (!driverProfile) return res.status(404).json({ error: 'Driver not found' });
    if (!driverProfile.is_verified) return res.status(400).json({ error: 'Driver is not yet verified' });
    if (!driverProfile.is_available) return res.status(400).json({ error: 'Driver is not available' });
    if (parseInt(driverId) === req.user.id) return res.status(400).json({ error: 'Cannot hire yourself' });

    const days = parseFloat(estimated_days) || 1;
    const estimatedCost = days * parseFloat(driverProfile.daily_rate || 0);

    const hireRequest = await DriverHireRequest.create({
      requester_id: req.user.id,
      requester_type: req.user.role === 'seller' ? 'vendor' : 'customer',
      driver_id: parseInt(driverId),
      trip_type: trip_type || 'one_way',
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
      estimated_days: days,
      estimated_distance_km,
      cargo_type,
      cargo_weight_tons,
      vehicle_type_required,
      agreed_daily_rate: driverProfile.daily_rate,
      agreed_hourly_rate: driverProfile.hourly_rate,
      estimated_cost: estimatedCost,
      priority: priority || 'normal',
      requester_notes,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Hire request submitted! Driver will respond shortly.',
      data: hireRequest
    });
  } catch (error) {
    console.error('Create driver hire request error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// PROTECTED — Driver: view incoming hire requests
// GET /api/driver/hire/my-hire-requests
// ============================================================
router.get('/my-hire-requests', verifyToken, async (req, res) => {
  try {
    const { status } = req.query;
    const where = { driver_id: req.user.id };
    if (status) where.status = status;

    const requests = await DriverHireRequest.findAll({
      where,
      include: [{
        model: User,
        as: 'Requester',
        attributes: ['id', 'name', 'email', 'phone', 'store_name']
      }],
      order: [['created_at', 'DESC']]
    });

    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// PROTECTED — Driver: respond to hire request
// PUT /api/driver/hire/:requestId/respond
// ============================================================
router.put('/:requestId/respond', verifyToken, async (req, res) => {
  try {
    const { action, driver_notes } = req.body;
    const hireReq = await DriverHireRequest.findByPk(req.params.requestId);

    if (!hireReq) return res.status(404).json({ error: 'Hire request not found' });
    if (hireReq.driver_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });
    if (hireReq.status !== 'pending') return res.status(400).json({ error: 'Request already responded to' });

    hireReq.driver_acceptance = action === 'accept';
    hireReq.status = action === 'accept' ? 'driver_accepted' : 'driver_rejected';
    hireReq.driver_notes = driver_notes;
    hireReq.driver_responded_at = new Date();
    await hireReq.save();

    res.json({
      success: true,
      message: action === 'accept' ? 'Hire request accepted!' : 'Hire request declined.',
      data: hireReq
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// PROTECTED — Driver: start trip
// PUT /api/driver/hire/:requestId/start
// ============================================================
router.put('/:requestId/start', verifyToken, async (req, res) => {
  try {
    const hireReq = await DriverHireRequest.findByPk(req.params.requestId);
    if (!hireReq) return res.status(404).json({ error: 'Not found' });
    if (hireReq.driver_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });
    if (!['driver_accepted', 'admin_approved'].includes(hireReq.status)) {
      return res.status(400).json({ error: 'Hire not yet fully approved' });
    }

    hireReq.status = 'in_progress';
    hireReq.trip_started_at = new Date();
    await hireReq.save();

    res.json({ success: true, message: 'Trip started!', data: hireReq });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// PROTECTED — Driver: complete trip
// PUT /api/driver/hire/:requestId/complete
// ============================================================
router.put('/:requestId/complete', verifyToken, async (req, res) => {
  try {
    const { final_cost, driver_notes } = req.body;
    const hireReq = await DriverHireRequest.findByPk(req.params.requestId);
    if (!hireReq) return res.status(404).json({ error: 'Not found' });
    if (hireReq.driver_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });
    if (hireReq.status !== 'in_progress') return res.status(400).json({ error: 'Trip not started yet' });

    hireReq.status = 'completed';
    hireReq.trip_completed_at = new Date();
    if (final_cost) hireReq.final_cost = final_cost;
    if (driver_notes) hireReq.driver_notes = driver_notes;
    await hireReq.save();

    // Update driver trip count
    await DriverProfile.increment('completed_trips', { where: { user_id: req.user.id } });
    await User.increment('driver_completed_trips', { where: { id: req.user.id } });

    res.json({ success: true, message: 'Trip marked as completed!', data: hireReq });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// PROTECTED — Requester: confirm trip completion
// PUT /api/driver/hire/:requestId/confirm
// ============================================================
router.put('/:requestId/confirm', verifyToken, async (req, res) => {
  try {
    const hireReq = await DriverHireRequest.findByPk(req.params.requestId);
    if (!hireReq) return res.status(404).json({ error: 'Not found' });
    if (hireReq.requester_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

    hireReq.requester_completion_approval = true;
    hireReq.payment_status = 'paid';
    await hireReq.save();

    res.json({ success: true, message: 'Trip confirmed and payment released.', data: hireReq });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// PROTECTED — Cancel hire request
// PUT /api/driver/hire/:requestId/cancel
// ============================================================
router.put('/:requestId/cancel', verifyToken, async (req, res) => {
  try {
    const { reason } = req.body;
    const hireReq = await DriverHireRequest.findByPk(req.params.requestId);
    if (!hireReq) return res.status(404).json({ error: 'Not found' });
    if (hireReq.requester_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    if (['completed', 'cancelled'].includes(hireReq.status)) {
      return res.status(400).json({ error: 'Cannot cancel a completed or already cancelled request' });
    }

    hireReq.status = 'cancelled';
    hireReq.rejection_reason = reason;
    await hireReq.save();

    res.json({ success: true, message: 'Hire request cancelled.', data: hireReq });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// PROTECTED — Requester: view own hire requests
// GET /api/driver/hire/my-hires
// ============================================================
router.get('/my-hires', verifyToken, async (req, res) => {
  try {
    const { status } = req.query;
    const where = { requester_id: req.user.id };
    if (status) where.status = status;

    const hires = await DriverHireRequest.findAll({
      where,
      include: [{
        model: User,
        as: 'Driver',
        attributes: ['id', 'name', 'email', 'phone', 'driver_rating', 'driver_home_city',
                     'driver_vehicle_type', 'driver_license_classes']
      }],
      order: [['created_at', 'DESC']]
    });

    res.json({ success: true, data: hires });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
