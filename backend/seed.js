const sequelize = require('./config/database');
const Product = require('./models/Product');
const Category = require('./models/Category');

// Define categories
const categories = [
  { name: 'Engine Parts', description: 'Complete engine components and spare parts for all truck models', image_url: '/images/engine.jpg' },
  { name: 'Transmission', description: 'Gearboxes, clutches, and transmission components', image_url: '/images/transmission.jpg' },
  { name: 'Brake System', description: 'Brake pads, rotors, calipers, and brake system parts', image_url: '/images/brakes.jpg' },
  { name: 'Suspension', description: 'Shock absorbers, springs, and suspension components', image_url: '/images/suspension.jpg' },
  { name: 'Electrical', description: 'Alternators, starters, wiring, and electrical components', image_url: '/images/electrical.jpg' },
  { name: 'Clutch', description: 'Clutch plates, pressure plates, and clutch kits', image_url: '/images/clutch.jpg' },
  { name: 'Instruments', description: 'Dashboard instruments, gauges, and sensors', image_url: '/images/instruments.jpg' },
  { name: 'Accessories', description: 'Truck accessories, tools, and add-ons', image_url: '/images/accessories.jpg' },
  { name: 'Cooling System', description: 'Radiators, fans, and cooling components', image_url: '/images/cooling.jpg' },
  { name: 'Exhaust System', description: 'Exhaust pipes, mufflers, and emission parts', image_url: '/images/exhaust.jpg' }
];

