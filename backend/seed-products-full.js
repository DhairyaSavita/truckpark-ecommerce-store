const sequelize = require('./config/database');
const Product = require('./models/Product');
const User = require('./models/User');

// Indian Rupee prices
const INR = (usd) => Math.round(usd * 83);

// First, get the admin user ID
let adminId = 1;

const products = [
  // ============= ENGINE PARTS (Category 1) =============
  { name: 'Cummins ISX15 Engine Assembly', description: 'Complete remanufactured Cummins ISX15 engine. 500HP, 1850 lb-ft torque', price: INR(12500), stock_quantity: 5, category_id: 1, brand: 'Cummins', part_number: 'ISX15-500', specifications: { hp: '500', torque: '1850', displacement: '15L' } },
  { name: 'Detroit Diesel Series 60 Engine', description: 'Rebuilt Detroit Diesel Series 60, 14L, 470HP', price: INR(11500), stock_quantity: 3, category_id: 1, brand: 'Detroit Diesel', part_number: 'DD60-470', specifications: { hp: '470', torque: '1650', displacement: '14L' } },
  { name: 'Caterpillar C15 Engine', description: 'Remanufactured Cat C15, 15.2L, 550HP', price: INR(14500), stock_quantity: 2, category_id: 1, brand: 'Caterpillar', part_number: 'CAT-C15-550', specifications: { hp: '550', torque: '1850', displacement: '15.2L' } },
  { name: 'Turbocharger Kit - Holset HX40', description: 'High-performance turbocharger, 40 PSI boost', price: INR(1900), stock_quantity: 15, category_id: 1, brand: 'Holset', part_number: 'HX40-TURBO', specifications: { boost: '40 PSI', flow: '850 CFM' } },
  { name: 'Fuel Injector Set - 6 Pack', description: 'High-pressure fuel injectors for Detroit Diesel', price: INR(900), stock_quantity: 12, category_id: 1, brand: 'Bosch', part_number: '0445120036', specifications: { flow: '180cc', pressure: '2000 bar' } },
  { name: 'Engine Oil Pump', description: 'High-volume oil pump for Caterpillar C15', price: INR(350), stock_quantity: 8, category_id: 1, brand: 'Caterpillar', part_number: 'CAT-OP-15', specifications: { pressure: '60 PSI', flow: '45 GPM' } },
  { name: 'Piston Ring Set', description: 'Complete piston ring set for Detroit Diesel', price: INR(300), stock_quantity: 10, category_id: 1, brand: 'Mahle', part_number: 'MAH-60S', specifications: { size: '5.3"', material: 'Steel' } },
  { name: 'Engine Head Gasket Set', description: 'Complete head gasket set for Cummins ISX', price: INR(450), stock_quantity: 7, category_id: 1, brand: 'Fel-Pro', part_number: 'FP-ISX-HG', specifications: { material: 'Multi-layer Steel' } },
  { name: 'Valve Train Kit', description: 'Complete valve train kit with pushrods', price: INR(850), stock_quantity: 4, category_id: 1, brand: 'Cummins', part_number: 'ISX-VTK', specifications: { valves: '24' } },
  { name: 'Camshaft Kit', description: 'Performance camshaft for increased torque', price: INR(1200), stock_quantity: 3, category_id: 1, brand: 'Comp Cams', part_number: 'CC-ISX-CAM', specifications: { duration: '220/220', lift: '0.450"' } },
  { name: 'Connecting Rod Set', description: 'Forged steel connecting rods', price: INR(750), stock_quantity: 6, category_id: 1, brand: 'Carrillo', part_number: 'CAR-ROD', specifications: { material: 'Forged Steel', length: '7.5"' } },
  { name: 'Crankshaft Assembly', description: 'Forged steel crankshaft for Cummins', price: INR(2200), stock_quantity: 2, category_id: 1, brand: 'Cummins', part_number: 'ISX-CRANK', specifications: { stroke: '6.5"', material: 'Forged' } },
  { name: 'Engine Timing Kit', description: 'Complete timing chain and gear kit', price: INR(550), stock_quantity: 5, category_id: 1, brand: 'Cloyes', part_number: 'CLY-TIMING', specifications: { type: 'Gear Drive' } },
  { name: 'Oil Cooler Assembly', description: 'High-efficiency oil cooler for ISX', price: INR(480), stock_quantity: 4, category_id: 1, brand: 'Cummins', part_number: 'ISX-OIL-CLR', specifications: { capacity: '12 quart' } },
  { name: 'Water Pump', description: 'Heavy-duty water pump for Detroit Diesel', price: INR(280), stock_quantity: 12, category_id: 1, brand: 'Gates', part_number: 'GAT-WP-60', specifications: { flow: '180 GPH' } },
  
  // ============= TRANSMISSION (Category 2) =============
  { name: 'Eaton Fuller 10-Speed Transmission', description: 'Rebuilt 10-speed manual transmission', price: INR(3450), stock_quantity: 5, category_id: 2, brand: 'Eaton', part_number: 'FRO-15210C', specifications: { speeds: '10', torque: '1550 lb-ft' } },
  { name: 'Eaton Fuller 13-Speed Transmission', description: 'Rebuilt 13-speed for long haul', price: INR(4200), stock_quantity: 3, category_id: 2, brand: 'Eaton', part_number: 'FRO-15213C', specifications: { speeds: '13', torque: '1550 lb-ft' } },
  { name: 'Allison 4000 Series Transmission', description: 'Automatic transmission for heavy trucks', price: INR(6800), stock_quantity: 2, category_id: 2, brand: 'Allison', part_number: 'AL-4000', specifications: { speeds: '6', torque: '1650 lb-ft' } },
  { name: 'Transmission Rebuild Kit', description: 'Complete overhaul kit for Eaton Fuller', price: INR(900), stock_quantity: 8, category_id: 2, brand: 'Eaton', part_number: 'KIT-15210', specifications: { includes: 'Gaskets, Seals, Bearings' } },
  { name: 'Transmission Filter Kit', description: 'Complete filter kit for Allison', price: INR(85), stock_quantity: 20, category_id: 2, brand: 'Allison', part_number: 'AL-FILTER', specifications: { type: 'Spin-on' } },
  { name: 'Transmission Oil Cooler', description: 'High-efficiency oil cooler', price: INR(280), stock_quantity: 12, category_id: 2, brand: 'Hayden', part_number: 'HD-OC-400', specifications: { capacity: '20,000 BTU' } },
  
  // ============= BRAKE SYSTEM (Category 3) =============
  { name: 'Brake Caliper Set - Front', description: 'Remanufactured front brake calipers', price: INR(400), stock_quantity: 15, category_id: 3, brand: 'Bendix', part_number: 'BRK-5000', specifications: { pistons: '4' } },
  { name: 'Brake Pads - Ceramic', description: 'High-performance ceramic brake pads', price: INR(150), stock_quantity: 40, category_id: 3, brand: 'Wagner', part_number: 'WC-7000', specifications: { material: 'Ceramic', life: '50,000 miles' } },
  { name: 'Air Brake Chamber', description: 'Type 30 air brake chamber', price: INR(130), stock_quantity: 25, category_id: 3, brand: 'Bendix', part_number: 'BC-30', specifications: { type: 'Type 30', stroke: '3"' } },
  { name: 'Brake Rotor - Drilled', description: 'High-performance drilled brake rotors', price: INR(220), stock_quantity: 18, category_id: 3, brand: 'PowerStop', part_number: 'PS-ROTOR', specifications: { diameter: '15"' } },
  { name: 'Brake Line Kit - Stainless Steel', description: 'Complete stainless steel braided brake lines', price: INR(180), stock_quantity: 10, category_id: 3, brand: 'Goodridge', part_number: 'GR-SS-BRAKE', specifications: { material: 'Stainless Steel' } },
  { name: 'Brake Shoe Set', description: 'Complete brake shoe set for rear axle', price: INR(280), stock_quantity: 12, category_id: 3, brand: 'Bendix', part_number: 'BS-REAR', specifications: { size: '16.5"' } },
  
  // ============= SUSPENSION (Category 4) =============
  { name: 'Air Suspension Bag', description: 'Heavy-duty air suspension spring', price: INR(280), stock_quantity: 20, category_id: 4, brand: 'Firestone', part_number: 'FS-248', specifications: { capacity: '5000 lbs' } },
  { name: 'Shock Absorber - Heavy Duty', description: 'Premium gas-charged shock absorbers', price: INR(90), stock_quantity: 45, category_id: 4, brand: 'Monroe', part_number: 'MAG-60', specifications: { type: 'Gas', travel: '12"' } },
  { name: 'Leaf Spring Assembly', description: 'Complete leaf spring assembly', price: INR(590), stock_quantity: 8, category_id: 4, brand: 'Hendrickson', part_number: 'HND-8500', specifications: { capacity: '20000 lbs', leaves: '7' } },
  { name: 'Steering Damper', description: 'Heavy-duty steering stabilizer', price: INR(120), stock_quantity: 15, category_id: 4, brand: 'Rancho', part_number: 'RAN-STAB', specifications: { type: 'Gas' } },
  
  // ============= ELECTRICAL (Category 5) =============
  { name: 'Heavy Duty Alternator - 200A', description: 'High-output alternator', price: INR(450), stock_quantity: 12, category_id: 5, brand: 'Delco Remy', part_number: 'DR-200A', specifications: { amps: '200', voltage: '12V' } },
  { name: 'Starter Motor - High Torque', description: 'High torque starter for diesel engines', price: INR(400), stock_quantity: 10, category_id: 5, brand: 'Bosch', part_number: 'SR-898', specifications: { power: '5.5 kW' } },
  { name: 'LED Headlight Conversion Kit', description: 'High brightness LED headlights', price: INR(300), stock_quantity: 25, category_id: 5, brand: 'LED Pro', part_number: 'LED-H7-KIT', specifications: { lumens: '10000' } },
  { name: 'Battery Box - Dual Battery', description: 'Heavy duty dual battery box', price: INR(190), stock_quantity: 15, category_id: 5, brand: 'Optima', part_number: 'OPT-BBOX', specifications: { capacity: '2 batteries' } },
  { name: 'Wire Harness Kit', description: 'Complete wiring harness', price: INR(450), stock_quantity: 8, category_id: 5, brand: 'Painless', part_number: 'PL-101', specifications: { length: '20ft' } },
  
  // ============= CLUTCH (Category 6) =============
  { name: 'Clutch Kit - Heavy Duty', description: 'Complete heavy-duty clutch kit', price: INR(900), stock_quantity: 8, category_id: 6, brand: 'Eaton', part_number: 'CL-15.5', specifications: { size: '15.5"', torque: '1650 lb-ft' } },
  { name: 'Clutch Release Bearing', description: 'Heavy-duty clutch release bearing', price: INR(90), stock_quantity: 20, category_id: 6, brand: 'SKF', part_number: 'SKF-685', specifications: { type: 'Self-aligning' } },
  
  // ============= INSTRUMENTS (Category 7) =============
  { name: 'Digital Dashboard Display', description: 'Digital instrument cluster', price: INR(1300), stock_quantity: 5, category_id: 7, brand: 'VDO', part_number: 'DIGI-9000', specifications: { screen: '7" LCD', features: 'GPS, Diagnostics' } },
  { name: 'EGT Gauge Kit', description: 'Exhaust Gas Temperature gauge', price: INR(150), stock_quantity: 12, category_id: 7, brand: 'Autometer', part_number: 'EGT-800', specifications: { range: '0-1600°F' } },
  { name: 'Boost Gauge', description: 'Turbo boost pressure gauge', price: INR(95), stock_quantity: 18, category_id: 7, brand: 'Autometer', part_number: 'BST-600', specifications: { range: '0-60 PSI' } },
  
  // ============= ACCESSORIES (Category 8) =============
  { name: 'LED Light Bar - 50"', description: 'High-intensity LED light bar', price: INR(300), stock_quantity: 12, category_id: 8, brand: 'Rigid', part_number: 'LED-50', specifications: { lumens: '24000', waterproof: 'IP68' } },
  { name: 'Mud Flaps - Set of 2', description: 'Heavy-duty rubber mud flaps', price: INR(80), stock_quantity: 30, category_id: 8, brand: 'FlexiFlap', part_number: 'MF-24', specifications: { size: '24"x24"' } },
  { name: 'Truck Tool Box - Aluminum', description: 'Weather-resistant aluminum tool box', price: INR(400), stock_quantity: 8, category_id: 8, brand: 'WeatherGuard', part_number: 'TB-AL48', specifications: { length: '48"' } },
  { name: 'Floor Mats - Heavy Duty', description: 'Custom fit heavy duty floor mats', price: INR(120), stock_quantity: 25, category_id: 8, brand: 'Husky', part_number: 'HUS-MAT', specifications: { material: 'Rubber' } },
  { name: 'Seat Cover Set', description: 'Premium truck seat covers', price: INR(250), stock_quantity: 15, category_id: 8, brand: 'Coverking', part_number: 'CV-SEAT', specifications: { material: 'Neoprene' } }
];

const seedDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database');
    
    // Get admin user ID
    const admin = await User.findOne({ where: { role: 'admin' } });
    if (admin) {
      adminId = admin.id;
      console.log(`✅ Using admin ID: ${adminId} as seller`);
    }
    
    // Clear existing products
    await Product.destroy({ where: {}, truncate: true, cascade: true });
    console.log('✅ Cleared existing products');
    
    let added = 0;
    for (const product of products) {
      try {
        // Add seller_id to each product
        const productWithSeller = {
          ...product,
          seller_id: adminId
        };
        await Product.create(productWithSeller);
        console.log(`✓ Added: ${product.name} - ₹${product.price}`);
        added++;
      } catch (error) {
        console.error(`✗ Failed to add ${product.name}:`, error.message);
      }
    }
    
    console.log(`\n✅ Seeding completed! Added ${added} products`);
    console.log(`📊 Total products in database: ${added}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

seedDatabase();
