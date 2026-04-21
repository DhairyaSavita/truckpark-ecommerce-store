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
const LogisticsMessage = require('./models/LogisticsMessage');

// Additional models
const RefurbishedProduct = require('./models/RefurbishedProduct');
const Auction = require('./models/Auction');
const AuctionBid = require('./models/AuctionBid');
const TechnicianProfile = require('./models/TechnicianProfile');
const TechnicianHireRequest = require('./models/TechnicianHireRequest');
const DriverProfile = require('./models/DriverProfile');
const DriverHireRequest = require('./models/DriverHireRequest');
const LogisticsProfile = require('./models/LogisticsProfile');
const ShipmentRequest = require('./models/ShipmentRequest');
const TripRequest = require('./models/TripRequest');
const ServiceRequest = require('./models/ServiceRequest');
const ServiceReview = require('./models/ServiceReview');
const DriverReview = require('./models/DriverReview');
const LogisticsReview = require('./models/LogisticsReview');

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

// LogisticsMessage associations
User.hasMany(LogisticsMessage, { foreignKey: 'sender_id',   as: 'SentLogisticsMessages' });
User.hasMany(LogisticsMessage, { foreignKey: 'receiver_id', as: 'ReceivedLogisticsMessages' });
LogisticsMessage.belongsTo(User, { foreignKey: 'sender_id',   as: 'Sender' });
LogisticsMessage.belongsTo(User, { foreignKey: 'receiver_id', as: 'Receiver' });

// RefurbishedProduct associations
User.hasMany(RefurbishedProduct, { foreignKey: 'seller_id', as: 'RefurbishedProducts' });
RefurbishedProduct.belongsTo(User, { foreignKey: 'seller_id', as: 'Seller' });

// Auction associations
User.hasMany(Auction, { foreignKey: 'seller_id', as: 'Auctions' });
Auction.belongsTo(User, { foreignKey: 'seller_id', as: 'Seller' });
RefurbishedProduct.hasMany(Auction, { foreignKey: 'product_id', as: 'Auctions' });
Auction.belongsTo(RefurbishedProduct, { foreignKey: 'product_id', as: 'Product' });

// AuctionBid associations
Auction.hasMany(AuctionBid, { foreignKey: 'auction_id', as: 'Bids' });
AuctionBid.belongsTo(Auction, { foreignKey: 'auction_id' });
User.hasMany(AuctionBid, { foreignKey: 'bidder_id', as: 'Bids' });
AuctionBid.belongsTo(User, { foreignKey: 'bidder_id', as: 'Bidder' });

// TechnicianProfile associations
User.hasOne(TechnicianProfile, { foreignKey: 'user_id', as: 'TechnicianProfile' });
TechnicianProfile.belongsTo(User, { foreignKey: 'user_id', as: 'User' });

// TechnicianHireRequest associations
User.hasMany(TechnicianHireRequest, { foreignKey: 'requester_id', as: 'SentHireRequests' });
TechnicianHireRequest.belongsTo(User, { foreignKey: 'requester_id', as: 'Requester' });
User.hasMany(TechnicianHireRequest, { foreignKey: 'technician_id', as: 'ReceivedHireRequests' });
TechnicianHireRequest.belongsTo(User, { foreignKey: 'technician_id', as: 'Technician' });

// DriverProfile associations
User.hasOne(DriverProfile, { foreignKey: 'user_id', as: 'DriverProfile' });
DriverProfile.belongsTo(User, { foreignKey: 'user_id', as: 'User' });

// DriverHireRequest associations
User.hasMany(DriverHireRequest, { foreignKey: 'requester_id', as: 'SentDriverHireRequests' });
DriverHireRequest.belongsTo(User, { foreignKey: 'requester_id', as: 'Requester' });
User.hasMany(DriverHireRequest, { foreignKey: 'driver_id', as: 'ReceivedDriverHireRequests' });
DriverHireRequest.belongsTo(User, { foreignKey: 'driver_id', as: 'Driver' });

// LogisticsProfile associations
User.hasOne(LogisticsProfile, { foreignKey: 'user_id', as: 'LogisticsProfile' });
LogisticsProfile.belongsTo(User, { foreignKey: 'user_id', as: 'User' });

// ServiceRequest associations
User.hasMany(ServiceRequest, { foreignKey: 'customer_id', as: 'ServiceRequests' });
ServiceRequest.belongsTo(User, { foreignKey: 'customer_id', as: 'Customer' });
User.hasMany(ServiceRequest, { foreignKey: 'technician_id', as: 'TechnicianJobs' });
ServiceRequest.belongsTo(User, { foreignKey: 'technician_id', as: 'Technician' });
Product.hasMany(ServiceRequest, { foreignKey: 'product_id' });
ServiceRequest.belongsTo(Product, { foreignKey: 'product_id' });

// ServiceReview associations
ServiceRequest.hasOne(ServiceReview, { foreignKey: 'service_request_id' });
ServiceReview.belongsTo(ServiceRequest, { foreignKey: 'service_request_id' });
User.hasMany(ServiceReview, { foreignKey: 'customer_id', as: 'GivenServiceReviews' });
ServiceReview.belongsTo(User, { foreignKey: 'customer_id', as: 'Customer' });
User.hasMany(ServiceReview, { foreignKey: 'technician_id', as: 'ReceivedServiceReviews' });
ServiceReview.belongsTo(User, { foreignKey: 'technician_id', as: 'ReviewedTechnician' });

