const express = require('express');
const router = express.Router();
const B2BQuote = require('../../models/B2BQuote');
const Product = require('../../models/Product');
const { verifyToken, isSeller } = require('../../config/auth');

// Request quote
router.post('/', verifyToken, async (req, res) => {
  try {
    const { product_id, quantity, proposed_price, message } = req.body;
    
    const quote = await B2BQuote.create({
      user_id: req.user.id,
      product_id,
      quantity,
      proposed_price,
      message,
      status: 'pending'
    });
    
    res.status(201).json(quote);
  } catch (error) {
    console.error('Error creating quote:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user's quotes
router.get('/my-quotes', verifyToken, async (req, res) => {
  try {
    const quotes = await B2BQuote.findAll({
      where: { user_id: req.user.id },
      include: [{ model: Product, as: 'Product', attributes: ['id', 'name', 'price'] }],
      order: [['created_at', 'DESC']]
    });
    res.json(quotes);
  } catch (error) {
    console.error('Error fetching quotes:', error);
    res.status(500).json({ error: error.message });
  }
});

// Seller responds to quote
router.put('/:id/respond', verifyToken, isSeller, async (req, res) => {
  try {
    const { response, accepted_price } = req.body;
    const quote = await B2BQuote.findByPk(req.params.id);
    
    if (!quote) {
      return res.status(404).json({ error: 'Quote not found' });
    }
    
    quote.seller_response = response;
    if (accepted_price) quote.proposed_price = accepted_price;
    quote.status = 'responded';
    await quote.save();
    
    res.json(quote);
  } catch (error) {
    console.error('Error responding to quote:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
