const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const TechnicianHireRequest = require('../../models/TechnicianHireRequest');
const TechnicianProfile = require('../../models/TechnicianProfile');
const User = require('../../models/User');
const { verifyToken } = require('../../config/auth');

// ============================================================
// PUBLIC — Browse available verified technicians
// GET /api/technician/hire/browse
// ============================================================
router.get('/browse', async (req, res) => {
  try {
    const {
      specialization, min_rating, max_rate, search,
      is_available, limit = 20, offset = 0
    } = req.query;

    const profileWhere = { is_verified: true };
    if (is_available !== undefined) profileWhere.is_available = is_available === 'true';
    if (min_rating) profileWhere.rating = { [Op.gte]: parseFloat(min_rating) };
    if (max_rate) profileWhere.hourly_rate = { [Op.lte]: parseFloat(max_rate) };
    if (specialization) {
      profileWhere.specialization = { [Op.contains]: [specialization] };
    }

    const userWhere = {};
    if (search) {
      userWhere[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { technician_address: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const profiles = await TechnicianProfile.findAll({
      where: profileWhere,
      include: [{
        model: User,
        as: 'User',
        where: { ...userWhere, is_technician: true },
        attributes: ['id', 'name', 'email', 'phone', 'technician_address', 'technician_rating', 'technician_completed_jobs']
      }],
      order: [['rating', 'DESC'], ['total_jobs', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({ success: true, data: profiles, total: profiles.length });
  } catch (error) {
    console.error('Browse technicians error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// PUBLIC — Get single technician public profile
// GET /api/technician/hire/:technicianId/profile
// ============================================================
router.get('/:technicianId/profile', async (req, res) => {
  try {
    const profile = await TechnicianProfile.findOne({
      where: { user_id: req.params.technicianId, is_verified: true },
      include: [{
        model: User,
        as: 'User',
        attributes: ['id', 'name', 'email', 'phone', 'technician_address', 'technician_rating', 'technician_completed_jobs', 'created_at']
      }]
    });

    if (!profile) return res.status(404).json({ error: 'Technician not found or not verified' });
    res.json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// PROTECTED — Create hire request
// POST /api/technician/hire/:technicianId/request
// ============================================================
router.post('/:technicianId/request', verifyToken, async (req, res) => {
  try {
    const { technicianId } = req.params;
    const {
      service_type, title, description, service_location,
      service_lat, service_lng, scheduled_date, scheduled_time,
      estimated_hours, priority, requester_notes
    } = req.body;

    // Validate technician exists and is verified
    const techProfile = await TechnicianProfile.findOne({
      where: { user_id: technicianId },
      include: [{ model: User, as: 'User', attributes: ['id', 'name'] }]
    });
    if (!techProfile) return res.status(404).json({ error: 'Technician not found' });
    if (!techProfile.is_verified) return res.status(400).json({ error: 'Technician is not yet verified' });
    if (!techProfile.is_available) return res.status(400).json({ error: 'Technician is not available' });

    // Prevent self-hiring
    if (parseInt(technicianId) === req.user.id) {
      return res.status(400).json({ error: 'Cannot hire yourself' });
    }

    const hours = parseFloat(estimated_hours) || 1;
    const estimatedCost = hours * parseFloat(techProfile.hourly_rate || 0);

    const hireRequest = await TechnicianHireRequest.create({
      requester_id: req.user.id,
      requester_type: req.user.role === 'seller' ? 'vendor' : 'customer',
      technician_id: parseInt(technicianId),
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
      estimated_cost: estimatedCost,
      priority: priority || 'normal',
      requester_notes,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Hire request submitted successfully. Awaiting technician response.',
      data: hireRequest
    });
  } catch (error) {
    console.error('Create hire request error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// PROTECTED — Technician: view incoming hire requests
// GET /api/technician/hire/my-requests
// ============================================================
router.get('/my-hire-requests', verifyToken, async (req, res) => {
  try {
    const { status } = req.query;
    const where = { technician_id: req.user.id };
    if (status) where.status = status;

    const requests = await TechnicianHireRequest.findAll({
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
// PROTECTED — Technician: respond to hire request
// PUT /api/technician/hire/:requestId/respond
// ============================================================
router.put('/:requestId/respond', verifyToken, async (req, res) => {
  try {
    const { action, technician_notes } = req.body; // action: 'accept' | 'reject'
    const hireReq = await TechnicianHireRequest.findByPk(req.params.requestId);

    if (!hireReq) return res.status(404).json({ error: 'Hire request not found' });
    if (hireReq.technician_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });
    if (hireReq.status !== 'pending') return res.status(400).json({ error: 'Request already responded to' });

    hireReq.technician_acceptance = action === 'accept';
    hireReq.status = action === 'accept' ? 'technician_accepted' : 'technician_rejected';
    hireReq.technician_notes = technician_notes;
    hireReq.technician_responded_at = new Date();
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
// PROTECTED — Technician: start work
// PUT /api/technician/hire/:requestId/start
// ============================================================
router.put('/:requestId/start', verifyToken, async (req, res) => {
  try {
    const hireReq = await TechnicianHireRequest.findByPk(req.params.requestId);
    if (!hireReq) return res.status(404).json({ error: 'Not found' });
    if (hireReq.technician_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });
    if (!['technician_accepted', 'admin_approved'].includes(hireReq.status)) {
      return res.status(400).json({ error: 'Hire not yet fully approved' });
    }

    hireReq.status = 'in_progress';
    hireReq.work_started_at = new Date();
    await hireReq.save();

    res.json({ success: true, message: 'Work started!', data: hireReq });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// PROTECTED — Technician: complete work
// PUT /api/technician/hire/:requestId/complete
// ============================================================
router.put('/:requestId/complete', verifyToken, async (req, res) => {
  try {
    const { final_cost, technician_notes } = req.body;
    const hireReq = await TechnicianHireRequest.findByPk(req.params.requestId);
    if (!hireReq) return res.status(404).json({ error: 'Not found' });
    if (hireReq.technician_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });
    if (hireReq.status !== 'in_progress') return res.status(400).json({ error: 'Work not started yet' });

    hireReq.status = 'completed';
    hireReq.work_completed_at = new Date();
    if (final_cost) hireReq.final_cost = final_cost;
    if (technician_notes) hireReq.technician_notes = technician_notes;
    await hireReq.save();

    // Update technician job count
    await TechnicianProfile.increment('total_jobs', { where: { user_id: req.user.id } });
    await User.increment('technician_completed_jobs', { where: { id: req.user.id } });

    res.json({ success: true, message: 'Work marked as completed!', data: hireReq });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// PROTECTED — Requester: confirm completion
// PUT /api/technician/hire/:requestId/confirm
// ============================================================
router.put('/:requestId/confirm', verifyToken, async (req, res) => {
  try {
    const hireReq = await TechnicianHireRequest.findByPk(req.params.requestId);
    if (!hireReq) return res.status(404).json({ error: 'Not found' });
    if (hireReq.requester_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

    hireReq.requester_completion_approval = true;
    hireReq.payment_status = 'paid';
    await hireReq.save();

    res.json({ success: true, message: 'Work confirmed and payment released.', data: hireReq });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// PROTECTED — Requester: cancel hire request
// PUT /api/technician/hire/:requestId/cancel
// ============================================================
router.put('/:requestId/cancel', verifyToken, async (req, res) => {
  try {
    const { reason } = req.body;
    const hireReq = await TechnicianHireRequest.findByPk(req.params.requestId);
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
// GET /api/technician/hire/my-hires
// ============================================================
router.get('/my-hires', verifyToken, async (req, res) => {
  try {
    const { status } = req.query;
    const where = { requester_id: req.user.id };
    if (status) where.status = status;

    const hires = await TechnicianHireRequest.findAll({
      where,
      include: [{
        model: User,
        as: 'Technician',
        attributes: ['id', 'name', 'email', 'phone', 'technician_rating', 'technician_address']
      }],
      order: [['created_at', 'DESC']]
    });

    res.json({ success: true, data: hires });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// PROTECTED — Technician: certification update
// PUT /api/technician/hire/certifications
// ============================================================
router.put('/certifications', verifyToken, async (req, res) => {
  try {
    const { certifications, portfolio, availability_schedule, service_areas } = req.body;
    const profile = await TechnicianProfile.findOne({ where: { user_id: req.user.id } });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    if (certifications !== undefined) profile.certifications = certifications;
    if (portfolio !== undefined) profile.portfolio = portfolio;
    if (availability_schedule !== undefined) profile.availability_schedule = availability_schedule;
    if (service_areas !== undefined) profile.service_areas = service_areas;
    await profile.save();

    res.json({ success: true, message: 'Profile updated successfully', data: profile });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
