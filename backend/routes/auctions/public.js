const express = require('express');
const router = express.Router();
const Auction = require('../../models/Auction');
const RefurbishedProduct = require('../../models/RefurbishedProduct');
const AuctionBid = require('../../models/AuctionBid');
const User = require('../../models/User');
const { Op } = require('sequelize');

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
    console.error('Error fetching active auctions:', error);
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
    console.error('Error fetching upcoming auctions:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single auction details
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
    
    const topBids = await AuctionBid.findAll({
      where: { auction_id: auction.id },
      order: [['bid_amount', 'DESC']],
      limit: 10,
      include: [{ model: User, as: 'Bidder', attributes: ['id', 'name'] }]
    });
    
    res.json({ auction, topBids });
  } catch (error) {
    console.error('Error fetching auction:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
