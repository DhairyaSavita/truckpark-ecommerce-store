const sequelize = require('./config/database');
const Product = require('./models/Product');
const Category = require('./models/Category');

const products = [
  // Engine Parts - More products
  {
    name: 'Cummins ISX15 Engine Assembly',
    description: 'Complete remanufactured Cummins ISX15 engine, 500HP, tested and certified',
    price: 12500.00,
    stock_quantity: 3,
    category_id: 1,
    brand: 'Cummins',
    part_number: 'ISX15-500',
    specifications: { hp: '500', torque: '1850 lb-ft', cylinders: '6' }
  },
  {
    name: 'Detroit Diesel Series 60 Engine',
    description: 'Rebuilt Detroit Diesel Series 60, 14L, 470HP',
    price: 9800.00,
    stock_quantity: 2,
    category_id: 1,
    brand: 'Detroit Diesel',
    part_number: 'DD60-470',
    specifications: { hp: '470', torque: '1650 lb-ft', cylinders: '6' }
  },
  {
    name: 'Caterpillar C15 Engine',
    description: 'Remanufactured Cat C15, 15.2L, 550HP',
    price: 14500.00,
    stock_quantity: 2,
    category_id: 1,
    brand: 'Caterpillar',
    part_number: 'CAT-C15-550',
    specifications: { hp: '550', torque: '1850 lb-ft', cylinders: '6' }
  },
  // Transmission - More products
  {
    name: 'Eaton Fuller 13-Speed Transmission',
    description: 'Rebuilt Eaton Fuller 13-speed, heavy duty',
    price: 4200.00,
    stock_quantity: 5,
    category_id: 2,
    brand: 'Eaton',
    part_number: 'FRO-15213C',
    specifications: { speeds: '13', torque: '1550 lb-ft' }
  },
  {
    name: 'Allison 4000 Series Transmission',
    description: 'Automatic transmission for heavy trucks',
    price: 6800.00,
    stock_quantity: 3,
    category_id: 2,
    brand: 'Allison',
    part_number: 'AL-4000',
    specifications: { speeds: '6', torque: '1650 lb-ft' }
  },
  // Brake System - More products
  {
    name: 'Disc Brake Caliper Kit',
    description: 'Complete front disc brake caliper kit with pads',
    price: 450.00,
    stock_quantity: 25,
    category_id: 3,
    brand: 'Bendix',
    part_number: 'BRK-6000',
    specifications: { pistons: '4', material: 'Cast Iron' }
  },
  {
    name: 'Air Brake Chamber Type 30',
    description: 'Heavy duty air brake chamber',
    price: 159.99,
    stock_quantity: 40,
    category_id: 3,
    brand: 'Haldex',
    part_number: 'HALDEX-30',
    specifications: { type: 'Type 30', stroke: '2.5"' }
  },
  // Suspension - More products
  {
    name: 'Shock Absorber Set - Heavy Duty',
    description: 'Set of 4 heavy duty shock absorbers',
    price: 399.99,
    stock_quantity: 15,
    category_id: 4,
    brand: 'Monroe',
    part_number: 'MON-68518',
    specifications: { type: 'Gas', travel: '12"' }
  },
  {
    name: 'Leaf Spring Assembly',
    description: 'Complete leaf spring assembly for rear axle',
    price: 589.99,
    stock_quantity: 12,
    category_id: 4,
    brand: 'Hendrickson',
    part_number: 'HND-8500',
    specifications: { capacity: '20000 lbs', leaves: '7' }
  },
  // Electrical - More products
  {
    name: 'LED Headlight Conversion Kit',
    description: 'High brightness LED headlights, DOT approved',
    price: 299.99,
    stock_quantity: 30,
    category_id: 5,
    brand: 'LED Pro',
    part_number: 'LED-H7-KIT',
    specifications: { lumens: '10000', watts: '50' }
  },
  {
    name: 'Battery Box - Dual Battery',
    description: 'Heavy duty dual battery box with cables',
    price: 189.99,
    stock_quantity: 20,
    category_id: 5,
    brand: 'Optima',
    part_number: 'OPT-BBOX',
    specifications: { capacity: '2 batteries', material: 'Steel' }
  }
];

const addProducts = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database');
    
    let added = 0;
    for (const product of products) {
      const [prod, created] = await Product.findOrCreate({
        where: { part_number: product.part_number },
        defaults: product
      });
      if (created) {
        console.log(`✓ Added: ${product.name}`);
        added++;
      }
    }
    
    console.log(`\n✅ Added ${added} new products!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

addProducts();
