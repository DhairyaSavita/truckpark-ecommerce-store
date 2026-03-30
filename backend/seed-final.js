const sequelize = require('./config/database');
const Category = require('./models/Category');
const Product = require('./models/Product');

const categories = [
  { name: 'Engine Parts', description: 'Complete engine components and spare parts for all truck models' },
  { name: 'Transmission', description: 'Gearboxes, clutches, and transmission components' },
  { name: 'Brake System', description: 'Brake pads, rotors, calipers, and brake system parts' },
  { name: 'Suspension', description: 'Shock absorbers, springs, and suspension components' },
  { name: 'Electrical', description: 'Alternators, starters, wiring, and electrical components' },
  { name: 'Clutch', description: 'Clutch plates, pressure plates, and clutch kits' },
  { name: 'Instruments', description: 'Dashboard instruments, gauges, and sensors' },
  { name: 'Accessories', description: 'Truck accessories, tools, and add-ons' },
  { name: 'Cooling System', description: 'Radiators, fans, and cooling components' },
  { name: 'Exhaust System', description: 'Exhaust pipes, mufflers, and emission parts' }
];

const products = [
  {
    name: 'Cummins ISX15 Engine Assembly',
    description: 'Complete remanufactured Cummins ISX15 engine for heavy-duty trucks',
    price: 12500.00,
    stock_quantity: 5,
    category_id: 1,
    brand: 'Cummins',
    part_number: 'ISX15-500',
    specifications: { horsepower: '500 HP', torque: '1850 lb-ft', displacement: '15L' }
  },
  {
    name: 'Turbocharger Kit - Holset HX40',
    description: 'High-performance turbocharger for Cummins and Detroit engines',
    price: 1899.99,
    stock_quantity: 15,
    category_id: 1,
    brand: 'Holset',
    part_number: 'HX40-TURBO',
    specifications: { boost: '40 PSI', flow: '850 CFM' }
  },
  {
    name: 'Eaton Fuller 10-Speed Transmission',
    description: 'Rebuilt Eaton Fuller 10-speed manual transmission',
    price: 3450.00,
    stock_quantity: 8,
    category_id: 2,
    brand: 'Eaton',
    part_number: 'FRO-15210C',
    specifications: { speeds: '10', torque: '1550 lb-ft' }
  },
  {
    name: 'Brake Caliper Set - Front',
    description: 'Remanufactured front brake calipers for Class 8 trucks',
    price: 399.99,
    stock_quantity: 20,
    category_id: 3,
    brand: 'Bendix',
    part_number: 'BRK-5000',
    specifications: { pistons: '4', material: 'Cast Iron' }
  },
  {
    name: 'Air Suspension Bag',
    description: 'Heavy-duty air suspension spring for truck rear suspension',
    price: 279.99,
    stock_quantity: 35,
    category_id: 4,
    brand: 'Firestone',
    part_number: 'FS-248',
    specifications: { capacity: '5000 lbs', pressure: '100 PSI' }
  },
  {
    name: 'Heavy Duty Alternator - 200A',
    description: 'High-output alternator for heavy trucks and equipment',
    price: 449.99,
    stock_quantity: 18,
    category_id: 5,
    brand: 'Delco Remy',
    part_number: 'DR-200A',
    specifications: { amps: '200', voltage: '12V' }
  },
  {
    name: 'Clutch Kit - Heavy Duty',
    description: 'Complete heavy-duty clutch kit with pressure plate and disc',
    price: 899.99,
    stock_quantity: 12,
    category_id: 6,
    brand: 'Eaton',
    part_number: 'CL-15.5',
    specifications: { size: '15.5"', torque: '1650 lb-ft' }
  },
  {
    name: 'Digital Dashboard Display',
    description: 'Digital instrument cluster with speedometer, tachometer, and diagnostics',
    price: 1299.99,
    stock_quantity: 8,
    category_id: 7,
    brand: 'VDO',
    part_number: 'DIGI-9000',
    specifications: { screen: '7" LCD', features: 'GPS, Diagnostics' }
  },
  {
    name: 'LED Light Bar - 50"',
    description: 'High-intensity LED light bar for truck front or roof mounting',
    price: 299.99,
    stock_quantity: 20,
    category_id: 8,
    brand: 'Rigid',
    part_number: 'LED-50',
    specifications: { lumens: '24,000', watts: '300' }
  },
  {
    name: 'Radiator - Heavy Duty',
    description: 'Aluminum heavy-duty radiator for Class 8 trucks',
    price: 799.99,
    stock_quantity: 10,
    category_id: 9,
    brand: 'Spectra',
    part_number: 'RD-990',
    specifications: { core: '4-row', material: 'Aluminum' }
  },
  {
    name: 'Exhaust Muffler - Straight Through',
    description: 'High-flow straight-through muffler for diesel engines',
    price: 249.99,
    stock_quantity: 15,
    category_id: 10,
    brand: 'Magnaflow',
    part_number: 'MF-5000',
    specifications: { inlet: '5"', outlet: '5"', length: '36"' }
  }
];

const seedDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database');
    
    // Clear existing data
    await Product.destroy({ where: {}, truncate: true, cascade: true });
    await Category.destroy({ where: {}, truncate: true, cascade: true });
    console.log('✅ Cleared existing data');
    
    // Insert categories
    for (let i = 0; i < categories.length; i++) {
      const category = await Category.create(categories[i]);
      console.log(`✓ Created category: ${category.name} (ID: ${category.id})`);
    }
    
    // Insert products
    for (const product of products) {
      const created = await Product.create(product);
      console.log(`✓ Created product: ${created.name}`);
    }
    
    console.log('\n✅ Database seeding completed successfully!');
    console.log(`📊 Created ${categories.length} categories and ${products.length} products`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
