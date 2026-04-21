const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const AppointmentSlot = require('../../models/AppointmentSlot');
const User = require('../../models/User');
const TechnicianProfile = require('../../models/TechnicianProfile');
const DriverProfile     = require('../../models/DriverProfile');
const { verifyToken } = require('../../config/auth');

// ─── Helper ───────────────────────────────────────────────────────────────────
const notify = async (user_id, title, message) => {
  try {
    const Notification = require('../../models/Notification');
    await Notification.create({ user_id, title, message, type: 'appointment' });
  } catch (_) {}
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/appointments/slots?provider_id=&date=&provider_role=
// List available appointment slots for a provider
// ─────────────────────────────────────────────────────────────────────────────
router.get('/slots', async (req, res) => {
  try {
    const { provider_id, date, provider_role } = req.query;
    const where = { status: 'available', is_booked: false };
    if (provider_id)   where.provider_id   = provider_id;
    if (provider_role) where.provider_role = provider_role;
    if (date)          where.slot_date     = date;
    else {
      // Default: next 30 days
      where.slot_date = { [Op.gte]: new Date().toISOString().split('T')[0] };
    }

    const slots = await AppointmentSlot.findAll({
      where,
      include: [{ model: User, as: 'Provider', attributes: ['id', 'name'] }],
      order: [['slot_date', 'ASC'], ['slot_time', 'ASC']],
    });
    res.json({ data: slots });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/appointments/slots
// Provider creates availability slots
// ─────────────────────────────────────────────────────────────────────────────
router.post('/slots', verifyToken, async (req, res) => {
  try {
    const { slots } = req.body; // array of { slot_date, slot_time, duration_mins, service_type, location, booking_type, estimated_cost }
    if (!Array.isArray(slots) || slots.length === 0)
      return res.status(400).json({ error: 'slots array is required' });

    // Determine provider_role
    const user = await User.findByPk(req.user.id);
    let provider_role = 'technician';
    if (user.is_driver)     provider_role = 'driver';
    if (user.is_logistics)  provider_role = 'logistics';
    if (user.is_refurbisher || user.refurbisher_verified) provider_role = 'refurbisher';
    if (user.is_technician_verified) provider_role = 'technician';

    const created = await AppointmentSlot.bulkCreate(
      slots.map(s => ({ ...s, provider_id: req.user.id, provider_role }))
    );

    res.json({ success: true, data: created });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/appointments/book
// Book a slot (buyer/seller)
// ─────────────────────────────────────────────────────────────────────────────
router.post('/book', verifyToken, async (req, res) => {
  try {
    const { slot_id, booking_notes, location } = req.body;
    if (!slot_id) return res.status(400).json({ error: 'slot_id is required' });

    const slot = await AppointmentSlot.findByPk(slot_id);
    if (!slot) return res.status(404).json({ error: 'Slot not found' });
    if (slot.is_booked) return res.status(400).json({ error: 'Slot already booked' });

    slot.is_booked    = true;
    slot.booked_by    = req.user.id;
    slot.status       = 'booked';
    slot.booking_notes = booking_notes || null;
    if (location) slot.location = location;
    await slot.save();

    // Notify provider
    const booker = await User.findByPk(req.user.id, { attributes: ['name'] });
    await notify(slot.provider_id, '📅 New Appointment Booked',
      `${booker.name} has booked your slot on ${slot.slot_date} at ${slot.slot_time}. Service: ${slot.service_type || 'General'}.`);

    // Notify booker
    const provider = await User.findByPk(slot.provider_id, { attributes: ['name'] });
    await notify(req.user.id, '✅ Appointment Confirmed',
      `Your appointment with ${provider.name} on ${slot.slot_date} at ${slot.slot_time} is confirmed.`);

    res.json({ success: true, data: slot });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/appointments/my
// Get all appointments for the current user (both as provider and booker)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/my', verifyToken, async (req, res) => {
  try {
    const { role } = req.query; // 'provider' | 'booker' | (default = both)

    const providedSlots = (role === 'booker') ? [] : await AppointmentSlot.findAll({
      where: { provider_id: req.user.id },
      include: [{ model: User, as: 'Booker', attributes: ['id', 'name', 'phone'], foreignKey: 'booked_by' }],
      order: [['slot_date', 'DESC']],
    });

    const bookedSlots = (role === 'provider') ? [] : await AppointmentSlot.findAll({
      where: { booked_by: req.user.id },
      include: [{ model: User, as: 'Provider', attributes: ['id', 'name', 'phone'] }],
      order: [['slot_date', 'DESC']],
    });

    res.json({ data: { as_provider: providedSlots, as_booker: bookedSlots } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/appointments/book/:id
// Cancel or reschedule a booking
// ─────────────────────────────────────────────────────────────────────────────
router.patch('/book/:id', verifyToken, async (req, res) => {
  try {
    const slot = await AppointmentSlot.findByPk(req.params.id);
    if (!slot) return res.status(404).json({ error: 'Appointment not found' });

    const isProvider = slot.provider_id === req.user.id;
    const isBooker   = slot.booked_by   === req.user.id;
    if (!isProvider && !isBooker) return res.status(403).json({ error: 'Not authorized' });

    const { action, cancel_reason } = req.body;

    if (action === 'cancel') {
      slot.status        = 'cancelled';
      slot.cancelled_at  = new Date();
      slot.cancel_reason = cancel_reason || null;
      slot.is_booked     = false;
      slot.booked_by     = null;
      await slot.save();

      const other_id = isProvider ? slot.booked_by : slot.provider_id;
      if (other_id) {
        await notify(other_id, '❌ Appointment Cancelled',
          `Your appointment on ${slot.slot_date} at ${slot.slot_time} has been cancelled. ${cancel_reason ? 'Reason: ' + cancel_reason : ''}`);
      }
    } else if (action === 'complete') {
      slot.status = 'completed';
      await slot.save();
      if (slot.booked_by) {
        await notify(slot.booked_by, '✅ Appointment Completed', `Your appointment on ${slot.slot_date} has been marked as completed.`);
      }
    }

    res.json({ success: true, data: slot });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/appointments/slots/:id
// Provider removes an availability slot (only if not booked)
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/slots/:id', verifyToken, async (req, res) => {
  try {
    const slot = await AppointmentSlot.findOne({ where: { id: req.params.id, provider_id: req.user.id } });
    if (!slot) return res.status(404).json({ error: 'Slot not found' });
    if (slot.is_booked) return res.status(400).json({ error: 'Cannot delete a booked slot. Cancel it first.' });
    await slot.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
