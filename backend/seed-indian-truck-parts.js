const sequelize = require('./config/database');
const Product = require('./models/Product');
const Category = require('./models/Category');

// Indian Rupee prices (₹)
const INR = (price) => price;

// Indian Truck Brands and Models
const indianTrucks = {
  'Tata Motors': {
    models: ['Tata Prima', 'Tata Signa', 'Tata LPT', 'Tata Ultra', 'Tata Ace', 'Tata Xenon'],
    years: [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024]
  },
  'Ashok Leyland': {
    models: ['Ashok Leyland Captain', 'Ashok Leyland Boss', 'Ashok Leyland Partner', 'Ashok Leyland Ecomet', 'Ashok Leyland Dost'],
    years: [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024]
  },
  'Mahindra & Mahindra': {
    models: ['Mahindra Blazo', 'Mahindra Furio', 'Mahindra Bolero', 'Mahindra Loadking', 'Mahindra Imperio'],
    years: [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024]
  },
  'BharatBenz': {
    models: ['BharatBenz 1017', 'BharatBenz 1217', 'BharatBenz 1417', 'BharatBenz 1617', 'BharatBenz 3123'],
    years: [2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024]
  },
  'Eicher': {
    models: ['Eicher Pro 1060', 'Eicher Pro 2080', 'Eicher Pro 3015', 'Eicher Pro 6035', 'Eicher Skyline'],
    years: [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024]
  },
  'Force Motors': {
    models: ['Force Traveller', 'Force Cruiser', 'Force Urbania', 'Force Toofan'],
    years: [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024]
  },
  'SML Isuzu': {
    models: ['SML Isuzu Samrat', 'SML Isuzu Super', 'SML Isuzu GS Buses'],
    years: [2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024]
  },
  'MAN Trucks': {
    models: ['MAN CLA', 'MAN TGS', 'MAN TGX', 'MAN Bus'],
    years: [2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024]
  },
  'Volvo Trucks': {
    models: ['Volvo FM', 'Volvo FH', 'Volvo FMX'],
    years: [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024]
  },
  'Scania': {
    models: ['Scania R-Series', 'Scania G-Series', 'Scania P-Series'],
    years: [2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024]
  }
};

