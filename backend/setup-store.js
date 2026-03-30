const sequelize = require('./config/database');
const Category = require('./models/Category');
const Product = require('./models/Product');

async function setupStore() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database\n');
    
    // Clear existing data (optional - comment out if you want to keep existing)
    console.log('🔄 Setting up store data...\n');
    
    // Categories
    const categories = [
      { name: '🔧 Engine Parts', description: 'Complete engine components and spare parts' },
      { name: '⚙️ Transmission', description: 'Gearboxes, clutches, and transmission components' },
      { name: '🛑 Brake System', description: 'Brake pads, rotors, calipers, and brake system parts' },
      { name: '🔩 Suspension', description: 'Shock absorbers, springs, and suspension components' },
      { name: '⚡ Electrical', description: 'Alternators, starters, wiring, and electrical components' },
      { name: '🔧 Clutch', description: 'Clutch plates, pressure plates, and clutch kits' },
      { name: '📊 Instruments', description: 'Dashboard instruments, gauges, and sensors' },
      { name: '🎁 Accessories', description: 'Truck accessories, tools, and add-ons' },
      { name: '❄️ Cooling System', description: 'Radiators, fans, and cooling components' },
      { name: '💨 Exhaust System', description: 'Exhaust pipes, mufflers, and emission parts' }
    ];
    
    console.log('📦 Adding categories...');
    for (const cat of categories) {
      const [category, created] = await Category.findOrCreate({
        where: { name: cat.name },
        defaults: cat
      });
      console.log(`   ${created ? '✓' : '○'} ${cat.name}`);
    }
    
    // Get categories for product assignment
    const engineCat = await Category.findOne({ where: { name: '🔧 Engine Parts' } });
    const brakeCat = await Category.findOne({ where: { name: '🛑 Brake System' } });
    const transCat = await Category.findOne({ where: { name: '⚙️ Transmission' } });
    const suspCat = await Category.findOne({ where: { name: '🔩 Suspension' } });
    const elecCat = await Category.findOne({ where: { name: '⚡ Electrical' } });
    const clutchCat = await Category.findOne({ where: { name: '🔧 Clutch' } });
    const instCat = await Category.findOne({ where: { name: '📊 Instruments' } });
    const accCat = await Category.findOne({ where: { name: '🎁 Accessories' } });
    
    // Products
    const products = [
      {
        name: 'Cummins ISX15 Engine Assembly',
        description: 'Complete remanufactured Cummins ISX15 engine for heavy-duty trucks. 500HP, 1850 lb-ft torque',
        price: 12500.00,
        stock_quantity: 5,
        category_id: engineCat.id,
        brand: 'Cummins',
        part_number: 'ISX15-500',
        specifications: { horsepower: '500 HP', torque: '1850 lb-ft', displacement: '15L' }
      },
      {
        name: 'Turbocharger Kit - Holset HX40',
        description: 'High-performance turbocharger for Cummins and Detroit engines',
        price: 1899.99,
        stock_quantity: 15,
        category_id: engineCat.id,
        brand: 'Holset',
        part_number: 'HX40-TURBO',
        specifications: { boost: '40 PSI', flow: '850 CFM' }
      },
      {
        name: 'Eaton Fuller 10-Speed Transmission',
        description: 'Rebuilt Eaton Fuller 10-speed manual transmission',
        price: 3450.00,
        stock_quantity: 8,
        category_id: transCat.id,
        brand: 'Eaton',
        part_number: 'FRO-15210C',
        specifications: { speeds: '10', torque: '1550 lb-ft' }
      },
      {
        name: 'Brake Caliper Set - Front',
        description: 'Remanufactured front brake calipers for Class 8 trucks',
        price: 399.99,
        stock_quantity: 20,
        category_id: brakeCat.id,
        brand: 'Bendix',
        part_number: 'BRK-5000',
        specifications: { pistons: '4', material: 'Cast Iron' }
      },
      {
        name: 'Air Suspension Bag',
        description: 'Heavy-duty air suspension spring for truck rear suspension',
        price: 279.99,
        stock_quantity: 35,
        category_id: suspCat.id,
        brand: 'Firestone',
        part_number: 'FS-248',
        specifications: { capacity: '5000 lbs', pressure: '100 PSI' }
      },
      {
        name: 'Heavy Duty Alternator - 200A',
        description: 'High-output alternator for heavy trucks and equipment',
        price: 449.99,
        stock_quantity: 18,
        category_id: elecCat.id,
        brand: 'Delco Remy',
        part_number: 'DR-200A',
        specifications: { amps: '200', voltage: '12V' }
      },
      {
        name: 'Clutch Kit - Heavy Duty',
        description: 'Complete heavy-duty clutch kit with pressure plate and disc',
        price: 899.99,
        stock_quantity: 12,
        category_id: clutchCat.id,
        brand: 'Eaton',
        part_number: 'CL-15.5',
        specifications: { size: '15.5"', torque: '1650 lb-ft' }
      },
      {
        name: 'Digital Dashboard Display',
        description: 'Digital instrument cluster with speedometer, tachometer, and diagnostics',
        price: 1299.99,
        stock_quantity: 8,
        category_id: instCat.id,
        brand: 'VDO',
        part_number: 'DIGI-9000',
        specifications: { screen: '7" LCD', features: 'GPS, Diagnostics' }
      },
      {
        name: 'LED Light Bar - 50"',
        description: 'High-intensity LED light bar for truck front or roof mounting',
        price: 299.99,
        stock_quantity: 20,
        category_id: accCat.id,
        brand: 'Rigid',
        part_number: 'LED-50',
        specifications: { lumens: '24,000', watts: '300' }
      }
    ];
    
    console.log('\n📦 Adding products...');
    for (const product of products) {
      const [prod, created] = await Product.findOrCreate({
        where: { part_number: product.part_number },
        defaults: product
      });
      console.log(`   ${created ? '✓' : '○'} ${product.name} ($${product.price})`);
    }
    
    console.log('\n✅ Store setup complete!');
    console.log(`📊 Added ${categories.length} categories and ${products.length} products`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setupStore();
