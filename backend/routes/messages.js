const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const { verifyToken, isAdmin } = require('../config/auth');

// Send message (enquiry)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { seller_id, subject, message, product_name, product_id } = req.body;
    
    // Get user details
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Create the message
    const newMessage = await Message.create({
      user_id: req.user.id,
      seller_id: seller_id || 1,
      subject: subject || `Enquiry about ${product_name || 'Product'}`,
      message: message,
      product_name: product_name,
      product_id: product_id,
      status: 'unread'
    });
    
    console.log(`📧 New enquiry from ${user.name} (${user.email}): ${subject}`);
    
    // Fetch the created message with user details
    const messageWithUser = await Message.findByPk(newMessage.id, {
      include: [{
        model: User,
        as: 'User',
        attributes: ['id', 'name', 'email', 'phone']
      }]
    });
    
    res.status(201).json(messageWithUser);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all messages (admin only)
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const messages = await Message.findAll({
      include: [{
        model: User,
        as: 'User',
        attributes: ['id', 'name', 'email', 'phone']
      }],
      order: [['created_at', 'DESC']]
    });
    
    console.log(`📬 Fetched ${messages.length} messages for admin`);
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user's own messages
router.get('/my-messages', verifyToken, async (req, res) => {
  try {
    const messages = await Message.findAll({
      where: { user_id: req.user.id },
      include: [{
        model: User,
        as: 'User',
        attributes: ['id', 'name', 'email', 'phone']
      }],
      order: [['created_at', 'DESC']]
    });
    res.json(messages);
  } catch (error) {
    console.error('Error fetching user messages:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mark message as read
router.put('/:id/read', verifyToken, async (req, res) => {
  try {
    const message = await Message.findByPk(req.params.id);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    // Check if user is admin or the recipient
    if (req.user.role !== 'admin' && message.seller_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    message.status = 'read';
    await message.save();
    res.json(message);
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete message
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const message = await Message.findByPk(req.params.id);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    // Check if user is admin or the sender
    if (req.user.role !== 'admin' && message.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    await message.destroy();
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
