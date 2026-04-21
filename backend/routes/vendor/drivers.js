const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const DriverHireRequest = require('../../models/DriverHireRequest');
const DriverProfile = require('../../models/DriverProfile');
const User = require('../../models/User');
const { verifyToken } = require('../../config/auth');

// ============================================================
// VENDOR — Browse available verified drivers
// GET /api/vendor/drivers/available
// ============================================================
router.get('/available', verifyToken, async (req, res) => {
  try {
    const { vehicle_type, min_rating, max_daily_rate, search, limit = 20, offset = 0 } = req.query;

    const profileWhere = { is_verified: true, is_available: true };
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

    const rows = await DriverProfile.findAll({
      where: profileWhere,
      include: [{
        model: User,
        as: 'User',
        where: userWhere,
        attributes: ['id', 'name', 'email', 'phone', 'driver_home_city', 'driver_rating',
                     'driver_completed_trips', 'driver_vehicle_type', 'driver_license_classes', 'created_at']
      }],
      order: [['rating', 'DESC'], ['completed_trips', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({ success: true, data: rows, total: rows.length });
  } catch (error) {
    console.error('Vendor browse drivers error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// VENDOR — Get driver profile detail
// GET /api/vendor/drivers/:driverId
// ============================================================
router.get('/:driverId', verifyToken, async (req, res) => {
  try {
    const profile = await DriverProfile.findOne({
      where: { user_id: req.params.driverId },
      include: [{
        model: User,
        as: 'User',
        attributes: ['id', 'name', 'email', 'phone', 'driver_home_city', 'driver_rating',
                     'driver_completed_trips', 'driver_vehicle_type', 'driver_license_classes', 'created_at']
      }]
    });

    if (!profile) return res.status(404).json({ error: 'Driver not found' });
    res.json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// VENDOR — Create hire request for a driver
// POST /api/vendor/drivers/hire
// ============================================================
router.post('/hire', verifyToken, async (req, res) => {
  try {
    const {
      driver_id, trip_type, title, description,
      pickup_location, dropoff_location,
      pickup_lat, pickup_lng, dropoff_lat, dropoff_lng,
      trip_date, trip_time, estimated_days,
      estimated_distance_km, cargo_type, cargo_weight_tons,
      vehicle_type_required, priority, requester_notes
    } = req.body;

    if (!driver_id) return res.status(400).json({ error: 'driver_id is required' });

    const driverProfile = await DriverProfile.findOne({
      where: { user_id: driver_id, is_verified: true }
    });
    if (!driverProfile) return res.status(404).json({ error: 'Driver not found or not verified' });
    if (!driverProfile.is_available) return res.status(400).json({ error: 'Driver not available right now' });

    const days = parseFloat(estimated_days) || 1;
    const costEstimate = days * parseFloat(driverProfile.daily_rate || 0);

    const hireRequest = await DriverHireRequest.create({
      requester_id: req.user.id,
      requester_type: 'vendor',
      driver_id: parseInt(driver_id),
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
      estimated_cost: costEstimate,
      priority: priority || 'normal',
      requester_notes,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Hire request sent to driver!',
      data: hireRequest
    });
  } catch (error) {
    console.error('Vendor hire driver error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// VENDOR — Get own hire requests
// GET /api/vendor/drivers/my-hires/list
// ============================================================
router.get('/my-hires/list', verifyToken, async (req, res) => {
  try {
    const { status } = req.query;
    const where = { requester_id: req.user.id };
    if (status) where.status = status;

    const hires = await DriverHireRequest.findAll({
      where,
      include: [{
        model: User,
        as: 'Driver',
        attributes: ['id', 'name', 'email', 'phone', 'driver_rating',
                     'driver_home_city', 'driver_vehicle_type', 'driver_license_classes']
      }],
      order: [['created_at', 'DESC']]
    });

    res.json({ success: true, data: hires });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// VENDOR — Approve driver trip completion
// PUT /api/vendor/drivers/hires/:requestId/approve-completion
// ============================================================
router.put('/hires/:requestId/approve-completion', verifyToken, async (req, res) => {
  try {
    const hireReq = await DriverHireRequest.findByPk(req.params.requestId);
    if (!hireReq) return res.status(404).json({ error: 'Hire request not found' });
    if (hireReq.requester_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });
    if (hireReq.status !== 'completed') return res.status(400).json({ error: 'Trip not yet completed by driver' });

    hireReq.requester_completion_approval = true;
    hireReq.payment_status = 'paid';
    await hireReq.save();

    res.json({ success: true, message: 'Trip approved. Payment released to driver.', data: hireReq });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// VENDOR — Cancel hire request
// PUT /api/vendor/drivers/hires/:requestId/cancel
// ============================================================
router.put('/hires/:requestId/cancel', verifyToken, async (req, res) => {
  try {
    const { reason } = req.body;
    const hireReq = await DriverHireRequest.findByPk(req.params.requestId);
    if (!hireReq) return res.status(404).json({ error: 'Hire request not found' });
    if (hireReq.requester_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });
    if (['completed', 'cancelled', 'in_progress'].includes(hireReq.status)) {
      return res.status(400).json({ error: `Cannot cancel a ${hireReq.status} request` });
    }

    hireReq.status = 'cancelled';
    hireReq.rejection_reason = reason || 'Cancelled by vendor';
    await hireReq.save();

    res.json({ success: true, message: 'Hire request cancelled.', data: hireReq });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// VENDOR — Appoint a driver exclusively
// PUT /api/vendor/drivers/:driverId/appoint
// ============================================================
router.put('/:driverId/appoint', verifyToken, async (req, res) => {
  try {
    const { notes } = req.body;
    const driverProfile = await DriverProfile.findOne({
      where: { user_id: req.params.driverId, is_verified: true }
    });
    if (!driverProfile) return res.status(404).json({ error: 'Driver not found or not verified' });

    driverProfile.appointed_vendor_id = req.user.id;
    driverProfile.admin_notes = notes || '';
    await driverProfile.save();

    res.json({ success: true, message: 'Driver appointed to your vendor account!', data: driverProfile });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// VENDOR — Remove appointment
// DELETE /api/vendor/drivers/:driverId/appoint
// ============================================================
router.delete('/:driverId/appoint', verifyToken, async (req, res) => {
  try {
    const driverProfile = await DriverProfile.findOne({
      where: { user_id: req.params.driverId, appointed_vendor_id: req.user.id }
    });
    if (!driverProfile) return res.status(404).json({ error: 'No appointment found' });

    driverProfile.appointed_vendor_id = null;
    await driverProfile.save();

    res.json({ success: true, message: 'Driver appointment removed.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// VENDOR — View appointed drivers
// GET /api/vendor/drivers/appointed/list
// ============================================================
router.get('/appointed/list', verifyToken, async (req, res) => {
  try {
    const profiles = await DriverProfile.findAll({
      where: { appointed_vendor_id: req.user.id },
      include: [{
        model: User,
        as: 'User',
        attributes: ['id', 'name', 'email', 'phone', 'driver_rating',
                     'driver_home_city', 'driver_vehicle_type', 'driver_license_classes']
      }]
    });

    res.json({ success: true, data: profiles });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
