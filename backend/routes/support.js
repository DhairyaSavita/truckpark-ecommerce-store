const express = require('express');
const router = express.Router();
const SupportTicket = require('../models/SupportTicket');
const User = require('../models/User');
const { verifyToken, isAdmin } = require('../config/auth');

// Create support ticket
router.post('/tickets', verifyToken, async (req, res) => {
  try {
    console.log('=== CREATE SUPPORT TICKET ===');
    console.log('User:', req.user.id);
    console.log('Body:', req.body);
    
    const { order_id, subject, message, priority, location } = req.body;
    
    // Validate required fields
    if (!subject || !subject.trim()) {
      return res.status(400).json({ error: 'Subject is required' });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Parse location if provided as string
    let locationData = null;
    if (location) {
      try {
        locationData = typeof location === 'string' ? JSON.parse(location) : location;
      } catch (e) {
        locationData = location;
      }
    }
    
    // Create ticket
    const ticket = await SupportTicket.create({
      user_id: req.user.id,
      order_id: order_id || null,
      subject: subject.trim(),
      message: message.trim(),
      priority: priority || 'medium',
      status: 'open',
      location: locationData
    });
    
    console.log('Ticket created:', ticket.id);
    
    // Send email notification for urgent tickets
    if (priority === 'urgent') {
      console.log(`🚨 URGENT TICKET #${ticket.id} - Immediate attention required!`);
      console.log(`Location: ${locationData?.address || 'Not provided'}`);
      // Here you can add email/SMS notification logic
    }
    
    res.status(201).json({
      success: true,
      message: 'Support ticket created successfully',
      ticket: {
        id: ticket.id,
        subject: ticket.subject,
        message: ticket.message,
        priority: ticket.priority,
        status: ticket.status,
        location: ticket.location,
        created_at: ticket.created_at
      }
    });
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user's tickets
router.get('/tickets/my-tickets', verifyToken, async (req, res) => {
  try {
    console.log('=== FETCH USER TICKETS ===');
    console.log('User:', req.user.id);
    
    const tickets = await SupportTicket.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']]
    });
    
    console.log(`Found ${tickets.length} tickets`);
    res.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all tickets (admin)
router.get('/tickets', verifyToken, isAdmin, async (req, res) => {
  try {
    const tickets = await SupportTicket.findAll({
      order: [['created_at', 'DESC']]
    });
    res.json(tickets);
  } catch (error) {
    console.error('Error fetching all tickets:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get urgent tickets (admin)
router.get('/tickets/urgent', verifyToken, isAdmin, async (req, res) => {
  try {
    const tickets = await SupportTicket.findAll({
      where: { priority: 'urgent', status: ['open', 'in_progress'] },
      order: [['created_at', 'DESC']]
    });
    res.json(tickets);
  } catch (error) {
    console.error('Error fetching urgent tickets:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single ticket
router.get('/tickets/:id', verifyToken, async (req, res) => {
  try {
    const ticket = await SupportTicket.findByPk(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    // Check if user owns ticket or is admin
    if (ticket.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(ticket);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update ticket (admin only)
router.put('/tickets/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { status, resolution, priority } = req.body;
    const ticket = await SupportTicket.findByPk(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    if (status) ticket.status = status;
    if (resolution) ticket.resolution = resolution;
    if (priority) ticket.priority = priority;
    await ticket.save();
    
    console.log('Ticket updated:', ticket.id);
    
    res.json({
      success: true,
      message: 'Ticket updated successfully',
      ticket
    });
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete ticket (admin only)
router.delete('/tickets/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const ticket = await SupportTicket.findByPk(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    await ticket.destroy();
    res.json({ success: true, message: 'Ticket deleted' });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