// Complete product list for Indian trucks
const indianProducts = [
  // ============= ENGINE PARTS (Category 1) =============
  // Tata Motors Engine Parts
  {
    name: 'Tata Prima Engine Assembly - Cummins ISBe',
    description: 'Complete engine assembly for Tata Prima trucks. 6-cylinder, 5.9L, 210 HP. BS6 compliant.',
    price: INR(1250000),
    stock_quantity: 3,
    category_id: 1,
    brand: 'Tata Motors',
    part_number: 'TATA-PRIMA-ENG-001',
    image_url: 'https://example.com/images/tata-prima-engine.jpg',
    specifications: { hp: '210', torque: '770 Nm', cylinders: '6', displacement: '5.9L', emission: 'BS6' },
    compatibility: { makes: ['Tata Motors'], models: ['Tata Prima'], years: [2018, 2019, 2020, 2021, 2022, 2023, 2024] }
  },
  {
    name: 'Tata Signa Engine - Cummins ISLe',
    description: 'Heavy-duty engine for Tata Signa trucks. 8.9L, 350 HP. Excellent fuel efficiency.',
    price: INR(1850000),
    stock_quantity: 2,
    category_id: 1,
    brand: 'Tata Motors',
    part_number: 'TATA-SIGNA-ENG-002',
    image_url: 'https://example.com/images/tata-signa-engine.jpg',
    specifications: { hp: '350', torque: '1450 Nm', cylinders: '6', displacement: '8.9L', emission: 'BS6' },
    compatibility: { makes: ['Tata Motors'], models: ['Tata Signa'], years: [2019, 2020, 2021, 2022, 2023, 2024] }
  },
  {
    name: 'Tata LPT Engine Assembly',
    description: 'Reliable engine for Tata LPT trucks. 4-cylinder, 3.8L, 140 HP.',
    price: INR(850000),
    stock_quantity: 5,
    category_id: 1,
    brand: 'Tata Motors',
    part_number: 'TATA-LPT-ENG-003',
    image_url: 'https://example.com/images/tata-lpt-engine.jpg',
    specifications: { hp: '140', torque: '500 Nm', cylinders: '4', displacement: '3.8L', emission: 'BS6' },
    compatibility: { makes: ['Tata Motors'], models: ['Tata LPT'], years: [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024] }
  },
  {
    name: 'Tata Ace Engine - 2-Cylinder DI',
    description: 'Fuel-efficient engine for Tata Ace mini-trucks. 2-cylinder, 0.7L, 33 HP.',
    price: INR(450000),
    stock_quantity: 8,
    category_id: 1,
    brand: 'Tata Motors',
    part_number: 'TATA-ACE-ENG-004',
    image_url: 'https://example.com/images/tata-ace-engine.jpg',
    specifications: { hp: '33', torque: '70 Nm', cylinders: '2', displacement: '0.7L', emission: 'BS6' },
    compatibility: { makes: ['Tata Motors'], models: ['Tata Ace'], years: [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024] }
  },
  
  // Ashok Leyland Engine Parts
  {
    name: 'Ashok Leyland H-Series Engine',
    description: 'Powerful engine for Ashok Leyland Captain trucks. 6-cylinder, 5.6L, 230 HP.',
    price: INR(1150000),
    stock_quantity: 4,
    category_id: 1,
    brand: 'Ashok Leyland',
    part_number: 'AL-CAPTAIN-ENG-001',
    image_url: 'https://example.com/images/ashok-leyland-engine.jpg',
    specifications: { hp: '230', torque: '900 Nm', cylinders: '6', displacement: '5.6L', emission: 'BS6' },
    compatibility: { makes: ['Ashok Leyland'], models: ['Ashok Leyland Captain'], years: [2018, 2019, 2020, 2021, 2022, 2023, 2024] }
  },
  {
    name: 'Ashok Leyland Neptune Engine',
    description: 'Advanced engine for Ashok Leyland Boss trucks. 6-cylinder, 6.8L, 300 HP.',
    price: INR(1450000),
    stock_quantity: 3,
    category_id: 1,
    brand: 'Ashok Leyland',
    part_number: 'AL-BOSS-ENG-002',
    image_url: 'https://example.com/images/ashok-leyland-neptune.jpg',
    specifications: { hp: '300', torque: '1100 Nm', cylinders: '6', displacement: '6.8L', emission: 'BS6' },
    compatibility: { makes: ['Ashok Leyland'], models: ['Ashok Leyland Boss'], years: [2019, 2020, 2021, 2022, 2023, 2024] }
  },
  
  // Mahindra Engine Parts
  {
    name: 'Mahindra mDI Engine - mPower',
    description: 'Efficient engine for Mahindra Blazo trucks. 4-cylinder, 3.5L, 140 HP.',
    price: INR(780000),
    stock_quantity: 6,
    category_id: 1,
    brand: 'Mahindra',
    part_number: 'MAH-BLAZO-ENG-001',
    image_url: 'https://example.com/images/mahindra-engine.jpg',
    specifications: { hp: '140', torque: '550 Nm', cylinders: '4', displacement: '3.5L', emission: 'BS6' },
    compatibility: { makes: ['Mahindra'], models: ['Mahindra Blazo'], years: [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024] }
  },
  {
    name: 'Mahindra mHawk Engine',
    description: 'Powerful engine for Mahindra Furio trucks. 4-cylinder, 2.5L, 120 HP.',
    price: INR(650000),
    stock_quantity: 7,
    category_id: 1,
    brand: 'Mahindra',
    part_number: 'MAH-FURIO-ENG-002',
    image_url: 'https://example.com/images/mahindra-mhawk.jpg',
    specifications: { hp: '120', torque: '450 Nm', cylinders: '4', displacement: '2.5L', emission: 'BS6' },
    compatibility: { makes: ['Mahindra'], models: ['Mahindra Furio'], years: [2018, 2019, 2020, 2021, 2022, 2023, 2024] }
  },
  
  // BharatBenz Engine Parts
  {
    name: 'BharatBenz OM 926 Engine',
    description: 'Mercedes-Benz technology engine for BharatBenz trucks. 6-cylinder, 7.2L, 250 HP.',
    price: INR(1650000),
    stock_quantity: 2,
    category_id: 1,
    brand: 'BharatBenz',
    part_number: 'BB-ENG-001',
    image_url: 'https://example.com/images/bharatbenz-engine.jpg',
    specifications: { hp: '250', torque: '950 Nm', cylinders: '6', displacement: '7.2L', emission: 'BS6' },
    compatibility: { makes: ['BharatBenz'], models: ['BharatBenz 1017', 'BharatBenz 1217'], years: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024] }
  },
  {
    name: 'BharatBenz OM 457 Engine',
    description: 'Heavy-duty engine for BharatBenz 3123. 6-cylinder, 11.97L, 360 HP.',
    price: INR(2100000),
    stock_quantity: 1,
    category_id: 1,
    brand: 'BharatBenz',
    part_number: 'BB-ENG-002',
    image_url: 'https://example.com/images/bharatbenz-om457.jpg',
    specifications: { hp: '360', torque: '1750 Nm', cylinders: '6', displacement: '11.97L', emission: 'BS6' },
    compatibility: { makes: ['BharatBenz'], models: ['BharatBenz 3123'], years: [2018, 2019, 2020, 2021, 2022, 2023, 2024] }
  },
  
  // Eicher Engine Parts
  {
    name: 'Eicher E483 Engine',
    description: 'Powerful engine for Eicher Pro 1060. 4-cylinder, 3.8L, 140 HP.',
    price: INR(750000),
    stock_quantity: 5,
    category_id: 1,
    brand: 'Eicher',
    part_number: 'EICH-ENG-001',
    image_url: 'https://example.com/images/eicher-engine.jpg',
    specifications: { hp: '140', torque: '550 Nm', cylinders: '4', displacement: '3.8L', emission: 'BS6' },
    compatibility: { makes: ['Eicher'], models: ['Eicher Pro 1060'], years: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024] }
  },
  {
    name: 'Eicher E534 Engine',
    description: 'Heavy-duty engine for Eicher Pro 6035. 6-cylinder, 5.8L, 210 HP.',
    price: INR(950000),
    stock_quantity: 3,
    category_id: 1,
    brand: 'Eicher',
    part_number: 'EICH-ENG-002',
    image_url: 'https://example.com/images/eicher-e534.jpg',
    specifications: { hp: '210', torque: '750 Nm', cylinders: '6', displacement: '5.8L', emission: 'BS6' },
    compatibility: { makes: ['Eicher'], models: ['Eicher Pro 6035'], years: [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024] }
  },
  
  // ============= TRANSMISSION (Category 2) =============
  {
    name: 'Tata Prima Gearbox - G1150',
    description: '9-speed manual transmission for Tata Prima trucks. Smooth shifting.',
    price: INR(450000),
    stock_quantity: 4,
    category_id: 2,
    brand: 'Tata Motors',
    part_number: 'TATA-PRIMA-GB-001',
    image_url: 'https://example.com/images/tata-gearbox.jpg',
    specifications: { speeds: '9', torque: '1150 Nm', type: 'Manual' },
    compatibility: { makes: ['Tata Motors'], models: ['Tata Prima'], years: [2018, 2019, 2020, 2021, 2022, 2023, 2024] }
  },
  {
    name: 'Ashok Leyland GB 550 Gearbox',
    description: '6-speed transmission for Ashok Leyland Captain trucks. Robust design.',
    price: INR(380000),
    stock_quantity: 5,
    category_id: 2,
    brand: 'Ashok Leyland',
    part_number: 'AL-GB-001',
    image_url: 'https://example.com/images/ashok-gearbox.jpg',
    specifications: { speeds: '6', torque: '550 Nm', type: 'Manual' },
    compatibility: { makes: ['Ashok Leyland'], models: ['Ashok Leyland Captain'], years: [2018, 2019, 2020, 2021, 2022, 2023, 2024] }
  },
  {
    name: 'BharatBenz G131 Gearbox',
    description: 'Mercedes-Benz technology transmission. 9-speed, 1300 Nm torque.',
    price: INR(520000),
    stock_quantity: 3,
    category_id: 2,
    brand: 'BharatBenz',
    part_number: 'BB-GB-001',
    image_url: 'https://example.com/images/bharatbenz-gearbox.jpg',
    specifications: { speeds: '9', torque: '1300 Nm', type: 'Manual' },
    compatibility: { makes: ['BharatBenz'], models: ['BharatBenz 1217', 'BharatBenz 1417'], years: [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024] }
  },
  
  // ============= BRAKE SYSTEM (Category 3) =============
  {
    name: 'Tata Prima Brake Caliper Set',
    description: 'Complete front brake caliper kit for Tata Prima trucks. Disc brake system.',
    price: INR(8500),
    stock_quantity: 20,
    category_id: 3,
    brand: 'Tata Motors',
    part_number: 'TATA-BRAKE-001',
    image_url: 'https://example.com/images/tata-brake-caliper.jpg',
    specifications: { type: 'Disc Brake', pistons: '4', material: 'Cast Iron' },
    compatibility: { makes: ['Tata Motors'], models: ['Tata Prima', 'Tata Signa'], years: [2018, 2019, 2020, 2021, 2022, 2023, 2024] }
  },
  {
    name: 'Ashok Leyland Air Brake Chamber',
    description: 'Heavy-duty air brake chamber for Ashok Leyland trucks. Type 30.',
    price: INR(3500),
    stock_quantity: 30,
    category_id: 3,
    brand: 'Ashok Leyland',
    part_number: 'AL-BRAKE-001',
    image_url: 'https://example.com/images/ashok-brake-chamber.jpg',
    specifications: { type: 'Type 30', stroke: '3 inch', material: 'Aluminum' },
    compatibility: { makes: ['Ashok Leyland'], models: ['Ashok Leyland Captain', 'Ashok Leyland Boss'], years: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024] }
  },
  {
    name: 'Mahindra Brake Shoes Set',
    description: 'Complete brake shoe set for Mahindra Blazo trucks. Long-lasting friction material.',
    price: INR(4500),
    stock_quantity: 25,
    category_id: 3,
    brand: 'Mahindra',
    part_number: 'MAH-BRAKE-001',
    image_url: 'https://example.com/images/mahindra-brake-shoes.jpg',
    specifications: { size: '420mm', material: 'Asbestos-free', type: 'Drum Brake' },
    compatibility: { makes: ['Mahindra'], models: ['Mahindra Blazo', 'Mahindra Furio'], years: [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024] }
  },
  
  // ============= SUSPENSION (Category 4) =============
  {
    name: 'Tata Prima Parabolic Leaf Spring',
    description: 'Heavy-duty parabolic leaf spring for Tata Prima. Better ride quality.',
    price: INR(12000),
    stock_quantity: 15,
    category_id: 4,
    brand: 'Tata Motors',
    part_number: 'TATA-SUS-001',
    image_url: 'https://example.com/images/tata-leaf-spring.jpg',
    specifications: { type: 'Parabolic', capacity: '8000 kg', leaves: '3' },
    compatibility: { makes: ['Tata Motors'], models: ['Tata Prima', 'Tata Signa'], years: [2018, 2019, 2020, 2021, 2022, 2023, 2024] }
  },
  {
    name: 'Ashok Leyland Air Suspension Bag',
    description: 'Air suspension bag for Ashok Leyland buses and trucks. Comfortable ride.',
    price: INR(8500),
    stock_quantity: 12,
    category_id: 4,
    brand: 'Ashok Leyland',
    part_number: 'AL-SUS-001',
    image_url: 'https://example.com/images/ashok-air-suspension.jpg',
    specifications: { type: 'Air Spring', capacity: '5000 kg', pressure: '100 PSI' },
    compatibility: { makes: ['Ashok Leyland'], models: ['Ashok Leyland Captain'], years: [2018, 2019, 2020, 2021, 2022, 2023, 2024] }
  },
  {
    name: 'BharatBenz Shock Absorber',
    description: 'Heavy-duty shock absorber for BharatBenz trucks. Improved stability.',
    price: INR(5500),
    stock_quantity: 18,
    category_id: 4,
    brand: 'BharatBenz',
    part_number: 'BB-SUS-001',
    image_url: 'https://example.com/images/bharatbenz-shock.jpg',
    specifications: { type: 'Twin-tube', damping: 'Heavy Duty', travel: '250mm' },
    compatibility: { makes: ['BharatBenz'], models: ['BharatBenz 1017', 'BharatBenz 1217'], years: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024] }
  },
  
  // ============= ELECTRICAL (Category 5) =============
  {
    name: 'Tata Prima Alternator - 120A',
    description: 'High-output alternator for Tata Prima trucks. 120A output.',
    price: INR(12000),
    stock_quantity: 10,
    category_id: 5,
    brand: 'Tata Motors',
    part_number: 'TATA-ELEC-001',
    image_url: 'https://example.com/images/tata-alternator.jpg',
    specifications: { amps: '120', voltage: '24V', type: 'Brushless' },
    compatibility: { makes: ['Tata Motors'], models: ['Tata Prima', 'Tata Signa'], years: [2018, 2019, 2020, 2021, 2022, 2023, 2024] }
  },
  {
    name: 'Ashok Leyland Starter Motor - 7.5kW',
    description: 'High torque starter motor for Ashok Leyland engines. 7.5kW power.',
    price: INR(15000),
    stock_quantity: 8,
    category_id: 5,
    brand: 'Ashok Leyland',
    part_number: 'AL-ELEC-001',
    image_url: 'https://example.com/images/ashok-starter.jpg',
    specifications: { power: '7.5 kW', voltage: '24V', teeth: '11' },
    compatibility: { makes: ['Ashok Leyland'], models: ['Ashok Leyland Captain', 'Ashok Leyland Boss'], years: [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024] }
  },
  {
    name: 'Mahindra LED Headlight Kit',
    description: 'High-brightness LED headlight kit for Mahindra trucks. DOT approved.',
    price: INR(8500),
    stock_quantity: 15,
    category_id: 5,
    brand: 'Mahindra',
    part_number: 'MAH-ELEC-001',
    image_url: 'https://example.com/images/mahindra-led.jpg',
    specifications: { lumens: '8000', watts: '60W', color: '6000K' },
    compatibility: { makes: ['Mahindra'], models: ['Mahindra Blazo', 'Mahindra Furio'], years: [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024] }
  },
  
  // ============= CLUTCH (Category 6) =============
  {
    name: 'Tata Prima Clutch Kit',
    description: 'Complete clutch kit for Tata Prima. 430mm organic clutch plate.',
    price: INR(18000),
    stock_quantity: 12,
    category_id: 6,
    brand: 'Tata Motors',
    part_number: 'TATA-CLUTCH-001',
    image_url: 'https://example.com/images/tata-clutch.jpg',
    specifications: { size: '430mm', type: 'Organic', torque: '1500 Nm' },
    compatibility: { makes: ['Tata Motors'], models: ['Tata Prima', 'Tata Signa'], years: [2018, 2019, 2020, 2021, 2022, 2023, 2024] }
  },
  {
    name: 'Ashok Leyland Clutch Plate',
    description: 'Heavy-duty clutch plate for Ashok Leyland trucks. Ceramic friction material.',
    price: INR(12500),
    stock_quantity: 10,
    category_id: 6,
    brand: 'Ashok Leyland',
    part_number: 'AL-CLUTCH-001',
    image_url: 'https://example.com/images/ashok-clutch.jpg',
    specifications: { size: '420mm', type: 'Ceramic', torque: '1200 Nm' },
    compatibility: { makes: ['Ashok Leyland'], models: ['Ashok Leyland Captain', 'Ashok Leyland Boss'], years: [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024] }
  },
  {
    name: 'BharatBenz Clutch Kit',
    description: 'Mercedes-Benz technology clutch kit. 430mm, heavy-duty.',
    price: INR(22000),
    stock_quantity: 8,
    category_id: 6,
    brand: 'BharatBenz',
    part_number: 'BB-CLUTCH-001',
    image_url: 'https://example.com/images/bharatbenz-clutch.jpg',
    specifications: { size: '430mm', type: 'Organic', torque: '1800 Nm' },
    compatibility: { makes: ['BharatBenz'], models: ['BharatBenz 1217', 'BharatBenz 1417'], years: [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024] }
  },
  
  // ============= INSTRUMENTS (Category 7) =============
  {
    name: 'Tata Prima Digital Instrument Cluster',
    description: 'Advanced digital dashboard display for Tata Prima. Real-time diagnostics.',
    price: INR(35000),
    stock_quantity: 5,
    category_id: 7,
    brand: 'Tata Motors',
    part_number: 'TATA-INST-001',
    image_url: 'https://example.com/images/tata-dashboard.jpg',
    specifications: { screen: '7 inch LCD', features: 'GPS, Diagnostics, TPMS', connectivity: 'Bluetooth' },
    compatibility: { makes: ['Tata Motors'], models: ['Tata Prima', 'Tata Signa'], years: [2020, 2021, 2022, 2023, 2024] }
  },
  {
    name: 'Ashok Leyland Speedometer',
    description: 'Digital speedometer with odometer for Ashok Leyland trucks.',
    price: INR(8500),
    stock_quantity: 8,
    category_id: 7,
    brand: 'Ashok Leyland',
    part_number: 'AL-INST-001',
    image_url: 'https://example.com/images/ashok-speedometer.jpg',
    specifications: { type: 'Digital', max_speed: '120 km/h', features: 'Trip meter, Fuel gauge' },
    compatibility: { makes: ['Ashok Leyland'], models: ['Ashok Leyland Captain', 'Ashok Leyland Boss'], years: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024] }
  },
  {
    name: 'Mahindra EGT Gauge',
    description: 'Exhaust Gas Temperature gauge for Mahindra trucks. Monitor engine health.',
    price: INR(4500),
    stock_quantity: 12,
    category_id: 7,
    brand: 'Mahindra',
    part_number: 'MAH-INST-001',
    image_url: 'https://example.com/images/mahindra-egt.jpg',
    specifications: { range: '0-1200°C', type: 'Pyrometer', accuracy: '±2%' },
    compatibility: { makes: ['Mahindra'], models: ['Mahindra Blazo', 'Mahindra Furio'], years: [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024] }
  },
  
  // ============= ACCESSORIES (Category 8) =============
  {
    name: 'LED Light Bar - 52 inches',
    description: 'High-intensity LED light bar for truck roof mounting. Perfect for night driving.',
    price: INR(12000),
    stock_quantity: 15,
    category_id: 8,
    brand: 'LED Pro',
    part_number: 'ACC-LED-001',
    image_url: 'https://example.com/images/led-light-bar.jpg',
    specifications: { lumens: '26000', watts: '360W', waterproof: 'IP68', material: 'Aluminum' },
    compatibility: { makes: ['All'], models: ['All'], years: [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024] }
  },
  {
    name: 'Heavy Duty Mud Flaps',
    description: 'Set of 2 heavy-duty rubber mud flaps with stainless steel weights.',
    price: INR(2500),
    stock_quantity: 30,
    category_id: 8,
    brand: 'FlexiFlap',
    part_number: 'ACC-MUD-001',
    image_url: 'https://example.com/images/mud-flaps.jpg',
    specifications: { size: '24x30 inches', material: 'Rubber', weight: '5 kg each' },
    compatibility: { makes: ['All'], models: ['All'], years: [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024] }
  },
  {
    name: 'Truck Tool Box - Aluminum',
    description: 'Weather-resistant aluminum tool box for truck bed. Lockable storage.',
    price: INR(15000),
    stock_quantity: 10,
    category_id: 8,
    brand: 'WeatherGuard',
    part_number: 'ACC-TOOL-001',
    image_url: 'https://example.com/images/tool-box.jpg',
    specifications: { length: '48 inches', material: 'Aluminum', lock: 'Keyed', capacity: '200 liters' },
    compatibility: { makes: ['All'], models: ['All'], years: [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024] }
  },
  {
    name: 'Seat Cover Set - Premium Leather',
    description: 'Custom-fit premium leather seat covers for truck seats.',
    price: INR(8500),
    stock_quantity: 20,
    category_id: 8,
    brand: 'Coverking',
    part_number: 'ACC-SEAT-001',
    image_url: 'https://example.com/images/seat-covers.jpg',
    specifications: { material: 'Premium Leather', color: 'Black', features: 'Breathable, Water-resistant' },
    compatibility: { makes: ['All'], models: ['All'], years: [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024] }
  },
  {
    name: 'Reverse Camera Kit',
    description: 'Complete reverse camera system with 7-inch monitor. Night vision.',
    price: INR(6500),
    stock_quantity: 18,
    category_id: 8,
    brand: 'VisionTech',
    part_number: 'ACC-CAM-001',
    image_url: 'https://example.com/images/reverse-camera.jpg',
    specifications: { camera: 'HD 1080p', screen: '7 inch', features: 'Night vision, Waterproof', distance_lines: 'Yes' },
    compatibility: { makes: ['All'], models: ['All'], years: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024] }
  }
];