// ShipmentRequest associations
User.hasMany(ShipmentRequest, { foreignKey: 'customer_id', as: 'ShipmentRequests' });
ShipmentRequest.belongsTo(User, { foreignKey: 'customer_id', as: 'Customer' });
User.hasMany(ShipmentRequest, { foreignKey: 'logistics_id', as: 'HandledShipments' });
ShipmentRequest.belongsTo(User, { foreignKey: 'logistics_id', as: 'Logistics' });

// LogisticsReview associations
ShipmentRequest.hasOne(LogisticsReview, { foreignKey: 'shipment_request_id' });
LogisticsReview.belongsTo(ShipmentRequest, { foreignKey: 'shipment_request_id' });
User.hasMany(LogisticsReview, { foreignKey: 'customer_id', as: 'GivenLogisticsReviews' });
LogisticsReview.belongsTo(User, { foreignKey: 'customer_id', as: 'Customer' });
User.hasMany(LogisticsReview, { foreignKey: 'logistics_id', as: 'ReceivedLogisticsReviews' });
LogisticsReview.belongsTo(User, { foreignKey: 'logistics_id', as: 'ReviewedLogistics' });

// TripRequest associations
User.hasMany(TripRequest, { foreignKey: 'customer_id', as: 'TripRequests' });
TripRequest.belongsTo(User, { foreignKey: 'customer_id', as: 'Customer' });
User.hasMany(TripRequest, { foreignKey: 'driver_id', as: 'DriverTrips' });
TripRequest.belongsTo(User, { foreignKey: 'driver_id', as: 'Driver' });

// DriverReview associations
TripRequest.hasOne(DriverReview, { foreignKey: 'trip_request_id' });
DriverReview.belongsTo(TripRequest, { foreignKey: 'trip_request_id' });
User.hasMany(DriverReview, { foreignKey: 'customer_id', as: 'GivenDriverReviews' });
DriverReview.belongsTo(User, { foreignKey: 'customer_id', as: 'Customer' });
User.hasMany(DriverReview, { foreignKey: 'driver_id', as: 'ReceivedDriverReviews' });
DriverReview.belongsTo(User, { foreignKey: 'driver_id', as: 'ReviewedDriver' });

// ─── FleetAssignment associations ───────────────────────────────────────────
const FleetAssignment = require('./models/FleetAssignment');
User.hasMany(FleetAssignment, { foreignKey: 'logistics_id', as: 'FleetAssignmentsAsLogistics' });
User.hasMany(FleetAssignment, { foreignKey: 'driver_id',    as: 'FleetAssignmentsAsDriver' });
FleetAssignment.belongsTo(User, { foreignKey: 'driver_id',    as: 'Driver' });
FleetAssignment.belongsTo(User, { foreignKey: 'logistics_id', as: 'Logistics' });

// ─── AppointmentSlot associations ────────────────────────────────────────────
const AppointmentSlot = require('./models/AppointmentSlot');
User.hasMany(AppointmentSlot, { foreignKey: 'provider_id', as: 'ProvidedSlots' });
User.hasMany(AppointmentSlot, { foreignKey: 'booked_by',   as: 'BookedSlots' });
AppointmentSlot.belongsTo(User, { foreignKey: 'provider_id', as: 'Provider' });
AppointmentSlot.belongsTo(User, { foreignKey: 'booked_by',   as: 'Booker' });



// ============ ROUTES ============
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/seller/dashboard', require('./routes/seller/dashboard'));
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
app.use('/api/logistics/messages', require('./routes/logistics/communication'));

// Logistics base routes (auth + shipments)
app.use('/api/logistics/auth',      require('./routes/logistics/auth'));
app.use('/api/logistics/shipments', require('./routes/logistics/shipments'));

// Refurbisher routes
app.use('/api/refurbisher/auth',     require('./routes/refurbisher/auth'));
app.use('/api/refurbisher/products', require('./routes/refurbisher/products'));
app.use('/api/refurbisher/auctions', require('./routes/refurbisher/auctions'));

// Public auction browsing routes
app.use('/api/auctions', require('./routes/auctions/public'));

// Technician routes
app.use('/api/technician/auth',     require('./routes/technician/auth'));
app.use('/api/technician/requests', require('./routes/technician/requests'));
app.use('/api/technician/hire',     require('./routes/technician/hire'));

// Vendor technician routes
app.use('/api/vendor/technicians',  require('./routes/vendor/technicians'));

// Driver routes
app.use('/api/driver/auth',  require('./routes/driver/auth'));
app.use('/api/driver/trips', require('./routes/driver/trips'));
app.use('/api/driver/hire',  require('./routes/driver/hire'));

// Vendor driver routes
app.use('/api/vendor/drivers', require('./routes/vendor/drivers'));

// Vendor analytics routes
app.use('/api/vendor', require('./routes/vendor/analytics'));

// Customer service/trip/shipment routes
app.use('/api/customer/service-requests', require('./routes/customer/customer/requests'));
app.use('/api/customer/shipments',        require('./routes/customer/shipments'));
app.use('/api/customer/trips',            require('./routes/customer/trips'));

// Support tickets sub-route
app.use('/api/support/tickets', require('./routes/support/tickets'));

// ════════════════════════════════════════════════════════════════════════════
// ECOSYSTEM EXTENSION ROUTES (Fleet, Appointments, Notifications, Scheduler)
// ════════════════════════════════════════════════════════════════════════════

// Fleet management & auto-scheduler (Logistics Partner)
app.use('/api/logistics/fleet',       require('./routes/logistics/fleet'));
app.use('/api/logistics/scheduler',   require('./routes/logistics/scheduler'));

// Cross-role appointment booking
app.use('/api/appointments',          require('./routes/appointments/slots'));

// Unified notification system (all roles)
app.use('/api/notifications',         require('./routes/notifications'));



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
