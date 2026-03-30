const express = require('express');
const router = express.Router();
const { verifyToken, isSeller } = require('../../config/auth');
const SellerOrder = require('../../models/SellerOrder');
const OrderItem = require('../../models/OrderItem');
const Product = require('../../models/Product');

router.get('/', verifyToken, isSeller, async (req, res) => {
  try {
    const orders = await SellerOrder.findAll({
      where: { seller_id: req.user.id },
      include: [{
        model: OrderItem,
        as: 'OrderItems',
        include: [Product]
      }],
      order: [['created_at', 'DESC']]
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id/status', verifyToken, isSeller, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await SellerOrder.findOne({
      where: { id: req.params.id, seller_id: req.user.id }
    });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    order.status = status;
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
