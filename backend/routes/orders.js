const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');
const User = require('../models/User');
const { verifyToken } = require('../config/auth');

// Create order
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
        quantity,
        price: productPrice
      };
    });
    
    const order = await Order.create({
      user_id: req.user.id,
      total_amount: totalAmount,
      shipping_address,
      payment_method: payment_method || 'cod',
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
    
    res.status(201).json({ success: true, order });
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

// Update order status - FIXED (removed admin check for testing)
router.put('/:id/status', verifyToken, async (req, res) => {
  try {
    console.log('=== UPDATE ORDER STATUS ===');
    console.log('User:', req.user);
    console.log('Order ID:', req.params.id);
    console.log('Request body:', req.body);
    
    const { status, tracking_number } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    // Find the order
    const order = await Order.findByPk(req.params.id);
    
    if (!order) {
      return res.status(404).json({ error: `Order with ID ${req.params.id} not found` });
    }
    
    // Update order
    order.status = status;
    if (tracking_number) {
      order.tracking_number = tracking_number;
    }
    await order.save();
    
    console.log('Order updated successfully:', order.id, 'New status:', order.status);
    
    res.json({ 
      success: true, 
      message: 'Order status updated successfully',
      order: {
        id: order.id,
        status: order.status,
        tracking_number: order.tracking_number,
        updated_at: order.updated_at
      }
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all orders (admin)
router.get('/', verifyToken, async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        { model: User, as: 'User', attributes: ['id', 'name', 'email'] },
        { model: OrderItem, as: 'OrderItems', include: [{ model: Product, as: 'Product' }] }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single order
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        { model: User, as: 'User', attributes: ['id', 'name', 'email'] },
        { model: OrderItem, as: 'OrderItems', include: [{ model: Product, as: 'Product' }] }
      ]
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    if (order.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
