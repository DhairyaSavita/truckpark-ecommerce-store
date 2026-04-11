const express = require('express');
const router = express.Router();
const chatbotService = require('../services/ai/chatbotService');
const { verifyToken } = require('../config/auth');

router.post('/message', verifyToken, async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;
    
    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const response = await chatbotService.processMessage(message, userId);
    res.json(response);
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

router.get('/history', verifyToken, async (req, res) => {
  res.json({ messages: [] });
});

router.delete('/history', verifyToken, async (req, res) => {
  res.json({ success: true });
});

module.exports = router;
