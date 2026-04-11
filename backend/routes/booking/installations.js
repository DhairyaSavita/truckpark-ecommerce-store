const express = require('express');
const router = express.Router();
const ServiceBooking = require('../../models/ServiceBooking');
const Product = require('../../models/Product');
const User = require('../../models/User');
const { verifyToken, isAdmin } = require('../../config/auth');

// Get available mechanics
router.get('/mechanics', verifyToken, async (req, res) => {
  try {
    console.log('=== FETCH MECHANICS ===');
    
    // Get users with admin/seller role as mechanics
    const mechanics = await User.findAll({
      where: { role: ['admin', 'seller'] },
      attributes: ['id', 'name', 'email', 'phone']
    });
    
    const mechanicList = mechanics.map(m => ({
      id: m.id,
      name: m.name,
      email: m.email,
      phone: m.phone,
      specialization: 'Truck Repair Specialist',
      experience_years: 5,
      hourly_rate: 750,
      rating: 4.5,
      is_verified: true
    }));
    
    console.log(`Found ${mechanicList.length} mechanics`);
    res.json(mechanicList);
  } catch (error) {
    console.error('Error fetching mechanics:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create booking
router.post('/', verifyToken, async (req, res) => {
  try {
    console.log('=== CREATE BOOKING ===');
    console.log('User:', req.user.id);
    console.log('Body:', req.body);
    
    const { product_id, mechanic_id, booking_date, booking_time, service_address, notes } = req.body;
    
    // Validate required fields
    const missingFields = [];
    if (!product_id) missingFields.push('product_id');
    if (!booking_date) missingFields.push('booking_date');
    if (!booking_time) missingFields.push('booking_time');
    if (!service_address) missingFields.push('service_address');
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }
    
    // Check if product exists
    const product = await Product.findByPk(product_id);
    if (!product) {
      return res.status(404).json({ error: `Product with ID ${product_id} not found` });
    }
    
    // Create booking
    const booking = await ServiceBooking.create({
      user_id: req.user.id,
      product_id: parseInt(product_id),
      mechanic_id: mechanic_id || 1,
      booking_date: new Date(booking_date),
      booking_time,
      service_address,
      notes: notes || '',
      status: 'pending',
      total_amount: 1000,
      payment_status: 'pending'
    });
    
    console.log('Booking created:', booking.id);
    
    res.status(201).json({
      success: true,
      message: 'Installation booking created successfully',
      booking: {
        id: booking.id,
        product_id: booking.product_id,
        booking_date: booking.booking_date,
        booking_time: booking.booking_time,
        service_address: booking.service_address,
        status: booking.status,
        created_at: booking.created_at
      }
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user's bookings
router.get('/my-bookings', verifyToken, async (req, res) => {
  try {
    console.log('=== FETCH USER BOOKINGS ===');
    console.log('User:', req.user.id);
    
    const bookings = await ServiceBooking.findAll({
      where: { user_id: req.user.id },
      order: [['booking_date', 'DESC']]
    });
    
    // Fetch product details for each booking
    const bookingsWithProducts = [];
    for (const booking of bookings) {
      const product = await Product.findByPk(booking.product_id, {
        attributes: ['id', 'name', 'price', 'image_url']
      });
      bookingsWithProducts.push({
        ...booking.toJSON(),
        Product: product
      });
    }
    
    console.log(`Found ${bookingsWithProducts.length} bookings`);
    res.json(bookingsWithProducts);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all bookings (admin)
router.get('/all', verifyToken, isAdmin, async (req, res) => {
  try {
    const bookings = await ServiceBooking.findAll({
      order: [['booking_date', 'DESC']]
    });
    
    const bookingsWithDetails = [];
    for (const booking of bookings) {
      const product = await Product.findByPk(booking.product_id, {
        attributes: ['id', 'name']
      });
      const user = await User.findByPk(booking.user_id, {
        attributes: ['id', 'name', 'email']
      });
      bookingsWithDetails.push({
        ...booking.toJSON(),
        Product: product,
        User: user
      });
    }
    
    res.json(bookingsWithDetails);
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single booking
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const booking = await ServiceBooking.findByPk(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Check if user owns booking or is admin
    if (booking.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const product = await Product.findByPk(booking.product_id, {
      attributes: ['id', 'name', 'price']
    });
    
    res.json({
      ...booking.toJSON(),
      Product: product
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update booking status (admin only)
router.put('/:id/status', verifyToken, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await ServiceBooking.findByPk(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    booking.status = status;
    await booking.save();
    
    console.log('Booking status updated:', booking.id, '->', status);
    
    res.json({
      success: true,
      message: 'Booking status updated',
      booking
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ error: error.message });
  }
});

// Cancel booking (user)
router.put('/:id/cancel', verifyToken, async (req, res) => {
  try {
    const booking = await ServiceBooking.findByPk(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Check if user owns booking
    if (booking.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    booking.status = 'cancelled';
    await booking.save();
    
    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      booking
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete booking (admin only)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const booking = await ServiceBooking.findByPk(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    await booking.destroy();
    res.json({ success: true, message: 'Booking deleted' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
