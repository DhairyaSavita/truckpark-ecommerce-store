const sequelize = require('./config/database');
const Product = require('./models/Product');
const User = require('./models/User');

const addProducts = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database');
    
    // Get the admin user as default seller
    const admin = await User.findOne({ where: { email: 'admin@truckparts.com' } });
    if (!admin) {
      console.log('Admin not found, creating...');
      const bcrypt = require('bcryptjs');
      await User.create({
        name: 'Admin',
        email: 'admin@truckparts.com',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin'
      });
    }
    
    const sellerId = admin ? admin.id : 1;
    
    // Sample products
    const products = [
      {
        name: 'Cummins ISX15 Engine Assembly',
        description: 'Complete remanufactured Cummins ISX15 engine',
        price: 12500.00,
        stock_quantity: 5,
        category_id: 1,
        seller_id: sellerId,
        brand: 'Cummins',
        part_number: 'ISX15-500'
      },
      {
        name: 'Turbocharger Kit',
        description: 'High-performance turbocharger',
        price: 1899.99,
        stock_quantity: 15,
        category_id: 1,
        seller_id: sellerId,
        brand: 'Holset',
        part_number: 'HX40-TURBO'
      },
      {
        name: 'Eaton Fuller Transmission',
        description: '10-speed manual transmission',
        price: 3450.00,
        stock_quantity: 8,
        category_id: 2,
        seller_id: sellerId,
        brand: 'Eaton',
        part_number: 'FRO-15210C'
      }
    ];
    
    for (const product of products) {
      const [prod, created] = await Product.findOrCreate({
        where: { part_number: product.part_number },
        defaults: product
      });
      console.log(`${created ? '✓ Added' : '○ Already exists'}: ${product.name}`);
    }
    
    console.log('\n✅ Products added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

addProducts();
