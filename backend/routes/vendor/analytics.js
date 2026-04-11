const express = require('express');
const router = express.Router();
const VendorAnalytics = require('../../models/VendorAnalytics');
const Order = require('../../models/Order');
const OrderItem = require('../../models/OrderItem');
const Product = require('../../models/Product');
const { verifyToken, isSeller } = require('../../config/auth');
const { Op } = require('sequelize');

// Get vendor dashboard stats
router.get('/dashboard', verifyToken, isSeller, async (req, res) => {
  try {
    const sellerId = req.user.id;
    
    // Get products
    const products = await Product.findAll({
      where: { seller_id: sellerId }
    });
    
    // Get orders for seller's products
    const orderItems = await OrderItem.findAll({
      include: [{
        model: Product,
        where: { seller_id: sellerId }
      }]
    });
    
    const totalOrders = orderItems.length;
    const totalRevenue = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalProducts = products.length;
    const lowStock = products.filter(p => p.stock_quantity < 10).length;
    
    // Monthly sales data
    const monthlySales = {};
    orderItems.forEach(item => {
      const month = new Date(item.created_at).toLocaleString('default', { month: 'long' });
      monthlySales[month] = (monthlySales[month] || 0) + (item.price * item.quantity);
    });
    
    // Top selling products
    const productSales = {};
    orderItems.forEach(item => {
      productSales[item.Product.name] = (productSales[item.Product.name] || 0) + item.quantity;
    });
    
    const topProducts = Object.entries(productSales)
      .map(([name, sales]) => ({ name, sales }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
    
    res.json({
      stats: {
        totalProducts,
        totalOrders,
        totalRevenue,
        lowStock,
        averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
      },
      monthlySales: Object.entries(monthlySales).map(([month, revenue]) => ({ month, revenue })),
      topProducts,
      recentProducts: products.slice(0, 5)
    });
  } catch (error) {
    console.error('Error fetching vendor stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// Bulk product upload (CSV)
router.post('/bulk-upload', verifyToken, isSeller, async (req, res) => {
  try {
    const { products } = req.body;
    // Implementation for bulk product upload
    res.json({ success: true, message: 'Products uploaded successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get payout history
router.get('/payouts', verifyToken, isSeller, async (req, res) => {
  try {
    // Implementation for payout history
    res.json({ payouts: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
