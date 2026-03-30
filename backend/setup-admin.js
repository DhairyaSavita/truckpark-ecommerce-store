const sequelize = require('./config/database');
const User = require('./models/User');

async function setupAdmin() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database\n');
    
    // Check if admin already exists
    let admin = await User.findOne({ where: { email: 'admin@truckparts.com' } });
    
    if (admin) {
      console.log('📋 Existing admin found:');
      console.log(`   Name: ${admin.name}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Created: ${admin.created_at}`);
      
      // Update password to ensure it's properly hashed
      console.log('\n🔄 Updating password...');
      admin.password = 'admin123';
      await admin.save();
      console.log('✅ Password updated and hashed');
    } else {
      console.log('🆕 Creating new admin user...');
      admin = await User.create({
        name: 'Super Admin',
        email: 'admin@truckparts.com',
        password: 'admin123',
        role: 'admin',
        phone: '+1 (555) 123-4567',
        address: 'Admin Office'
      });
      console.log('✅ Admin user created successfully');
    }
    
    // Verify password works
    const isValid = await admin.comparePassword('admin123');
    console.log(`\n🔐 Password verification: ${isValid ? '✅ SUCCESS' : '❌ FAILED'}`);
    
    if (isValid) {
      console.log('\n🎉 Admin setup complete!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📋 Login Credentials:');
      console.log('   Email: admin@truckparts.com');
      console.log('   Password: admin123');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('\n🔗 Access URLs:');
      console.log('   Admin Dashboard: http://localhost:3000/admin');
      console.log('   User Management: http://localhost:3000/admin/users');
      console.log('   Product Management: http://localhost:3000/admin/products');
      console.log('   Order Management: http://localhost:3000/admin/orders');
      console.log('   Customer Enquiries: http://localhost:3000/admin/messages');
    } else {
      console.log('\n❌ Password verification failed! Please check your setup.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setupAdmin();
