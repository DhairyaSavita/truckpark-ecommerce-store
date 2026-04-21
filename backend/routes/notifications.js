const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { verifyToken } = require('../config/auth');

// GET /api/notifications — paginated, unread first
router.get('/', verifyToken, async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const notifications = await Notification.findAll({
      where:  { user_id: req.user.id },
      order:  [['is_read', 'ASC'], ['created_at', 'DESC']],
      limit:  parseInt(limit),
      offset: parseInt(offset),
    });
    const unread_count = await Notification.count({ where: { user_id: req.user.id, is_read: false } });
    res.json({ data: notifications, unread_count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', verifyToken, async (req, res) => {
  try {
    const notif = await Notification.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!notif) return res.status(404).json({ error: 'Not found' });
    notif.is_read = true;
    await notif.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/notifications/read-all
router.post('/read-all', verifyToken, async (req, res) => {
  try {
    await Notification.update({ is_read: true }, { where: { user_id: req.user.id, is_read: false } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
