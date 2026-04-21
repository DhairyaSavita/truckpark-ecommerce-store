const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const FleetAssignment = require('../../models/FleetAssignment');
const DriverProfile   = require('../../models/DriverProfile');
const ShipmentRequest = require('../../models/ShipmentRequest');
const User = require('../../models/User');
const { verifyToken, isLogistics } = require('../../config/auth');

// ─── Auto-assign rules store (in-memory for now, persisted as JSON in Notification notes) ─
// In production this would be a DB table. For now we use a JSON array in-process.

// POST /api/logistics/scheduler/rules — save auto-scheduling preferences
router.post('/rules', verifyToken, isLogistics, async (req, res) => {
  try {
    const { rules } = req.body;
    // Store rules as a special notification for the logistics user (hack-free storage)
    const Notification = require('../../models/Notification');
    await Notification.destroy({ where: { user_id: req.user.id, type: 'scheduler_rules' } });
    await Notification.create({
      user_id: req.user.id,
      title: '__scheduler_rules__',
      message: JSON.stringify(rules),
      type: 'scheduler_rules',
    });
    res.json({ success: true, message: 'Auto-scheduling rules saved' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/logistics/scheduler/rules
router.get('/rules', verifyToken, isLogistics, async (req, res) => {
  try {
    const Notification = require('../../models/Notification');
    const rule = await Notification.findOne({ where: { user_id: req.user.id, type: 'scheduler_rules' } });
    res.json({ data: rule ? JSON.parse(rule.message) : [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/logistics/scheduler/queue
// Pending shipment requests that haven't been assigned a driver yet
router.get('/queue', verifyToken, isLogistics, async (req, res) => {
  try {
    const pending = await ShipmentRequest.findAll({
      where: {
        logistics_id: req.user.id,
        status: 'confirmed',
      },
      include: [{ model: User, as: 'Customer', attributes: ['id', 'name', 'phone'] }],
      order: [['created_at', 'ASC']],
    });

    // Check which ones have no fleet assignment
    const assignedShipmentIds = new Set(
      (await FleetAssignment.findAll({
        where: {
          logistics_id: req.user.id,
          status: { [Op.in]: ['assigned', 'en_route'] },
        },
        attributes: ['shipment_id'],
      })).map(a => a.shipment_id).filter(Boolean)
    );

    const unassigned = pending.filter(s => !assignedShipmentIds.has(s.id));
    res.json({ data: unassigned });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/logistics/scheduler/run
// Trigger auto-matching for all pending unassigned shipments
router.post('/run', verifyToken, isLogistics, async (req, res) => {
  try {
    // 1. Get unassigned confirmed shipments
    const pending = await ShipmentRequest.findAll({
      where: { logistics_id: req.user.id, status: 'confirmed' },
    });
    if (!pending.length) return res.json({ matched: 0, message: 'No pending shipments to assign' });

    // 2. Get available verified drivers not on active assignment
    const activeDriverIds = (await FleetAssignment.findAll({
      where: { logistics_id: req.user.id, status: { [Op.in]: ['assigned', 'en_route'] } },
      attributes: ['driver_id'],
    })).map(a => a.driver_id);

    const availableDrivers = await DriverProfile.findAll({
      where: {
        driver_verified: true,
        is_available: true,
        user_id: { [Op.notIn]: activeDriverIds.length ? activeDriverIds : [0] },
      },
      include: [{ model: User, as: 'User', attributes: ['id', 'name'] }],
      order: [['rating', 'DESC']],
    });

    if (!availableDrivers.length) return res.json({ matched: 0, message: 'No available drivers found' });

    const notify = async (user_id, title, message) => {
      try {
        const Notification = require('../../models/Notification');
        await Notification.create({ user_id, title, message, type: 'fleet' });
      } catch (_) {}
    };

    let matched = 0;
    const assignments = [];

    for (const shipment of pending) {
      if (!availableDrivers.length) break;
      // Simple match: best-rated available driver
      const driver = availableDrivers.shift();

      const assignment = await FleetAssignment.create({
        logistics_id: req.user.id,
        driver_id:    driver.user_id,
        shipment_id:  shipment.id,
        route_details: {
          pickup:  shipment.pickup_address,
          dropoff: shipment.delivery_address,
          weight:  shipment.weight_kg,
          type:    shipment.shipment_type,
        },
        status:          'assigned',
        is_auto_assigned: true,
        priority:        shipment.priority || 'normal',
      });

      await notify(driver.user_id, '🤖 Auto-Assignment: New Route',
        `You have been auto-assigned to a shipment. Pickup: ${shipment.pickup_address}. Please check your route map.`);

      matched++;
      assignments.push(assignment);
    }

    res.json({ matched, assignments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
