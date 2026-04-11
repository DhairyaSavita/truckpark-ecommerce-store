const sequelize = require('./config/database');
const User = require('./models/User');
const Order = require('./models/Order');
const OrderItem = require('./models/OrderItem');
const Product = require('./models/Product');
const SupportTicket = require('./models/SupportTicket');
const ServiceBooking = require('./models/ServiceBooking');
const Wishlist = require('./models/Wishlist');
const PriceAlert = require('./models/PriceAlert');
const B2BQuote = require('./models/B2BQuote');

async function fixAll() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database');
    
    // Sync all tables
    await sequelize.sync({ alter: true });
    console.log('✅ All tables synced');
    
    // Create sample order if none exists
    const orderCount = await Order.count();
    if (orderCount === 0) {
      console.log('Creating sample order...');
      const admin = await User.findOne({ where: { role: 'admin' } });
      const product = await Product.findOne();
      
      if (admin && product) {
        const order = await Order.create({
          user_id: admin.id,
          total_amount: 5000,
          shipping_address: '123 Test Street',
          status: 'pending',
          payment_method: 'cod'
        });
        
        await OrderItem.create({
          order_id: order.id,
          product_id: product.id,
          quantity: 1,
          price: product.price
        });
        console.log('✅ Sample order created');
      }
    }
    
    // Create sample support ticket if none exists
    const ticketCount = await SupportTicket.count();
    if (ticketCount === 0) {
      console.log('Creating sample support ticket...');
      const admin = await User.findOne({ where: { role: 'admin' } });
      if (admin) {
        await SupportTicket.create({
          user_id: admin.id,
          subject: 'Welcome to Support',
          message: 'This is a sample ticket',
          priority: 'medium',
          status: 'open'
        });
        console.log('✅ Sample support ticket created');
      }
    }
    
    // Create sample booking if none exists
    const bookingCount = await ServiceBooking.count();
    if (bookingCount === 0) {
      console.log('Creating sample booking...');
      const admin = await User.findOne({ where: { role: 'admin' } });
      const product = await Product.findOne();
      if (admin && product) {
        await ServiceBooking.create({
          user_id: admin.id,
          product_id: product.id,
          mechanic_id: 1,
          booking_date: new Date(),
          booking_time: '10:00 AM',
          service_address: '123 Test Street',
          status: 'pending'
        });
        console.log('✅ Sample booking created');
      }
    }
    
    console.log('\n✅ Fix completed!');
    console.log('\n📊 Summary:');
    console.log(`   Orders: ${await Order.count()}`);
    console.log(`   Tickets: ${await SupportTicket.count()}`);
    console.log(`   Bookings: ${await ServiceBooking.count()}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixAll();