// Define products for each category
const products = [
  // Engine Parts
  {
    name: 'Cummins ISX15 Engine Assembly',
    description: 'Complete remanufactured Cummins ISX15 engine for heavy-duty trucks. 500HP, 1850 lb-ft torque',
    price: 12500.00,
    stock_quantity: 5,
    category_id: 1,
    brand: 'Cummins',
    part_number: 'ISX15-500',
    specifications: { horsepower: '500 HP', torque: '1850 lb-ft', displacement: '15L', cylinders: '6' },
    image_url: 'https://images.unsplash.com/photo-1581092335871-4e1e5f5f8e6c?w=500'
  },
  {
    name: 'Turbocharger Kit - Holset HX40',
    description: 'High-performance turbocharger for Cummins and Detroit engines',
    price: 1899.99,
    stock_quantity: 15,
    category_id: 1,
    brand: 'Holset',
    part_number: 'HX40-TURBO',
    specifications: { boost: '40 PSI', flow: '850 CFM', wastegate: 'Internal' },
    image_url: 'https://images.unsplash.com/photo-1581092335871-4e1e5f5f8e6c?w=500'
  },
  {
    name: 'Fuel Injector Set - 6 Pack',
    description: 'High-pressure fuel injectors for Detroit Diesel Series 60',
    price: 899.99,
    stock_quantity: 25,
    category_id: 1,
    brand: 'Bosch',
    part_number: '0445120036',
    specifications: { flow: '180cc', pressure: '2000 bar', nozzles: '6' },
    image_url: 'https://images.unsplash.com/photo-1581092335871-4e1e5f5f8e6c?w=500'
  },
  {
    name: 'Engine Oil Pump',
    description: 'High-volume oil pump for Caterpillar C15 engine',
    price: 349.99,
    stock_quantity: 30,
    category_id: 1,
    brand: 'Caterpillar',
    part_number: 'CAT-OP-15',
    specifications: { pressure: '60 PSI', flow: '45 GPM', type: 'Gear' },
    image_url: 'https://images.unsplash.com/photo-1581092335871-4e1e5f5f8e6c?w=500'
  },
  {
    name: 'Piston Ring Set',
    description: 'Complete piston ring set for Detroit Diesel 60 series',
    price: 299.99,
    stock_quantity: 20,
    category_id: 1,
    brand: 'Mahle',
    part_number: 'MAH-60S',
    specifications: { size: '5.3"', material: 'Steel', type: 'Compression' },
    image_url: 'https://images.unsplash.com/photo-1581092335871-4e1e5f5f8e6c?w=500'
  },
  
  // Transmission
  {
    name: 'Eaton Fuller 10-Speed Transmission',
    description: 'Rebuilt Eaton Fuller 10-speed manual transmission',
    price: 3450.00,
    stock_quantity: 8,
    category_id: 2,
    brand: 'Eaton',
    part_number: 'FRO-15210C',
    specifications: { speeds: '10', torque: '1550 lb-ft', weight: '660 lbs' },
    image_url: 'https://images.unsplash.com/photo-1581092335871-4e1e5f5f8e6c?w=500'
  },
  {
    name: 'Transmission Rebuild Kit',
    description: 'Complete overhaul kit for Eaton Fuller transmissions',
    price: 899.99,
    stock_quantity: 12,
    category_id: 2,
    brand: 'Eaton',
    part_number: 'KIT-15210',
    specifications: { includes: 'Gaskets, Seals, Bearings', type: 'Master' },
    image_url: 'https://images.unsplash.com/photo-1581092335871-4e1e5f5f8e6c?w=500'
  },
  
  // Brake System
  {
    name: 'Brake Caliper Set - Front',
    description: 'Remanufactured front brake calipers for Class 8 trucks',
    price: 399.99,
    stock_quantity: 20,
    category_id: 3,
    brand: 'Bendix',
    part_number: 'BRK-5000',
    specifications: { pistons: '4', material: 'Cast Iron', position: 'Front' },
    image_url: 'https://images.unsplash.com/photo-1581092335871-4e1e5f5f8e6c?w=500'
  },
  {
    name: 'Brake Pads - Ceramic',
    description: 'High-performance ceramic brake pads for heavy-duty trucks',
    price: 149.99,
    stock_quantity: 50,
    category_id: 3,
    brand: 'Wagner',
    part_number: 'WC-7000',
    specifications: { material: 'Ceramic', life: '50,000 miles', warranty: '2 years' },
    image_url: 'https://images.unsplash.com/photo-1581092335871-4e1e5f5f8e6c?w=500'
  },
  {
    name: 'Air Brake Chamber',
    description: 'Type 30 air brake chamber for truck air brake systems',
    price: 129.99,
    stock_quantity: 40,
    category_id: 3,
    brand: 'Bendix',
    part_number: 'BC-30',
    specifications: { type: 'Type 30', stroke: '3"', diaphragm: 'Rubber' },
    image_url: 'https://images.unsplash.com/photo-1581092335871-4e1e5f5f8e6c?w=500'
  },
  
  // Suspension
  {
    name: 'Air Suspension Bag',
    description: 'Heavy-duty air suspension spring for truck rear suspension',
    price: 279.99,
    stock_quantity: 35,
    category_id: 4,
    brand: 'Firestone',
    part_number: 'FS-248',
    specifications: { capacity: '5000 lbs', pressure: '100 PSI', diameter: '10"' },
    image_url: 'https://images.unsplash.com/photo-1581092335871-4e1e5f5f8e6c?w=500'
  },
  {
    name: 'Shock Absorber - Heavy Duty',
    description: 'Premium gas-charged shock absorbers for heavy trucks',
    price: 89.99,
    stock_quantity: 60,
    category_id: 4,
    brand: 'Monroe',
    part_number: 'MAG-60',
    specifications: { type: 'Gas', travel: '12"', damping: 'Heavy Duty' },
    image_url: 'https://images.unsplash.com/photo-1581092335871-4e1e5f5f8e6c?w=500'
  },
  
  // Electrical
  {
    name: 'Heavy Duty Alternator - 200A',
    description: 'High-output alternator for heavy trucks and equipment',
    price: 449.99,
    stock_quantity: 18,
    category_id: 5,
    brand: 'Delco Remy',
    part_number: 'DR-200A',
    specifications: { amps: '200', voltage: '12V', type: 'Brushless' },
    image_url: 'https://images.unsplash.com/photo-1581092335871-4e1e5f5f8e6c?w=500'
  },
  {
    name: 'Starter Motor - High Torque',
    description: 'High torque starter motor for diesel engines',
    price: 399.99,
    stock_quantity: 15,
    category_id: 5,
    brand: 'Bosch',
    part_number: 'SR-898',
    specifications: { power: '5.5 kW', voltage: '12V', teeth: '12' },
    image_url: 'https://images.unsplash.com/photo-1581092335871-4e1e5f5f8e6c?w=500'
  },
  
  // Clutch
  {
    name: 'Clutch Kit - Heavy Duty',
    description: 'Complete heavy-duty clutch kit with pressure plate and disc',
    price: 899.99,
    stock_quantity: 12,
    category_id: 6,
    brand: 'Eaton',
    part_number: 'CL-15.5',
    specifications: { size: '15.5"', torque: '1650 lb-ft', type: 'Ceramic' },
    image_url: 'https://images.unsplash.com/photo-1581092335871-4e1e5f5f8e6c?w=500'
  },
  {
    name: 'Clutch Release Bearing',
    description: 'Heavy-duty clutch release bearing for Eaton transmissions',
    price: 89.99,
    stock_quantity: 30,
    category_id: 6,
    brand: 'SKF',
    part_number: 'SKF-685',
    specifications: { type: 'Self-aligning', material: 'Steel', warranty: '1 year' },
    image_url: 'https://images.unsplash.com/photo-1581092335871-4e1e5f5f8e6c?w=500'
  },
  
  // Instruments
  {
    name: 'Digital Dashboard Display',
    description: 'Digital instrument cluster with speedometer, tachometer, and diagnostics',
    price: 1299.99,
    stock_quantity: 8,
    category_id: 7,
    brand: 'VDO',
    part_number: 'DIGI-9000',
    specifications: { screen: '7" LCD', features: 'GPS, Diagnostics, Bluetooth' },
    image_url: 'https://images.unsplash.com/photo-1581092335871-4e1e5f5f8e6c?w=500'
  },
  {
    name: 'EGT Gauge Kit',
    description: 'Exhaust Gas Temperature gauge with probe for diesel engines',
    price: 149.99,
    stock_quantity: 25,
    category_id: 7,
    brand: 'Autometer',
    part_number: 'EGT-800',
    specifications: { range: '0-1600°F', type: 'Pyrometer', backlight: 'LED' },
    image_url: 'https://images.unsplash.com/photo-1581092335871-4e1e5f5f8e6c?w=500'
  },
  
  // Accessories
  {
    name: 'LED Light Bar - 50"',
    description: 'High-intensity LED light bar for truck front or roof mounting',
    price: 299.99,
    stock_quantity: 20,
    category_id: 8,
    brand: 'Rigid',
    part_number: 'LED-50',
    specifications: { lumens: '24,000', watts: '300', waterproof: 'IP68' },
    image_url: 'https://images.unsplash.com/photo-1581092335871-4e1e5f5f8e6c?w=500'
  },
  {
    name: 'Mud Flaps - Set of 2',
    description: 'Heavy-duty rubber mud flaps with stainless steel weights',
    price: 79.99,
    stock_quantity: 45,
    category_id: 8,
    brand: 'FlexiFlap',
    part_number: 'MF-24',
    specifications: { size: '24"x24"', material: 'Rubber', color: 'Black' },
    image_url: 'https://images.unsplash.com/photo-1581092335871-4e1e5f5f8e6c?w=500'
  },
  {
    name: 'Truck Tool Box - Aluminum',
    description: 'Weather-resistant aluminum tool box for truck bed',
    price: 399.99,
    stock_quantity: 12,
    category_id: 8,
    brand: 'WeatherGuard',
    part_number: 'TB-AL48',
    specifications: { length: '48"', material: 'Aluminum', lock: 'Keyed' },
    image_url: 'https://images.unsplash.com/photo-1581092335871-4e1e5f5f8e6c?w=500'
  },
  
  // Cooling System
  {
    name: 'Radiator - Heavy Duty',
    description: 'Aluminum heavy-duty radiator for Class 8 trucks',
    price: 799.99,
    stock_quantity: 10,
    category_id: 9,
    brand: 'Spectra',
    part_number: 'RD-990',
    specifications: { core: '4-row', material: 'Aluminum', capacity: '12 gallons' },
    image_url: 'https://images.unsplash.com/photo-1581092335871-4e1e5f5f8e6c?w=500'
  },
  {
    name: 'Coolant Temperature Sensor',
    description: 'Engine coolant temperature sensor for diesel engines',
    price: 39.99,
    stock_quantity: 50,
    category_id: 9,
    brand: 'Standard',
    part_number: 'CTS-450',
    specifications: { range: '-40°F to 300°F', thread: '3/8" NPT', resistance: '10k ohm' },
    image_url: 'https://images.unsplash.com/photo-1581092335871-4e1e5f5f8e6c?w=500'
  },
  
  // Exhaust System
  {
    name: 'Exhaust Muffler - Straight Through',
    description: 'High-flow straight-through muffler for diesel engines',
    price: 249.99,
    stock_quantity: 15,
    category_id: 10,
    brand: 'Magnaflow',
    part_number: 'MF-5000',
    specifications: { inlet: '5"', outlet: '5"', length: '36"', material: 'Stainless' },
    image_url: 'https://images.unsplash.com/photo-1581092335871-4e1e5f5f8e6c?w=500'
  },
  {
    name: 'DPF Filter Assembly',
    description: 'Diesel Particulate Filter assembly for emissions control',
    price: 1499.99,
    stock_quantity: 5,
    category_id: 10,
    brand: 'Cummins',
    part_number: 'DPF-ISX',
    specifications: { type: 'DOC+DPF', capacity: '15L', material: 'Ceramic' },
    image_url: 'https://images.unsplash.com/photo-1581092335871-4e1e5f5f8e6c?w=500'
  }
];

const seedDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to database');
    
    // Create categories
    for (const category of categories) {
      await Category.findOrCreate({
        where: { name: category.name },
        defaults: category
      });
    }
    console.log('Categories seeded successfully');
    
    // Create products
    for (const product of products) {
      await Product.findOrCreate({
        where: { part_number: product.part_number },
        defaults: product
      });
    }
    console.log('Products seeded successfully');
    
    console.log('Database seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
