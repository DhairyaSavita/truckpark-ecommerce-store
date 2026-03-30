const sequelize = require('./config/database');
const Category = require('./models/Category');
const Product = require('./models/Product');

async function addProducts() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database\n');
    
    // Get current categories
    const categories = await Category.findAll();
    console.log('📋 Available Categories:');
    categories.forEach(cat => {
      console.log(`   ID ${cat.id}: ${cat.name}`);
    });
    
    // Create category map
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.name] = cat.id;
    });
    
    // Products to add
    const products = [
      {
        name: 'Cummins ISX15 Engine Assembly',
        description: 'Complete remanufactured Cummins ISX15 engine for heavy-duty trucks. 500HP, 1850 lb-ft torque',
        price: 12500.00,
        stock_quantity: 5,
        category_name: 'Engine Parts',
        brand: 'Cummins',
        part_number: 'ISX15-500',
        specifications: { horsepower: '500 HP', torque: '1850 lb-ft', displacement: '15L' }
      },
      {
        name: 'Turbocharger Kit - Holset HX40',
        description: 'High-performance turbocharger for Cummins and Detroit engines',
        price: 1899.99,
        stock_quantity: 15,
        category_name: 'Engine Parts',
        brand: 'Holset',
        part_number: 'HX40-TURBO',
        specifications: { boost: '40 PSI', flow: '850 CFM' }
      },
      {
        name: 'Eaton Fuller 10-Speed Transmission',
        description: 'Rebuilt Eaton Fuller 10-speed manual transmission',
        price: 3450.00,
        stock_quantity: 8,
        category_name: 'Transmission',
        brand: 'Eaton',
        part_number: 'FRO-15210C',
        specifications: { speeds: '10', torque: '1550 lb-ft' }
      },
      {
        name: 'Brake Caliper Set - Front',
        description: 'Remanufactured front brake calipers for Class 8 trucks',
        price: 399.99,
        stock_quantity: 20,
        category_name: 'Brake System',
        brand: 'Bendix',
        part_number: 'BRK-5000',
        specifications: { pistons: '4', material: 'Cast Iron' }
      },
      {
        name: 'Brake Pads - Ceramic',
        description: 'High-performance ceramic brake pads for heavy-duty trucks',
        price: 149.99,
        stock_quantity: 50,
        category_name: 'Brake System',
        brand: 'Wagner',
        part_number: 'WC-7000',
        specifications: { material: 'Ceramic', life: '50,000 miles' }
      },
      {
        name: 'Air Suspension Bag',
        description: 'Heavy-duty air suspension spring for truck rear suspension',
        price: 279.99,
        stock_quantity: 35,
        category_name: 'Suspension',
        brand: 'Firestone',
        part_number: 'FS-248',
        specifications: { capacity: '5000 lbs', pressure: '100 PSI' }
      },
      {
        name: 'Shock Absorber - Heavy Duty',
        description: 'Premium gas-charged shock absorbers for heavy trucks',
        price: 89.99,
        stock_quantity: 60,
        category_name: 'Suspension',
        brand: 'Monroe',
        part_number: 'MAG-60',
        specifications: { type: 'Gas', travel: '12"' }
      },
      {
        name: 'Heavy Duty Alternator - 200A',
        description: 'High-output alternator for heavy trucks and equipment',
        price: 449.99,
        stock_quantity: 18,
        category_name: 'Electrical',
        brand: 'Delco Remy',
        part_number: 'DR-200A',
        specifications: { amps: '200', voltage: '12V' }
      },
      {
        name: 'Starter Motor - High Torque',
        description: 'High torque starter motor for diesel engines',
        price: 399.99,
        stock_quantity: 15,
        category_name: 'Electrical',
        brand: 'Bosch',
        part_number: 'SR-898',
        specifications: { power: '5.5 kW', voltage: '12V' }
      },
      {
        name: 'Clutch Kit - Heavy Duty',
        description: 'Complete heavy-duty clutch kit with pressure plate and disc',
        price: 899.99,
        stock_quantity: 12,
        category_name: 'Clutch',
        brand: 'Eaton',
        part_number: 'CL-15.5',
        specifications: { size: '15.5"', torque: '1650 lb-ft' }
      },
      {
        name: 'Digital Dashboard Display',
        description: 'Digital instrument cluster with speedometer, tachometer, and diagnostics',
        price: 1299.99,
        stock_quantity: 8,
        category_name: 'Instruments',
        brand: 'VDO',
        part_number: 'DIGI-9000',
        specifications: { screen: '7" LCD', features: 'GPS, Diagnostics' }
      },
      {
        name: 'LED Light Bar - 50"',
        description: 'High-intensity LED light bar for truck front or roof mounting',
        price: 299.99,
        stock_quantity: 20,
        category_name: 'Accessories',
        brand: 'Rigid',
        part_number: 'LED-50',
        specifications: { lumens: '24,000', watts: '300' }
      },
      {
        name: 'Truck Tool Box - Aluminum',
        description: 'Weather-resistant aluminum tool box for truck bed',
        price: 399.99,
        stock_quantity: 12,
        category_name: 'Accessories',
        brand: 'WeatherGuard',
        part_number: 'TB-AL48',
        specifications: { length: '48"', material: 'Aluminum' }
      },
      {
        name: 'Radiator - Heavy Duty',
        description: 'Aluminum heavy-duty radiator for Class 8 trucks',
        price: 799.99,
        stock_quantity: 10,
        category_name: 'Cooling System',
        brand: 'Spectra',
        part_number: 'RD-990',
        specifications: { core: '4-row', material: 'Aluminum' }
      },
      {
        name: 'Exhaust Muffler - Straight Through',
        description: 'High-flow straight-through muffler for diesel engines',
        price: 249.99,
        stock_quantity: 15,
        category_name: 'Exhaust System',
        brand: 'Magnaflow',
        part_number: 'MF-5000',
        specifications: { inlet: '5"', outlet: '5"', length: '36"' }
      }
    ];
    
    console.log('\n📦 Adding products...\n');
    
    let added = 0;
    let skipped = 0;
    
    for (const product of products) {
      const categoryId = categoryMap[product.category_name];
      
      if (!categoryId) {
        console.log(`   ⚠️  Skipping ${product.name} - Category "${product.category_name}" not found`);
        skipped++;
        continue;
      }
      
      const [prod, created] = await Product.findOrCreate({
        where: { part_number: product.part_number },
        defaults: {
          name: product.name,
          description: product.description,
          price: product.price,
          stock_quantity: product.stock_quantity,
          category_id: categoryId,
          brand: product.brand,
          part_number: product.part_number,
          specifications: product.specifications
        }
      });
      
      if (created) {
        console.log(`   ✓ ${product.name} ($${product.price})`);
        added++;
      } else {
        console.log(`   ○ ${product.name} - Already exists`);
        skipped++;
      }
    }
    
    console.log('\n✅ Products added successfully!');
    console.log(`📊 Added: ${added} products, Skipped: ${skipped} products`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addProducts();
