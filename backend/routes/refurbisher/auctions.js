const express = require('express');
const router = express.Router();
const Auction = require('../../models/Auction');
const AuctionBid = require('../../models/AuctionBid');
const RefurbishedProduct = require('../../models/RefurbishedProduct');
const User = require('../../models/User');
const { verifyToken } = require('../../config/auth');
const { Op } = require('sequelize');

// Create auction
router.post('/create', verifyToken, async (req, res) => {
  try {
    const {
      product_id,
      title,
      description,
      starting_price,
      reserve_price,
      bid_increment,
      start_time,
      end_time
    } = req.body;

    // Verify product belongs to seller
    const product = await RefurbishedProduct.findOne({
      where: { id: product_id, seller_id: req.user.id }
    });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const auction = await Auction.create({
      seller_id: req.user.id,
      product_id,
      title: title || product.title,
      description: description || product.description,
      starting_price,
      current_price: starting_price,
      reserve_price,
      bid_increment: bid_increment || 100,
      start_time,
      end_time,
      status: 'scheduled'
    });

    res.status(201).json({ success: true, auction });
  } catch (error) {
    console.error('Error creating auction:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get my auctions
router.get('/my-auctions', verifyToken, async (req, res) => {
  try {
    const auctions = await Auction.findAll({
      where: { seller_id: req.user.id },
      include: [{ model: RefurbishedProduct, as: 'Product' }],
      order: [['created_at', 'DESC']]
    });
    res.json(auctions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get auction details
router.get('/:id', async (req, res) => {
  try {
    const auction = await Auction.findByPk(req.params.id, {
      include: [
        { model: RefurbishedProduct, as: 'Product' },
        { model: User, as: 'Seller', attributes: ['id', 'name', 'refurbisher_company_name'] }
      ]
    });
    
    if (!auction) {
      return res.status(404).json({ error: 'Auction not found' });
    }
    
    // Get top bids
    const topBids = await AuctionBid.findAll({
      where: { auction_id: auction.id },
      order: [['bid_amount', 'DESC']],
      limit: 10,
      include: [{ model: User, as: 'Bidder', attributes: ['id', 'name'] }]
    });
    
    res.json({ auction, topBids });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Place bid
router.post('/:id/bid', verifyToken, async (req, res) => {
  try {
    const { bid_amount, is_auto_bid, max_auto_bid } = req.body;
    const auction = await Auction.findByPk(req.params.id);
    
    if (!auction) {
      return res.status(404).json({ error: 'Auction not found' });
    }
    
    if (auction.status !== 'active') {
      return res.status(400).json({ error: 'Auction is not active' });
    }
    
    if (new Date() > new Date(auction.end_time)) {
      auction.status = 'ended';
      await auction.save();
      return res.status(400).json({ error: 'Auction has ended' });
    }
    
    if (bid_amount <= (auction.current_price || auction.starting_price)) {
      return res.status(400).json({ error: `Bid must be at least ${(auction.current_price || auction.starting_price) + auction.bid_increment}` });
    }
    
    const minBid = (auction.current_price || auction.starting_price) + auction.bid_increment;
    if (bid_amount < minBid) {
      return res.status(400).json({ error: `Minimum bid is ${minBid}` });
    }
    
    const bid = await AuctionBid.create({
      auction_id: auction.id,
      bidder_id: req.user.id,
      bid_amount,
      is_auto_bid: is_auto_bid || false,
      max_auto_bid
    });
    
    auction.current_price = bid_amount;
    auction.total_bids += 1;
    await auction.save();
    
    // Check if reserve price met
    if (auction.reserve_price && bid_amount >= auction.reserve_price) {
      // Auto-end auction when reserve met? Or continue
    }
    
    res.json({ success: true, bid, current_price: auction.current_price });
  } catch (error) {
    console.error('Error placing bid:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get active auctions
router.get('/active/list', async (req, res) => {
  try {
    const auctions = await Auction.findAll({
      where: {
        status: 'active',
        start_time: { [Op.lte]: new Date() },
        end_time: { [Op.gte]: new Date() }
      },
      include: [{ model: RefurbishedProduct, as: 'Product' }],
      order: [['end_time', 'ASC']],
      limit: 20
    });
    res.json(auctions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get upcoming auctions
router.get('/upcoming', async (req, res) => {
  try {
    const auctions = await Auction.findAll({
      where: {
        status: 'scheduled',
        start_time: { [Op.gt]: new Date() }
      },
      include: [{ model: RefurbishedProduct, as: 'Product' }],
      order: [['start_time', 'ASC']],
      limit: 20
    });
    res.json(auctions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add to watchlist (stub — AuctionWatchlist table not yet created)
router.post('/:id/watchlist', verifyToken, async (req, res) => {
  try {
    // AuctionWatchlist feature is planned — return success for now
    res.json({ success: true, message: 'Added to watchlist' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
