const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const FleetAssignment = require('../../models/FleetAssignment');
const DriverProfile   = require('../../models/DriverProfile');
const ShipmentRequest = require('../../models/ShipmentRequest');
const User = require('../../models/User');
const { verifyToken, isLogistics } = require('../../config/auth');

// ─── Helper: create in-app notification (fire & forget) ───────────────────────
const notify = async (user_id, title, message, type = 'fleet') => {
  try {
    const Notification = require('../../models/Notification');
    await Notification.create({ user_id, title, message, type });
  } catch (_) {}
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/logistics/fleet/drivers
// List all drivers available for this logistics partner's fleet
// ─────────────────────────────────────────────────────────────────────────────
router.get('/drivers', verifyToken, isLogistics, async (req, res) => {
  try {
    const { search, status, vehicle_type } = req.query;
    const where = { driver_verified: true };
    if (vehicle_type) where.vehicle_type = vehicle_type;

    const drivers = await DriverProfile.findAll({
      where,
      include: [{ model: User, as: 'User', attributes: ['id', 'name', 'email', 'phone'] }],
      order: [['rating', 'DESC']],
    });

    // Enrich with current assignment status
    const driverIds = drivers.map(d => d.user_id);
    const activeAssignments = await FleetAssignment.findAll({
      where: {
        logistics_id: req.user.id,
        driver_id: { [Op.in]: driverIds },
        status: { [Op.in]: ['assigned', 'en_route'] },
      },
    });
    const assignedSet = new Set(activeAssignments.map(a => a.driver_id));

    const enriched = drivers.map(d => ({
      ...d.toJSON(),
      fleet_status: assignedSet.has(d.user_id) ? 'on_assignment' : (d.is_available ? 'available' : 'unavailable'),
    }));

    if (search) {
      const s = search.toLowerCase();
      return res.json(enriched.filter(d =>
        d.User?.name?.toLowerCase().includes(s) ||
        d.home_city?.toLowerCase().includes(s) ||
        d.vehicle_type?.toLowerCase().includes(s)
      ));
    }

    res.json({ data: enriched });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/logistics/fleet/assignments
// All assignments for this logistics partner
// ─────────────────────────────────────────────────────────────────────────────
router.get('/assignments', verifyToken, isLogistics, async (req, res) => {
  try {
    const { status } = req.query;
    const where = { logistics_id: req.user.id };
    if (status) where.status = status;

    const assignments = await FleetAssignment.findAll({
      where,
      include: [
        { model: User, as: 'Driver',    attributes: ['id', 'name', 'email', 'phone'] },
        { model: User, as: 'Logistics', attributes: ['id', 'name'] },
      ],
      order: [['created_at', 'DESC']],
    });

    res.json({ data: assignments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/logistics/fleet/assign
// Assign a driver to a shipment / route
// ─────────────────────────────────────────────────────────────────────────────
router.post('/assign', verifyToken, isLogistics, async (req, res) => {
  try {
    const { driver_id, shipment_id, route_details, eta, notes, priority } = req.body;
    if (!driver_id) return res.status(400).json({ error: 'driver_id is required' });

    // Check driver isn't already on an active assignment for this logistics partner
    const existing = await FleetAssignment.findOne({
      where: {
        logistics_id: req.user.id,
        driver_id,
        status: { [Op.in]: ['assigned', 'en_route'] },
      },
    });
    if (existing) return res.status(400).json({ error: 'Driver already has an active assignment' });

    const assignment = await FleetAssignment.create({
      logistics_id: req.user.id,
      driver_id,
      shipment_id: shipment_id || null,
      route_details: route_details || null,
      eta: eta || null,
      notes: notes || null,
      priority: priority || 'normal',
      status: 'assigned',
    });

    // Notify driver
    const driver = await User.findByPk(driver_id, { attributes: ['name'] });
    await notify(driver_id, '🚛 New Fleet Assignment', `You have been assigned a new route by your logistics partner.`, 'fleet');

    res.json({ success: true, data: assignment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/logistics/fleet/assignments/:id
// Update assignment status, ETA, notes
// ─────────────────────────────────────────────────────────────────────────────
router.patch('/assignments/:id', verifyToken, isLogistics, async (req, res) => {
  try {
    const assignment = await FleetAssignment.findOne({ where: { id: req.params.id, logistics_id: req.user.id } });
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

    const { status, eta, notes, completed_at, started_at } = req.body;
    if (status)       assignment.status       = status;
    if (eta)          assignment.eta          = eta;
    if (notes)        assignment.notes        = notes;
    if (completed_at) assignment.completed_at = completed_at;
    if (started_at)   assignment.started_at   = started_at;
    await assignment.save();

    // Notify driver of status change
    const msgMap = {
      en_route:   '🟢 Your assignment has started — you are now en route.',
      completed:  '✅ Your fleet assignment has been marked completed.',
      cancelled:  '❌ Your fleet assignment has been cancelled.',
      reassigned: '🔄 Your assignment has been reassigned.',
    };
    if (msgMap[status]) {
      await notify(assignment.driver_id, 'Assignment Update', msgMap[status], 'fleet');
    }

    res.json({ success: true, data: assignment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/logistics/fleet/my-assignment
// Driver: see their current assignment from any logistics partner
// ─────────────────────────────────────────────────────────────────────────────
router.get('/my-assignment', verifyToken, async (req, res) => {
  try {
    const assignments = await FleetAssignment.findAll({
      where: {
        driver_id: req.user.id,
        status: { [Op.in]: ['assigned', 'en_route'] },
      },
      include: [
        { model: User, as: 'Logistics', attributes: ['id', 'name', 'email', 'phone'] },
      ],
      order: [['created_at', 'DESC']],
    });
    res.json({ data: assignments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Driver self-updates status
router.patch('/my-assignment/:id/status', verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    const assignment = await FleetAssignment.findOne({ where: { id: req.params.id, driver_id: req.user.id } });
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

    assignment.status = status;
    if (status === 'completed') assignment.completed_at = new Date();
    if (status === 'en_route')  assignment.started_at   = new Date();
    await assignment.save();

    // Notify logistics partner
    await notify(assignment.logistics_id, '🚛 Assignment Status Update',
      `Driver has updated assignment #${assignment.id} to: ${status}`, 'fleet');

    res.json({ success: true, data: assignment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
