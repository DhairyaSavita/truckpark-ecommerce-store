const express = require('express');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./config/database');

// Import models
const User = require('./models/User');
const Product = require('./models/Product');
const Category = require('./models/Category');
const CartItem = require('./models/CartItem');
const Order = require('./models/Order');
const OrderItem = require('./models/OrderItem');
const Message = require('./models/Message');
const SupportTicket = require('./models/SupportTicket');
const ServiceBooking = require('./models/ServiceBooking');
const Wishlist = require('./models/Wishlist');
const PriceAlert = require('./models/PriceAlert');
const B2BQuote = require('./models/B2BQuote');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============ ASSOCIATIONS (Define once only) ============

// Cart associations
User.hasMany(CartItem, { foreignKey: 'user_id' });
CartItem.belongsTo(User, { foreignKey: 'user_id' });
Product.hasMany(CartItem, { foreignKey: 'product_id' });
CartItem.belongsTo(Product, { foreignKey: 'product_id', as: 'Product' });

// Order associations
User.hasMany(Order, { foreignKey: 'user_id' });
Order.belongsTo(User, { foreignKey: 'user_id', as: 'User' });
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'OrderItems' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });
Product.hasMany(OrderItem, { foreignKey: 'product_id' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'Product' });

// Message associations
User.hasMany(Message, { foreignKey: 'user_id' });
Message.belongsTo(User, { foreignKey: 'user_id', as: 'User' });

// Category associations
Category.hasMany(Product, { foreignKey: 'category_id' });
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'Category' });

// Support Ticket associations
User.hasMany(SupportTicket, { foreignKey: 'user_id' });
SupportTicket.belongsTo(User, { foreignKey: 'user_id', as: 'User' });

// Service Booking associations
User.hasMany(ServiceBooking, { foreignKey: 'user_id' });
ServiceBooking.belongsTo(User, { foreignKey: 'user_id', as: 'User' });
ServiceBooking.belongsTo(Product, { foreignKey: 'product_id', as: 'Product' });

// Wishlist associations
User.hasMany(Wishlist, { foreignKey: 'user_id' });
Wishlist.belongsTo(User, { foreignKey: 'user_id', as: 'User' });
Wishlist.belongsTo(Product, { foreignKey: 'product_id', as: 'Product' });

// Price Alert associations
User.hasMany(PriceAlert, { foreignKey: 'user_id' });
PriceAlert.belongsTo(User, { foreignKey: 'user_id', as: 'User' });
PriceAlert.belongsTo(Product, { foreignKey: 'product_id', as: 'Product' });

// B2B Quote associations
User.hasMany(B2BQuote, { foreignKey: 'user_id' });
B2BQuote.belongsTo(User, { foreignKey: 'user_id', as: 'User' });
B2BQuote.belongsTo(Product, { foreignKey: 'product_id', as: 'Product' });

// ============ ROUTES ============
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/seller/products', require('./routes/seller/products'));
app.use('/api/seller/orders', require('./routes/seller/orders'));
app.use('/api/seller/earnings', require('./routes/seller/earnings'));
app.use('/api/forum', require('./routes/forum'));
app.use('/api/chatbot', require('./routes/chatbot'));
app.use('/api/support', require('./routes/support'));
app.use('/api/installations', require('./routes/booking/installations'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/price-alerts', require('./routes/price-alerts'));
app.use('/api/b2b', require('./routes/b2b/quotes'));

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ error: err.message || 'Something went wrong!' });
});

// Start server
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');
    
    await sequelize.sync({ alter: true });
    console.log('✅ Database synced');
    
    app.listen(PORT, () => {
      console.log(`\n🚀 Server is running!`);
      console.log(`📍 URL: http://localhost:${PORT}`);
      console.log(`🧪 Test: http://localhost:${PORT}/api/test\n`);
    });
  } catch (error) {
    console.error('❌ Error starting server:', error.message);
    process.exit(1);
  }
};

startServer();
