const sequelize = require('./config/database');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const createAdmin = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ where: { email: 'admin@truckparts.com' } });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      // Update existing user to admin role
      existingAdmin.role = 'admin';
      await existingAdmin.save();
      console.log('✓ Updated existing user to admin role');
    } else {
      // Create new admin user
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const admin = await User.create({
        name: 'Admin User',
        email: 'admin@truckparts.com',
        password: hashedPassword,
        role: 'admin',
        phone: '1234567890',
        address: 'Admin Address'
      });
      console.log('✓ Admin user created successfully!');
      console.log('Email: admin@truckparts.com');
      console.log('Password: admin123');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();
