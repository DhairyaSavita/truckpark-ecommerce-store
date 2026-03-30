const express = require('express');
const router = express.Router();
const { verifyToken, isSeller } = require('../../config/auth');
const SellerEarning = require('../../models/SellerEarning');

router.get('/', verifyToken, isSeller, async (req, res) => {
  try {
    const earnings = await SellerEarning.findAll({
      where: { seller_id: req.user.id },
      order: [['created_at', 'DESC']]
    });
    const totalEarnings = earnings.reduce((sum, e) => sum + parseFloat(e.net_amount), 0);
    const pendingEarnings = earnings
      .filter(e => e.status === 'pending')
      .reduce((sum, e) => sum + parseFloat(e.net_amount), 0);
    res.json({ earnings, totalEarnings, pendingEarnings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