const seedIndianProducts = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database');
    
    // Check existing products count
    const existingCount = await Product.count();
    console.log(`📊 Existing products: ${existingCount}`);
    
    // Clear existing products if needed (optional)
    // await Product.destroy({ where: {}, truncate: true, cascade: true });
    // console.log('✅ Cleared existing products');
    
    let added = 0;
    let skipped = 0;
    
    for (const product of indianProducts) {
      try {
        // Check if product already exists by part number
        const existing = await Product.findOne({ 
          where: { part_number: product.part_number } 
        });
        
        if (!existing) {
          // Add seller_id (default to admin user 1)
          const productWithSeller = {
            ...product,
            seller_id: 1,
            approval_status: 'approved',
            is_approved: true
          };
          await Product.create(productWithSeller);
          console.log(`✓ Added: ${product.name} - ₹${product.price.toLocaleString('en-IN')}`);
          added++;
        } else {
          console.log(`○ Skipped: ${product.name} (already exists)`);
          skipped++;
        }
      } catch (error) {
        console.error(`✗ Failed to add ${product.name}:`, error.message);
      }
    }
    
    console.log(`\n✅ Seeding completed!`);
    console.log(`📊 Added: ${added} new products`);
    console.log(`📊 Skipped: ${skipped} existing products`);
    console.log(`📊 Total products: ${await Product.count()}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

seedIndianProducts();
