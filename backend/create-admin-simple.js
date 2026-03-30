const sequelize = require('./config/database');
const User = require('./models/User');

const createAdmin = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database');
    
    // Check if admin exists
    let admin = await User.findOne({ where: { email: 'admin@truckparts.com' } });
    
    if (admin) {
      console.log('✅ Admin already exists');
      console.log('Email:', admin.email);
      console.log('Role:', admin.role);
    } else {
      // Create admin
      admin = await User.create({
        name: 'Admin User',
        email: 'admin@truckparts.com',
        password: 'admin123',
        role: 'admin',
        phone: '1234567890',
        address: 'Admin Address'
      });
      console.log('✅ Admin created successfully!');
    }
    
    console.log('\n📋 Login Details:');
    console.log('Email: admin@truckparts.com');
    console.log('Password: admin123');
    console.log('Role:', admin.role);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createAdmin();
