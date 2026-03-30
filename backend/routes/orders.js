const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');
const User = require('../models/User');
const { verifyToken, isAdmin } = require('../config/auth');

// Create order from cart
router.post('/', verifyToken, async (req, res) => {
  try {
    const { shipping_address, payment_method } = req.body;
    
    const cartItems = await CartItem.findAll({
      where: { user_id: req.user.id },
      include: [{ model: Product, as: 'Product' }]
    });
    
    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }
    
    let totalAmount = 0;
    const orderItems = cartItems.map(item => {
      const productPrice = parseFloat(item.Product?.price) || 0;
      const quantity = parseInt(item.quantity) || 0;
      const subtotal = productPrice * quantity;
      totalAmount += subtotal;
      return {
        product_id: item.product_id,
        quantity: quantity,
        price: productPrice
      };
    });
    
    const order = await Order.create({
      user_id: req.user.id,
      total_amount: totalAmount,
      shipping_address,
      payment_method: payment_method || 'cash_on_delivery',
      status: 'pending'
    });
    
    for (const item of orderItems) {
      await OrderItem.create({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price
      });
    }
    
    await CartItem.destroy({ where: { user_id: req.user.id } });
    
    res.status(201).json({ success: true, message: 'Order placed successfully', order });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user's orders
router.get('/my-orders', verifyToken, async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { user_id: req.user.id },
      include: [{ model: OrderItem, as: 'OrderItems', include: [{ model: Product, as: 'Product' }] }],
      order: [['created_at', 'DESC']]
    });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
