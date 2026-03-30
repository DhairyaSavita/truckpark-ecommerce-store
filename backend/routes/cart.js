const express = require('express');
const router = express.Router();
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');
const { verifyToken } = require('../config/auth');

// Get cart items
router.get('/', verifyToken, async (req, res) => {
  try {
    const cartItems = await CartItem.findAll({
      where: { user_id: req.user.id },
      include: [{ model: Product, as: 'Product' }]
    });
    res.json(cartItems);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add to cart
router.post('/', verifyToken, async (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    
    // Check if product exists
    const product = await Product.findByPk(product_id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Check if item already in cart
    let cartItem = await CartItem.findOne({
      where: { 
        user_id: req.user.id, 
        product_id: product_id 
      }
    });
    
    if (cartItem) {
      // Update quantity
      cartItem.quantity = cartItem.quantity + (quantity || 1);
      await cartItem.save();
    } else {
      // Create new cart item
      cartItem = await CartItem.create({
        user_id: req.user.id,
        product_id: product_id,
        quantity: quantity || 1
      });
    }
    
    // Fetch the updated cart item with product details
    const updatedCartItem = await CartItem.findByPk(cartItem.id, {
      include: [{ model: Product, as: 'Product' }]
    });
    
    res.status(201).json(updatedCartItem);
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update cart item quantity
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { quantity } = req.body;
    const cartItem = await CartItem.findOne({
      where: { 
        id: req.params.id, 
        user_id: req.user.id 
      }
    });
    
    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }
    
    cartItem.quantity = quantity;
    await cartItem.save();
    
    const updatedCartItem = await CartItem.findByPk(cartItem.id, {
      include: [{ model: Product, as: 'Product' }]
    });
    
    res.json(updatedCartItem);
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ error: error.message });
  }
});

// Remove from cart
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const cartItem = await CartItem.findOne({
      where: { 
        id: req.params.id, 
        user_id: req.user.id 
      }
    });
    
    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }
    
    await cartItem.destroy();
    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ error: error.message });
  }
});

// Clear cart
router.delete('/', verifyToken, async (req, res) => {
  try {
    await CartItem.destroy({
      where: { user_id: req.user.id }
    });
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
