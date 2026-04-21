const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const TechnicianHireRequest = require('../../models/TechnicianHireRequest');
const TechnicianProfile = require('../../models/TechnicianProfile');
const User = require('../../models/User');
const { verifyToken } = require('../../config/auth');

// ============================================================
// VENDOR — Browse available verified technicians
// GET /api/vendor/technicians/available
// ============================================================
router.get('/available', verifyToken, async (req, res) => {
  try {
    const { specialization, min_rating, max_rate, search, limit = 20, offset = 0 } = req.query;

    const profileWhere = { is_verified: true, is_available: true };
    if (min_rating) profileWhere.rating = { [Op.gte]: parseFloat(min_rating) };
    if (max_rate) profileWhere.hourly_rate = { [Op.lte]: parseFloat(max_rate) };
    if (specialization) profileWhere.specialization = { [Op.contains]: [specialization] };

    const userWhere = { is_technician: true };
    if (search) {
      userWhere[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { technician_address: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const rows = await TechnicianProfile.findAll({
      where: profileWhere,
      include: [{
        model: User,
        as: 'User',
        where: userWhere,
        attributes: ['id', 'name', 'email', 'phone', 'technician_address', 'technician_rating', 'technician_completed_jobs', 'created_at']
      }],
      order: [['rating', 'DESC'], ['total_jobs', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({ success: true, data: rows, total: rows.length });
  } catch (error) {
    console.error('Vendor browse technicians error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// VENDOR — Get technician profile detail
// GET /api/vendor/technicians/:technicianId
// ============================================================
router.get('/:technicianId', verifyToken, async (req, res) => {
  try {
    const profile = await TechnicianProfile.findOne({
      where: { user_id: req.params.technicianId },
      include: [{
        model: User,
        as: 'User',
        attributes: ['id', 'name', 'email', 'phone', 'technician_address', 'technician_rating', 'technician_completed_jobs', 'created_at']
      }]
    });

    if (!profile) return res.status(404).json({ error: 'Technician not found' });
    res.json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// VENDOR — Create hire request for a technician
// POST /api/vendor/technicians/hire
// ============================================================
router.post('/hire', verifyToken, async (req, res) => {
  try {
    const {
      technician_id, service_type, title, description,
      service_location, service_lat, service_lng,
      scheduled_date, scheduled_time, estimated_hours,
      priority, requester_notes
    } = req.body;

    if (!technician_id) return res.status(400).json({ error: 'technician_id is required' });

    const techProfile = await TechnicianProfile.findOne({
      where: { user_id: technician_id, is_verified: true }
    });
    if (!techProfile) return res.status(404).json({ error: 'Technician not found or not verified' });
    if (!techProfile.is_available) return res.status(400).json({ error: 'Technician not available right now' });

    const hours = parseFloat(estimated_hours) || 1;
    const costEstimate = hours * parseFloat(techProfile.hourly_rate || 0);

    const hireRequest = await TechnicianHireRequest.create({
      requester_id: req.user.id,
      requester_type: 'vendor',
      technician_id: parseInt(technician_id),
      service_type,
      title,
      description,
      service_location,
      service_lat,
      service_lng,
      scheduled_date,
      scheduled_time,
      estimated_hours: hours,
      agreed_hourly_rate: techProfile.hourly_rate,
      estimated_cost: costEstimate,
      priority: priority || 'normal',
      requester_notes,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Hire request sent to technician!',
      data: hireRequest
    });
  } catch (error) {
    console.error('Vendor hire technician error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// VENDOR — Get own hire requests (with filters)
// GET /api/vendor/technicians/my-hires
// ============================================================
router.get('/my-hires/list', verifyToken, async (req, res) => {
  try {
    const { status } = req.query;
    const where = { requester_id: req.user.id };
    if (status) where.status = status;

    const hires = await TechnicianHireRequest.findAll({
      where,
      include: [{
        model: User,
        as: 'Technician',
        attributes: ['id', 'name', 'email', 'phone', 'technician_rating', 'technician_address', 'technician_specialization', 'technician_hourly_rate']
      }],
      order: [['created_at', 'DESC']]
    });

    res.json({ success: true, data: hires });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// VENDOR — Approve/Confirm technician work completion
// PUT /api/vendor/technicians/hires/:requestId/approve-completion
// ============================================================
router.put('/hires/:requestId/approve-completion', verifyToken, async (req, res) => {
  try {
    const hireReq = await TechnicianHireRequest.findByPk(req.params.requestId);
    if (!hireReq) return res.status(404).json({ error: 'Hire request not found' });
    if (hireReq.requester_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });
    if (hireReq.status !== 'completed') return res.status(400).json({ error: 'Work not marked as completed by technician yet' });

    hireReq.requester_completion_approval = true;
    hireReq.payment_status = 'paid';
    await hireReq.save();

    res.json({ success: true, message: 'Work approved. Payment released to technician.', data: hireReq });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// VENDOR — Cancel a hire request
// PUT /api/vendor/technicians/hires/:requestId/cancel
// ============================================================
router.put('/hires/:requestId/cancel', verifyToken, async (req, res) => {
  try {
    const { reason } = req.body;
    const hireReq = await TechnicianHireRequest.findByPk(req.params.requestId);
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
// VENDOR — Appoint a technician exclusively
// PUT /api/vendor/technicians/:technicianId/appoint
// ============================================================
router.put('/:technicianId/appoint', verifyToken, async (req, res) => {
  try {
    const { notes } = req.body;

    const techProfile = await TechnicianProfile.findOne({
      where: { user_id: req.params.technicianId, is_verified: true }
    });
    if (!techProfile) return res.status(404).json({ error: 'Technician not found or not verified' });

    techProfile.appointed_vendor_id = req.user.id;
    techProfile.admin_notes = notes || '';
    await techProfile.save();

    res.json({ success: true, message: 'Technician appointed to your vendor account!', data: techProfile });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// VENDOR — Remove appointment
// DELETE /api/vendor/technicians/:technicianId/appoint
// ============================================================
router.delete('/:technicianId/appoint', verifyToken, async (req, res) => {
  try {
    const techProfile = await TechnicianProfile.findOne({
      where: { user_id: req.params.technicianId, appointed_vendor_id: req.user.id }
    });
    if (!techProfile) return res.status(404).json({ error: 'No appointment found' });

    techProfile.appointed_vendor_id = null;
    await techProfile.save();

    res.json({ success: true, message: 'Technician appointment removed.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// VENDOR — View my appointed technicians
// GET /api/vendor/technicians/appointed
// ============================================================
router.get('/appointed/list', verifyToken, async (req, res) => {
  try {
    const profiles = await TechnicianProfile.findAll({
      where: { appointed_vendor_id: req.user.id },
      include: [{
        model: User,
        as: 'User',
        attributes: ['id', 'name', 'email', 'phone', 'technician_rating', 'technician_address', 'technician_specialization']
      }]
    });

    res.json({ success: true, data: profiles });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
