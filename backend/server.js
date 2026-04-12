const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const helmet = require('helmet');
const compression = require('compression');
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
const NODE_ENV = process.env.NODE_ENV || 'development';

// ============ SECURITY & PERFORMANCE MIDDLEWARE ============
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Compression for all responses (gzip)
app.use(compression());

// CORS — allow frontend origins
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:3001'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, curl, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded product images as static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============ REQUEST LOGGING (dev only) ============
if (NODE_ENV === 'development') {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// ============ ASSOCIATIONS ============

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
app.use('/api/upload', require('./routes/upload'));

// ============ HEALTH CHECK ============
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()) + 's',
  });
});

// Legacy test route
app.get('/api/test', (_req, res) => {
  res.json({ message: 'API is working!', timestamp: new Date().toISOString() });
});

// ============ 404 HANDLER ============
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ============ GLOBAL ERROR HANDLER ============
app.use((err, _req, res, _next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(err.status || 500).json({
    error: NODE_ENV === 'production' ? 'Something went wrong' : err.message,
  });
});

// ============ START SERVER ============
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Only run migrations in development — NEVER alter schema automatically in production
    if (NODE_ENV !== 'production') {
      await sequelize.sync({ alter: true });
      console.log('✅ Database schema synced (dev mode)');
    } else {
      console.log('ℹ️  Production mode — skipping auto-sync (use migrations)');
    }

    app.listen(PORT, () => {
      console.log(`\n🚀 Server is running in ${NODE_ENV} mode`);
      console.log(`📍 URL: http://localhost:${PORT}`);
      console.log(`❤️  Health: http://localhost:${PORT}/api/health\n`);
    });
  } catch (error) {
    console.error('❌ Error starting server:', error.message);
    process.exit(1);
  }
};

startServer();
