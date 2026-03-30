const sequelize = require('./config/database');
const Product = require('./models/Product');

const products = [
  // Engine Parts (category_id 1)
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
  // Transmission (category_id 2)
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
  // Brake System (category_id 3)
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
    name: 'Brake Pads - Ceramic',
    description: 'High-performance ceramic brake pads for heavy-duty trucks',
    price: 149.99,
    stock_quantity: 50,
    category_id: 3,
    brand: 'Wagner',
    part_number: 'WC-7000',
    specifications: { material: 'Ceramic', life: '50,000 miles' }
  },
  // Suspension (category_id 4)
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
    name: 'Shock Absorber - Heavy Duty',
    description: 'Premium gas-charged shock absorbers for heavy trucks',
    price: 89.99,
    stock_quantity: 60,
    category_id: 4,
    brand: 'Monroe',
    part_number: 'MAG-60',
    specifications: { type: 'Gas', travel: '12"' }
  },
  // Electrical (category_id 5)
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
    name: 'Starter Motor - High Torque',
    description: 'High torque starter motor for diesel engines',
    price: 399.99,
    stock_quantity: 15,
    category_id: 5,
    brand: 'Bosch',
    part_number: 'SR-898',
    specifications: { power: '5.5 kW', voltage: '12V' }
  },
  // Clutch (category_id 6)
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
  // Instruments (category_id 7)
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
  // Accessories (category_id 8)
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
    name: 'Truck Tool Box - Aluminum',
    description: 'Weather-resistant aluminum tool box for truck bed',
    price: 399.99,
    stock_quantity: 12,
    category_id: 8,
    brand: 'WeatherGuard',
    part_number: 'TB-AL48',
    specifications: { length: '48"', material: 'Aluminum' }
  },
  // Cooling System (category_id 9)
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
  // Exhaust System (category_id 10)
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

async function addProducts() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database\n');
    
    let added = 0;
    let skipped = 0;
    
    for (const product of products) {
      try {
        const [prod, created] = await Product.findOrCreate({
          where: { part_number: product.part_number },
          defaults: product
        });
        
        if (created) {
          console.log(`✓ Added: ${product.name} ($${product.price})`);
          added++;
        } else {
          console.log(`○ Exists: ${product.name}`);
          skipped++;
        }
      } catch (error) {
        console.error(`✗ Error adding ${product.name}:`, error.message);
      }
    }
    
    console.log(`\n✅ Complete! Added: ${added}, Already existed: ${skipped}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addProducts();
