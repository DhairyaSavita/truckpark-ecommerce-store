const express = require('express');
const router = express.Router();
const SupportTicket = require('../../models/SupportTicket');
const User = require('../../models/User');
const { verifyToken, isAdmin } = require('../../config/auth');

// Create support ticket
router.post('/', verifyToken, async (req, res) => {
  try {
    const { order_id, subject, message, priority } = req.body;
    
    const ticket = await SupportTicket.create({
      user_id: req.user.id,
      order_id,
      subject,
      message,
      priority: priority || 'medium',
      status: 'open'
    });
    
    res.status(201).json({ success: true, ticket });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's tickets
router.get('/my-tickets', verifyToken, async (req, res) => {
  try {
    const tickets = await SupportTicket.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']]
    });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all tickets (admin)
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const tickets = await SupportTicket.findAll({
      include: [{ model: User, attributes: ['name', 'email'] }],
      order: [['created_at', 'DESC']]
    });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update ticket status
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { status, resolution } = req.body;
    const ticket = await SupportTicket.findByPk(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    ticket.status = status;
    if (resolution) ticket.resolution = resolution;
    await ticket.save();
    
    res.json({ success: true, ticket });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
