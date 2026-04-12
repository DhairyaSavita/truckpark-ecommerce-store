/**
 * seed-indian-trucks-complete.js
 * 
 * Comprehensive seed for ALL major Indian truck brand spare parts
 * covering model years 2010 – 2025.
 * 
 * Brands covered:
 *   Tata Motors, Ashok Leyland, Mahindra, BharatBenz, Eicher,
 *   Force Motors, SML Isuzu, MAN Trucks, Volvo Trucks, Scania
 * 
 * Categories (12):
 *   Engine Parts, Brake System, Transmission & Clutch, Suspension & Steering,
 *   Electrical & Lighting, Body & Cabin, Cooling System, Fuel System,
 *   Exhaust System, Wheels & Tyres, Filters & Lubrication, Safety & Accessories
 * 
 * Run: node seed-indian-trucks-complete.js
 */

require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

// ─── DB Connection ───────────────────────────────────────────────────────────
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false,
  }
);

// ─── Models (inline, minimal) ────────────────────────────────────────────────
const Category = sequelize.define('Category', {
  id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name:        { type: DataTypes.STRING, allowNull: false, unique: true },
  description: { type: DataTypes.TEXT },
  image_url:   { type: DataTypes.STRING },
}, { tableName: 'categories', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

const Product = sequelize.define('Product', {
  id:             { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name:           { type: DataTypes.STRING, allowNull: false },
  description:    { type: DataTypes.TEXT, allowNull: false },
  price:          { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  stock_quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  category_id:    { type: DataTypes.INTEGER, allowNull: false },
  seller_id:      { type: DataTypes.INTEGER, allowNull: true, defaultValue: 1 },
  brand:          { type: DataTypes.STRING },
  part_number:    { type: DataTypes.STRING },
  image_url:      { type: DataTypes.STRING },
  specifications: { type: DataTypes.JSONB, defaultValue: {} },
  approval_status:{ type: DataTypes.STRING, defaultValue: 'approved' },
  is_approved:    { type: DataTypes.BOOLEAN, defaultValue: true },
  rejection_reason:{ type: DataTypes.TEXT },
}, { tableName: 'products', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

// ─── Image banks per part type (Unsplash curated, all verified) ──────────────
const IMG = {
  engine:       'https://images.unsplash.com/photo-1563694983011-6f4d90358083?w=600&auto=format&fit=crop',
  engine2:      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop',
  engine3:      'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600&auto=format&fit=crop',
  piston:       'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&auto=format&fit=crop',
  gasket:       'https://images.unsplash.com/photo-1606577924006-27d39b132ae2?w=600&auto=format&fit=crop',
  turbo:        'https://images.unsplash.com/photo-1565793979698-7c72a64ca4d8?w=600&auto=format&fit=crop',
  brake:        'https://images.unsplash.com/photo-1600186500707-bdb71becd3e0?w=600&auto=format&fit=crop',
  brake2:       'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop',
  brakePad:     'https://images.unsplash.com/photo-1491897554428-130a60dd4757?w=600&auto=format&fit=crop',
  gearbox:      'https://images.unsplash.com/photo-1617469767611-15c6b7960c2b?w=600&auto=format&fit=crop',
  clutch:       'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600&auto=format&fit=crop',
  suspension:   'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop',
  shockAbsorber:'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?w=600&auto=format&fit=crop',
  steering:     'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&auto=format&fit=crop',
  alternator:   'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600&auto=format&fit=crop',
  battery:      'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&auto=format&fit=crop',
  electrical:   'https://images.unsplash.com/photo-1647872556498-4db53a90e2d9?w=600&auto=format&fit=crop',
  headlight:    'https://images.unsplash.com/photo-1543465077-db45d34b88a5?w=600&auto=format&fit=crop',
  body:         'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&auto=format&fit=crop',
  cabin:        'https://images.unsplash.com/photo-1532987748424-e41dc13e6b9b?w=600&auto=format&fit=crop',
  mirror:       'https://images.unsplash.com/photo-1514316454349-750a7fd3da3a?w=600&auto=format&fit=crop',
  radiator:     'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop',
  waterPump:    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop',
  fuelPump:     'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&auto=format&fit=crop',
  fuelTank:     'https://images.unsplash.com/photo-1531491386087-ff55a24dd0cf?w=600&auto=format&fit=crop',
  injector:     'https://images.unsplash.com/photo-1565793979698-7c72a64ca4d8?w=600&auto=format&fit=crop',
  exhaust:      'https://images.unsplash.com/photo-1567443024551-f3e3cc2be870?w=600&auto=format&fit=crop',
  muffler:      'https://images.unsplash.com/photo-1519167737758-1d2d3a4bf6e5?w=600&auto=format&fit=crop',
  tyre:         'https://images.unsplash.com/photo-1567037026759-de13898c29a5?w=600&auto=format&fit=crop',
  wheel:        'https://images.unsplash.com/photo-1566008885218-90abf9200ddb?w=600&auto=format&fit=crop',
  oilFilter:    'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=600&auto=format&fit=crop',
  airFilter:    'https://images.unsplash.com/photo-1608452964553-9b4d97b2752f?w=600&auto=format&fit=crop',
  seatBelt:     'https://images.unsplash.com/photo-1449427283979-e17e0822e272?w=600&auto=format&fit=crop',
  dashCam:      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop',
};

// ─── Categories ──────────────────────────────────────────────────────────────
const CATEGORIES = [
  { name: 'Engine Parts',              description: 'Pistons, crankshafts, gaskets, camshafts, cylinder heads, fuel injectors, turbochargers and all engine internals', image_url: IMG.engine },
  { name: 'Brake System',             description: 'Brake drums, brake pads, discs, calipers, brake cylinders, ABS modules and brake hardware', image_url: IMG.brake },
  { name: 'Transmission & Clutch',     description: 'Gearboxes, clutch kits, clutch plates, pressure plates, propeller shafts and differentials', image_url: IMG.gearbox },
  { name: 'Suspension & Steering',     description: 'Leaf springs, shock absorbers, ball joints, tie rod ends, steering boxes and power steering components', image_url: IMG.suspension },
  { name: 'Electrical & Lighting',     description: 'Alternators, starter motors, batteries, wiring harness, sensors, ECUs, headlights and indicators', image_url: IMG.electrical },
  { name: 'Body & Cabin Parts',        description: 'Bumpers, doors, cabin panels, windshields, mirrors, seats and interior components', image_url: IMG.body },
  { name: 'Cooling System',            description: 'Radiators, water pumps, thermostats, coolant hoses, fan belts and intercoolers', image_url: IMG.radiator },
  { name: 'Fuel System',              description: 'Diesel fuel pumps, injectors, fuel tanks, fuel filters and carburettors', image_url: IMG.fuelPump },
  { name: 'Exhaust System',           description: 'Exhaust pipes, mufflers, catalytic converters, DPF filters and exhaust manifolds', image_url: IMG.exhaust },
  { name: 'Wheels & Tyres',           description: 'Truck tyres, wheel rims, hub caps, wheel bearings and lug nuts', image_url: IMG.tyre },
  { name: 'Filters & Lubrication',    description: 'Engine oil filters, air filters, fuel filters, cabin filters and lubricating oils', image_url: IMG.oilFilter },
  { name: 'Safety & Accessories',     description: 'Seat belts, dash cameras, fire extinguishers, reflectors and GPS tracking devices', image_url: IMG.seatBelt },
];

// ─── Product data builder ─────────────────────────────────────────────────────
// Helper: pick random int in range
const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * Build the full product list.
 * categoryMap: { 'Engine Parts' => id, ... }
 */
const buildProducts = (categoryMap) => {
  const C = categoryMap; // shorthand

  return [
    // ══════════════════════════════════════════════
    //  TATA MOTORS  (Ace, 407, 709, 1109, 1616,
    //                Prima, Signa, Ultra, T.7, LPT)
    // ══════════════════════════════════════════════

    // Engine Parts — Tata
    { name: 'Tata 407 Turbo Engine Piston Set (2010–2024)', brand: 'Tata Motors', part_number: 'TAT-407-ENG-PST-001', category_id: C['Engine Parts'], price: 4800, stock: 45, image: IMG.piston, desc: 'Complete set of 4 pistons with rings for Tata 407 EX2 diesel engine. Compatible models 2010–2024. OEM grade with 0.5mm oversized option.', specs: { engine: '697cc EX2', material: 'Hypereutectic Aluminium', warranty: '12 months' } },
    { name: 'Tata Prima 5.9L Cummins Cylinder Head Gasket', brand: 'Tata Motors', part_number: 'TAT-PRM-ENG-GSK-002', category_id: C['Engine Parts'], price: 3200, stock: 30, image: IMG.gasket, desc: 'Cylinder head gasket for Tata Prima series with Cummins ISBe 5.9L engine. Multi-layer steel (MLS) construction for high compression.', specs: { engine: 'Cummins ISBe 5.9', layers: 4, thickness: '1.2mm' } },
    { name: 'Tata 1616 Engine Crankshaft Assembly', brand: 'Tata Motors', part_number: 'TAT-1616-ENG-CRK-003', category_id: C['Engine Parts'], price: 28500, stock: 8, image: IMG.engine, desc: 'Original replacement crankshaft for Tata 1616 LPS/LPT series trucks. Forged steel, precision ground journals. 2012–2022 compatible.', specs: { engine: '5.7L TCIC', material: 'Forged steel', journals: 7 } },
    { name: 'Tata Signa 4923.S Turbocharger Assembly', brand: 'Tata Motors', part_number: 'TAT-SGN-ENG-TRB-004', category_id: C['Engine Parts'], price: 18900, stock: 12, image: IMG.turbo, desc: 'VGT turbocharger for Tata Signa 4923.S heavy-duty truck with Cummins ISLe 9L engine. BS6 compatible. Fits 2016–2025.', specs: { type: 'Variable Geometry', maxBoost: '2.1 bar', rpm: '120,000' } },
    { name: 'Tata Ace Gold CNG Fuel Injector Set', brand: 'Tata Motors', part_number: 'TAT-ACE-ENG-INJ-005', category_id: C['Engine Parts'], price: 2400, stock: 60, image: IMG.injector, desc: 'CNG fuel injector set (4 pcs) for Tata Ace Gold CNG variant. Precise fuel metering for BS6 emission norms. 2019–2025 models.', specs: { type: 'CNG Solenoid', voltage: '12V', flowRate: '150 cc/min' } },
    { name: 'Tata Ultra 1012 Engine Camshaft', brand: 'Tata Motors', part_number: 'TAT-ULT-ENG-CAM-006', category_id: C['Engine Parts'], price: 12600, stock: 15, image: IMG.engine2, desc: 'OEM replacement camshaft for Tata Ultra 1012/1518 light truck. Cast iron with hardened lobes. Fits 2014–2025 models.', specs: { material: 'Cast Iron', lobes: 8, hardness: 'HRC 58-62' } },
    { name: 'Tata LPT 2518 Engine Oil Sump with Gasket', brand: 'Tata Motors', part_number: 'TAT-LPT-ENG-SMP-007', category_id: C['Engine Parts'], price: 5600, stock: 20, image: IMG.engine3, desc: 'Engine oil sump / pan with gasket for Tata LPT 2518 trucks with 6-cylinder diesel engine. Pressed steel construction.', specs: { capacity: '14 litres', material: 'Steel', finish: 'Powder coated' } },
    { name: 'Tata 709 Water-Cooled Diesel Engine Valve Set', brand: 'Tata Motors', part_number: 'TAT-709-ENG-VLV-008', category_id: C['Engine Parts'], price: 1800, stock: 50, image: IMG.engine, desc: 'Intake and exhaust valve set (8 valves) for Tata 709 truck diesel engine. Suitable for 2010–2022 models. Nitrided steel.', specs: { material: 'Nitrided Steel', diameter: '38mm intake / 32mm exhaust', finish: 'Hard chrome' } },
    { name: 'Tata Signa 1923.K Intercooler Assembly', brand: 'Tata Motors', part_number: 'TAT-SGN-ENG-ICL-009', category_id: C['Engine Parts'], price: 9800, stock: 10, image: IMG.engine2, desc: 'Air-to-air intercooler for Tata Signa 1923.K medium-duty truck. Aluminium bar-and-plate construction for maximum cooling efficiency. BS4/BS6 compatible.', specs: { type: 'Air-to-Air', coreDimensions: '600×300×50mm', efficiency: '78%' } },
    { name: 'Tata Prima LX 4928.S Piston Ring Set', brand: 'Tata Motors', part_number: 'TAT-PRM-ENG-RNG-010', category_id: C['Engine Parts'], price: 3600, stock: 35, image: IMG.piston, desc: 'Complete piston ring set (6 cylinders) for Tata Prima LX 4928.S heavy-duty truck with Cummins ISLe engine. Chrome-plated top ring.', specs: { cylinders: 6, topRing: 'Chrome plated', oilRing: 'Nitrided' } },

    // Brake System — Tata
    { name: 'Tata 407 Front Brake Drum Set', brand: 'Tata Motors', part_number: 'TAT-407-BRK-DRM-011', category_id: C['Brake System'], price: 3800, stock: 40, image: IMG.brake, desc: 'Cast iron front brake drum for Tata 407 EX2. High carbon content for durability and heat resistance. Fits 2010–2024 models.', specs: { material: 'Grey Cast Iron', diameter: '295mm', width: '90mm' } },
    { name: 'Tata 1616 Rear Brake Shoe Assembly', brand: 'Tata Motors', part_number: 'TAT-1616-BRK-SHO-012', category_id: C['Brake System'], price: 2600, stock: 30, image: IMG.brakePad, desc: 'Rear brake shoe set (4 shoes) with lining for Tata 1616 LPS/LPT. Asbestos-free friction material. 2012–2022.', specs: { material: 'Non-asbestos', liningThickness: '18mm', friction: 'F coefficient' } },
    { name: 'Tata Prima Air Brake Compressor', brand: 'Tata Motors', part_number: 'TAT-PRM-BRK-CMP-013', category_id: C['Brake System'], price: 14500, stock: 8, image: IMG.brake2, desc: '2-cylinder air brake compressor for Tata Prima heavy-duty trucks. 400 cc displacement, direct drive. For 2013–2025 models.', specs: { type: '2-Cylinder', displacement: '400cc', pressure: '12.5 bar max' } },
    { name: 'Tata 709 Brake Master Cylinder', brand: 'Tata Motors', part_number: 'TAT-709-BRK-MCY-014', category_id: C['Brake System'], price: 2200, stock: 25, image: IMG.brake, desc: 'Hydraulic brake master cylinder for Tata 709/407 series light commercial trucks. Single circuit. Bosch quality.', specs: { bore: '25.4mm', stroke: '40mm', portType: 'Banjo' } },
    { name: 'Tata Signa ABS Sensor Set (4 pcs)', brand: 'Tata Motors', part_number: 'TAT-SGN-BRK-ABS-015', category_id: C['Brake System'], price: 5600, stock: 18, image: IMG.brake2, desc: 'ABS wheel speed sensor set for Tata Signa 4923/2818/1923 series. Active hall-effect sensors. Fits 2016–2025 BS6 trucks.', specs: { type: 'Hall Effect', voltage: '48V', frequency: '0–2500 Hz' } },

    // Transmission — Tata
    { name: 'Tata 1616 6-Speed Gearbox Assembly', brand: 'Tata Motors', part_number: 'TAT-1616-TRN-GBX-016', category_id: C['Transmission & Clutch'], price: 65000, stock: 3, image: IMG.gearbox, desc: 'Complete 6-speed manual gearbox for Tata 1616 LPS trucks. Synchromesh on all gears. Rebuilt with OEM components.', specs: { gears: '6F+1R', type: 'Synchromesh', maxTorque: '600 Nm' } },
    { name: 'Tata 407 Clutch Kit (Plate + Disc + Bearing)', brand: 'Tata Motors', part_number: 'TAT-407-TRN-CLT-017', category_id: C['Transmission & Clutch'], price: 4800, stock: 35, image: IMG.clutch, desc: 'Complete clutch kit for Tata 407 EX2: pressure plate, clutch disc and release bearing. OEM standard. 2010–2024.', specs: { diameter: '280mm', springs: 'Diaphragm', releaseType: 'Pull-type' } },
    { name: 'Tata Prima 9-Speed Gearbox Synchromesh Ring Set', brand: 'Tata Motors', part_number: 'TAT-PRM-TRN-SYN-018', category_id: C['Transmission & Clutch'], price: 8900, stock: 15, image: IMG.gearbox, desc: 'Synchromesh ring set for Tata Prima ZF 9-speed gearbox. Brass alloy. For 2013–2025 Prima LX/LPK models.', specs: { material: 'Brass Alloy', teeth: 32, compatible: 'ZF AS-Tronic 9S109' } },
    { name: 'Tata Ultra Propeller Shaft Universal Joint', brand: 'Tata Motors', part_number: 'TAT-ULT-TRN-UJT-019', category_id: C['Transmission & Clutch'], price: 2400, stock: 40, image: IMG.gearbox, desc: 'Heavy-duty universal joint for Tata Ultra 1012/1518 propeller shaft. Grease-sealed for extended life. 2014–2025.', specs: { spiderDiameter: '47mm', capDiameter: '50.8mm', sealed: true } },

    // Suspension — Tata
    { name: 'Tata 407 Front Leaf Spring Assembly', brand: 'Tata Motors', part_number: 'TAT-407-SUS-LSP-020', category_id: C['Suspension & Steering'], price: 5600, stock: 20, image: IMG.suspension, desc: 'Front leaf spring pack for Tata 407 EX2. 7-leaf parabolic design. High tensile steel. Load capacity 1000 kg per axle.', specs: { leaves: 7, type: 'Parabolic', loadCapacity: '1000 kg/axle', material: '65Mn Steel' } },
    { name: 'Tata 1616 Rear Air Suspension Bellows', brand: 'Tata Motors', part_number: 'TAT-1616-SUS-ABL-021', category_id: C['Suspension & Steering'], price: 7800, stock: 15, image: IMG.shockAbsorber, desc: 'Rear air suspension bellows (air bags) for Tata 1616 LPS flat-bed trucks with optional air suspension. Contitech quality.', specs: { type: 'Double Convoluted', maxPressure: '10 bar', height: '320mm' } },
    { name: 'Tata Signa Steering Box Assembly (Power)', brand: 'Tata Motors', part_number: 'TAT-SGN-SUS-STR-022', category_id: C['Suspension & Steering'], price: 22000, stock: 6, image: IMG.steering, desc: 'Hydraulic power steering gear box for Tata Signa 4923/2818 series. ZF recirculating ball type. 2016–2025 models.', specs: { type: 'Recirculating Ball', ratio: '24:1', maxPressure: '160 bar' } },
    { name: 'Tata 407 Shock Absorber Set (Front Pair)', brand: 'Tata Motors', part_number: 'TAT-407-SUS-SHK-023', category_id: C['Suspension & Steering'], price: 3200, stock: 30, image: IMG.shockAbsorber, desc: 'Pair of front hydraulic shock absorbers for Tata 407 EX2. Twin-tube design. Gabriel technology. 2010–2024.', specs: { type: 'Twin-tube Hydraulic', stroke: '160mm', gasType: 'Nitrogen charged' } },

    // Electrical — Tata
    { name: 'Tata 407 Alternator 70A', brand: 'Tata Motors', part_number: 'TAT-407-ELC-ALT-024', category_id: C['Electrical & Lighting'], price: 5800, stock: 20, image: IMG.alternator, desc: '70-amp alternator for Tata 407 EX2 diesel trucks. Direct OEM replacement. Valeo-type. 2010–2024 models.', specs: { output: '70A', voltage: '14V', regulatorType: 'Internal' } },
    { name: 'Tata Prima 24V 150Ah Truck Battery', brand: 'Tata Motors', part_number: 'TAT-PRM-ELC-BAT-025', category_id: C['Electrical & Lighting'], price: 12500, stock: 15, image: IMG.battery, desc: '24V 150Ah maintenance-free truck battery for Tata Prima heavy-duty trucks. AGM technology. 2013–2025.', specs: { voltage: '24V', capacity: '150Ah', type: 'AGM', CCA: '900A' } },
    { name: 'Tata Signa LED Headlight Assembly (Pair)', brand: 'Tata Motors', part_number: 'TAT-SGN-ELC-HDL-026', category_id: C['Electrical & Lighting'], price: 8400, stock: 12, image: IMG.headlight, desc: 'Full LED headlight assembly pair for Tata Signa BS6 trucks. High/Low beam + DRL. Plug-and-play fitment. 2019–2025.', specs: { type: 'Full LED', beam: 'High + Low', lumens: '6000lm', IP: 'IP67' } },
    { name: 'Tata 709 Starter Motor 24V', brand: 'Tata Motors', part_number: 'TAT-709-ELC-STR-027', category_id: C['Electrical & Lighting'], price: 6200, stock: 18, image: IMG.alternator, desc: 'Heavy-duty starter motor for Tata 709 diesel engine. 24V, 4.5kW. Direct OEM replacement. 2010–2022 models.', specs: { voltage: '24V', power: '4.5kW', pinion: '9-tooth', weight: '8.2kg' } },

    // Body — Tata
    { name: 'Tata 407 Front Bumper Assembly (Steel)', brand: 'Tata Motors', part_number: 'TAT-407-BDY-BMP-028', category_id: C['Body & Cabin Parts'], price: 4200, stock: 20, image: IMG.body, desc: 'Steel front bumper assembly for Tata 407 EX2. Powder-coated finish. Includes mounting hardware. 2015–2024 models.', specs: { material: 'MS Steel', finish: 'Black powder coat', thickness: '3mm' } },
    { name: 'Tata Prima LX Cabin Door Assembly (Left)', brand: 'Tata Motors', part_number: 'TAT-PRM-BDY-DOR-029', category_id: C['Body & Cabin Parts'], price: 18500, stock: 5, image: IMG.cabin, desc: 'Left-hand driver door assembly for Tata Prima LX long-haul trucks. Includes door glass, window regulator and handle. 2013–2025.', specs: { side: 'Left/Driver', glass: 'Tinted', regulator: 'Electric' } },
    { name: 'Tata 709 External Rear-View Mirror (Pair)', brand: 'Tata Motors', part_number: 'TAT-709-BDY-MRR-030', category_id: C['Body & Cabin Parts'], price: 2800, stock: 25, image: IMG.mirror, desc: 'Pair of wide-angle external rear-view mirrors for Tata 709/1109 trucks. Adjustable, vibration-resistant. 2010–2022.', specs: { type: 'Flat + Convex combo', adjustment: 'Manual', housing: 'ABS plastic' } },

    // Cooling — Tata
    { name: 'Tata 1616 Radiator Assembly (Aluminium)', brand: 'Tata Motors', part_number: 'TAT-1616-COL-RAD-031', category_id: C['Cooling System'], price: 14500, stock: 10, image: IMG.radiator, desc: 'Full aluminium core radiator for Tata 1616 LPS/LPT trucks. 4-row core, plastic tanks. OEM dimensions. 2012–2022.', specs: { material: 'Aluminium Core', rows: 4, capacity: '18 litres' } },
    { name: 'Tata 407 Water Pump Assembly', brand: 'Tata Motors', part_number: 'TAT-407-COL-WTP-032', category_id: C['Cooling System'], price: 2600, stock: 35, image: IMG.waterPump, desc: 'Engine water pump for Tata 407 EX2. Cast iron body, brass impeller. Includes gasket. 2010–2024 compatible.', specs: { material: 'Cast Iron', impeller: 'Brass', bearing: 'Double sealed' } },

    // Fuel — Tata
    { name: 'Tata Prima Bosch Common Rail Injector', brand: 'Tata Motors', part_number: 'TAT-PRM-FUL-INJ-033', category_id: C['Fuel System'], price: 16800, stock: 10, image: IMG.injector, desc: 'Bosch common rail diesel injector for Tata Prima with Cummins ISLe engine. BS6 compliant. 2016–2025. Each injector, sold single.', specs: { type: 'Common Rail Solenoid', pressure: '1600 bar', compatibility: 'Cummins ISLe' } },
    { name: 'Tata 407 Diesel Fuel Filter', brand: 'Tata Motors', part_number: 'TAT-407-FUL-FLT-034', category_id: C['Filters & Lubrication'], price: 480, stock: 120, image: IMG.oilFilter, desc: 'Primary diesel fuel filter for Tata 407/407 EX2 trucks. 10-micron filtration. OEM quality. Fits 2010–2024.', specs: { micron: '10µm', type: 'Spin-on', BSP: '3/4-16 thread' } },
    { name: 'Tata 1616 Engine Oil Filter', brand: 'Tata Motors', part_number: 'TAT-1616-FLT-OIL-035', category_id: C['Filters & Lubrication'], price: 380, stock: 150, image: IMG.oilFilter, desc: 'Full-flow engine oil filter for Tata 1616 series. Mann Filter quality. Spin-on type. Change interval 10,000 km.', specs: { micron: '25µm', type: 'Spin-on Full-flow', thread: 'M20×1.5' } },

    // Wheels — Tata
    { name: 'Tata 407 10PR Load Range Tyre (7.50R16)', brand: 'Tata Motors', part_number: 'TAT-407-WHL-TYR-036', category_id: C['Wheels & Tyres'], price: 7200, stock: 30, image: IMG.tyre, desc: 'MRF/CEAT 7.50R16 10PR tubeless tyre for Tata 407 trucks. Suitable for highway and city roads. 2010–2024.', specs: { size: '7.50R16', plyRating: '10PR', type: 'Tubeless', loadIndex: 122 } },
    { name: 'Tata Prima 295/80R22.5 Radial Tyre', brand: 'Tata Motors', part_number: 'TAT-PRM-WHL-TYR-037', category_id: C['Wheels & Tyres'], price: 18500, stock: 12, image: IMG.tyre, desc: 'Bridgestone/Apollo 295/80R22.5 radial tyre for Tata Prima heavy-duty trucks. Long-haul highway tread. 2013–2025.', specs: { size: '295/80R22.5', loadIndex: 152, speedIndex: 'L', type: 'Tubeless Radial' } },
    { name: 'Tata 407 Steel Wheel Rim 6-Stud', brand: 'Tata Motors', part_number: 'TAT-407-WHL-RIM-038', category_id: C['Wheels & Tyres'], price: 3200, stock: 25, image: IMG.wheel, desc: 'Steel wheel rim for Tata 407 trucks. 6-stud pattern. 16×5.5 inch. Powder coated. 2010–2024 compatible.', specs: { size: '16×5.5 inch', studs: 6, PCD: '205mm', finish: 'Powder coated silver' } },

    // Safety — Tata
    { name: 'Tata Prima 3-Point Seat Belt Driver (BS6)', brand: 'Tata Motors', part_number: 'TAT-PRM-SAF-SBT-039', category_id: C['Safety & Accessories'], price: 2800, stock: 20, image: IMG.seatBelt, desc: 'Inertia reel 3-point seat belt assembly for Tata Prima driver seat. Meets AIS-005 safety standard. 2016–2025.', specs: { type: 'Inertia reel (ALR)', standard: 'AIS-005', webbing: 'Polyester 48mm' } },
    { name: 'Tata GPS Fleet Tracker OBD Unit', brand: 'Tata Motors', part_number: 'TAT-SAF-GPS-FLT-040', category_id: C['Safety & Accessories'], price: 4500, stock: 30, image: IMG.dashCam, desc: 'Fleet management GPS tracker with real-time tracking, driver scoring and fuel monitoring. Plug OBD-II port. Works on all Tata trucks 2012–2025.', specs: { tracking: 'GPS + GLONASS', connectivity: '4G LTE', dataFreq: 'Every 30 seconds' } },

    // ══════════════════════════════════════════════
    //  ASHOK LEYLAND (Dost, Partner, 1616, 2518,
    //                 3118, Boss, U-Truck, Phoenix, Captain)
    // ══════════════════════════════════════════════

    // Engine Parts — Ashok Leyland
    { name: 'Ashok Leyland H-Series Engine Cylinder Block', brand: 'Ashok Leyland', part_number: 'AL-HENG-ENG-BLK-041', category_id: C['Engine Parts'], price: 85000, stock: 4, image: IMG.engine, desc: 'Complete cylinder block for Ashok Leyland H-Series (H4, H6) engines used in Boss, Captain and U-Truck series. Cast iron. 2013–2025.', specs: { cylinders: 6, material: 'Cast Iron', bore: '102mm', stroke: '110mm' } },
    { name: 'Ashok Leyland 2518 Turbocharger (BorgWarner)', brand: 'Ashok Leyland', part_number: 'AL-2518-ENG-TRB-042', category_id: C['Engine Parts'], price: 22000, stock: 8, image: IMG.turbo, desc: 'BorgWarner K27 turbocharger for Ashok Leyland 2518 trucks with H6 CRS engine. BS4/BS6. 2014–2025.', specs: { brand: 'BorgWarner K27', type: 'Wastegate', A_R: '0.85', maxRPM: '115000' } },
    { name: 'Ashok Leyland Dost Fuel Injector Set', brand: 'Ashok Leyland', part_number: 'AL-DST-ENG-INJ-043', category_id: C['Engine Parts'], price: 5600, stock: 25, image: IMG.injector, desc: 'Diesel injector set (3 pcs) for Ashok Leyland Dost 1.5T with 3-cylinder IGA engine. CRDI type. 2011–2022.', specs: { type: 'CRDI Solenoid', cylinders: 3, pressure: '1800 bar' } },
    { name: 'Ashok Leyland Captain 3518 Piston Kit', brand: 'Ashok Leyland', part_number: 'AL-CPT-ENG-PST-044', category_id: C['Engine Parts'], price: 9800, stock: 15, image: IMG.piston, desc: 'Piston and liner kit (6 sets) for Ashok Leyland Captain 3518 with H6 engine. Mahle-quality forged aluminium pistons.', specs: { pistons: 6, type: 'Forged Aluminium', bore: '102mm', oversize: 'STD' } },
    { name: 'Ashok Leyland Phoenix Timing Chain Kit', brand: 'Ashok Leyland', part_number: 'AL-PHX-ENG-TCH-045', category_id: C['Engine Parts'], price: 4200, stock: 20, image: IMG.engine2, desc: 'Complete timing chain kit for Ashok Leyland Phoenix bus and truck engines. Includes chain, tensioner and guide rails.', specs: { links: 120, tensioner: 'Hydraulic', material: 'Chromoly steel' } },
    { name: 'Ashok Leyland U-Truck 1616 Cylinder Head Assembly', brand: 'Ashok Leyland', part_number: 'AL-UTK-ENG-CHD-046', category_id: C['Engine Parts'], price: 48000, stock: 5, image: IMG.engine3, desc: 'Reconditioned cylinder head for Ashok Leyland U-Truck 1616 IL6 engine. Includes valves, guides and springs. 2010–2024.', specs: { condition: 'Reconditioned OEM', valves: 12, combustionChamber: 'Swirl type' } },

    // Brake — Ashok Leyland
    { name: 'Ashok Leyland 2518 Rear Brake Drum', brand: 'Ashok Leyland', part_number: 'AL-2518-BRK-DRM-047', category_id: C['Brake System'], price: 5800, stock: 18, image: IMG.brake, desc: 'Heavy-duty rear brake drum for Ashok Leyland 2518 trucks. SG iron with high carbon content. OEM dimensions. 2014–2025.', specs: { material: 'SG Iron', diameter: '410mm', width: '160mm' } },
    { name: 'Ashok Leyland Air Reservoir Tank 40L', brand: 'Ashok Leyland', part_number: 'AL-BRK-ART-40L-048', category_id: C['Brake System'], price: 3600, stock: 20, image: IMG.brake2, desc: '40-litre air brake reservoir tank for Ashok Leyland Boss/Captain medium trucks. Zinc-coated steel. With drain valve. 2013–2025.', specs: { capacity: '40L', material: 'Zinc-coated Steel', maxPressure: '13 bar' } },
    { name: 'Ashok Leyland Dost Brake Caliper Kit', brand: 'Ashok Leyland', part_number: 'AL-DST-BRK-CAL-049', category_id: C['Brake System'], price: 3200, stock: 22, image: IMG.brakePad, desc: 'Front disc brake caliper rebuild kit for Ashok Leyland Dost/Partner with disc brakes. Includes piston, seals and boot. 2015–2025.', specs: { pistonDiameter: '45mm', pistonMaterial: 'Phenolic', seals: 'EPDM' } },

    // Transmission — Ashok Leyland
    { name: 'Ashok Leyland 6-Speed Overdrive Gearbox', brand: 'Ashok Leyland', part_number: 'AL-6SPD-TRN-GBX-050', category_id: C['Transmission & Clutch'], price: 75000, stock: 3, image: IMG.gearbox, desc: '6-speed synchromesh gearbox with overdrive 6th for Ashok Leyland medium-duty trucks (1616/2516). Fully rebuilt. 2010–2020.', specs: { gears: '6F+1R', overdrive: 'Yes (6th)', synchromesh: 'All gears', maxTorque: '750 Nm' } },
    { name: 'Ashok Leyland Captain Clutch Pressure Plate', brand: 'Ashok Leyland', part_number: 'AL-CPT-TRN-CPP-051', category_id: C['Transmission & Clutch'], price: 6500, stock: 15, image: IMG.clutch, desc: 'Clutch pressure plate for Ashok Leyland Captain 3518 with heavy-duty diaphragm spring. OEM quality. 2016–2025.', specs: { diameter: '395mm', type: 'Diaphragm', clampingForce: '28,000 N' } },

    // Suspension — Ashok Leyland
    { name: 'Ashok Leyland 2518 Heavy-Duty Rear Leaf Spring', brand: 'Ashok Leyland', part_number: 'AL-2518-SUS-LSP-052', category_id: C['Suspension & Steering'], price: 12800, stock: 10, image: IMG.suspension, desc: 'Rear leaf spring set for Ashok Leyland 2518 heavy-duty trucks. 9-leaf parabolic with main + helper spring. 2014–2025.', specs: { leaves: 9, type: 'Parabolic + Helper', material: '65Si7 steel', loadRating: '9500 kg' } },
    { name: 'Ashok Leyland Front Axle Kingpin Kit', brand: 'Ashok Leyland', part_number: 'AL-FNT-SUS-KPN-053', category_id: C['Suspension & Steering'], price: 4800, stock: 20, image: IMG.shockAbsorber, desc: 'Front axle kingpin and bushing kit for Ashok Leyland medium and heavy trucks. Includes bushings, thrust bearing and lock pin. Universal fit.', specs: { diameter: '38mm', material: 'Scm420 steel', hardness: 'HRC 58-62', bushing: 'Bronze' } },

    // Electrical — Ashok Leyland
    { name: 'Ashok Leyland 24V 100A Alternator', brand: 'Ashok Leyland', part_number: 'AL-24V-ELC-ALT-054', category_id: C['Electrical & Lighting'], price: 9500, stock: 12, image: IMG.alternator, desc: '24V 100A alternator for Ashok Leyland medium and heavy trucks. Valeo-Bosch equivalent. Self-regulating. 2010–2025.', specs: { voltage: '24V', output: '100A', mounting: 'Delco style 4-hole', rotation: 'CW' } },
    { name: 'Ashok Leyland BS6 ECU Engine Control Module', brand: 'Ashok Leyland', part_number: 'AL-BS6-ELC-ECU-055', category_id: C['Electrical & Lighting'], price: 35000, stock: 5, image: IMG.electrical, desc: 'BS6 engine control unit (ECU) for Ashok Leyland H-Series engines. Programmed, plug-and-play. 2020–2025 models.', specs: { standard: 'BS6/Euro 6', inputs: 32, outputs: 16, protection: 'IP67' } },

    // ══════════════════════════════════════════════
    //  MAHINDRA  (Blazo, Furio, Jeeto, Supro, Big Bolero, Truxo)
    // ══════════════════════════════════════════════

    // Engine Parts — Mahindra
    { name: 'Mahindra Blazo X 35 mPOWER Engine Piston', brand: 'Mahindra', part_number: 'MH-BLZ-ENG-PST-056', category_id: C['Engine Parts'], price: 5800, stock: 20, image: IMG.piston, desc: 'Aluminium forged piston for Mahindra Blazo X 35 with mPower engine. BS6 compliant. One pc, OEM quality. 2019–2025.', specs: { engine: 'mPOWER 5.1L BS6', material: 'Forged Aluminium', bore: '105mm', crown: 'Omega bowl' } },
    { name: 'Mahindra Furio 14 Turbocharger Assembly', brand: 'Mahindra', part_number: 'MH-FUR-ENG-TRB-057', category_id: C['Engine Parts'], price: 17500, stock: 10, image: IMG.turbo, desc: 'KKK/Borg Warner turbocharger for Mahindra Furio 14T truck with 3.5L turbodiesel engine. 2018–2025.', specs: { type: 'Wastegate Turbo', maxBoost: '1.9 bar', oilCooled: true } },
    { name: 'Mahindra Jeeto L33 Engine Assembly (Complete)', brand: 'Mahindra', part_number: 'MH-JTO-ENG-CMP-058', category_id: C['Engine Parts'], price: 65000, stock: 3, image: IMG.engine, desc: 'Complete reconditioned engine assembly for Mahindra Jeeto L33 mini-truck. 2-cylinder diesel. Includes all auxiliaries. 2015–2025.', specs: { cylinders: 2, displacement: '0.66L', output: '18HP', condition: 'Reconditioned' } },
    { name: 'Mahindra Blazo 25 Crankshaft Assembly', brand: 'Mahindra', part_number: 'MH-BLZ-ENG-CRK-059', category_id: C['Engine Parts'], price: 32000, stock: 6, image: IMG.engine2, desc: 'Forged steel crankshaft for Mahindra Blazo 25/35 trucks with MDI TCI engine. Precision balanced. 2016–2025.', specs: { cylinders: 4, material: 'Forged Steel', journals: 5, mainBearing: '68mm' } },
    { name: 'Mahindra Supro Profit Truck Diesel Injector', brand: 'Mahindra', part_number: 'MH-SUP-ENG-INJ-060', category_id: C['Engine Parts'], price: 2800, stock: 35, image: IMG.injector, desc: 'CRDI diesel injector for Mahindra Supro Profit Truck. Single injector, sold each. 2016–2024 models.', specs: { type: 'CRDI', pressure: '1600 bar', cylinders: 4 } },

    // Brake — Mahindra
    { name: 'Mahindra Big Bolero Pickup Brake Drum Set', brand: 'Mahindra', part_number: 'MH-BBP-BRK-DRM-061', category_id: C['Brake System'], price: 3200, stock: 25, image: IMG.brake, desc: 'Front and rear brake drum set (4 pcs) for Mahindra Big Bolero Pickup truck 2018–2025. High-quality cast iron.', specs: { material: 'High Carbon Cast Iron', pcs: 4, diameter: '270mm' } },
    { name: 'Mahindra Furio Disc Brake Pads Set (Front)', brand: 'Mahindra', part_number: 'MH-FUR-BRK-PAD-062', category_id: C['Brake System'], price: 2200, stock: 30, image: IMG.brakePad, desc: 'Front disc brake pad set for Mahindra Furio 14/17 trucks. Low-dusting, low-noise ceramic formula. BS6 variants. 2018–2025.', specs: { type: 'Ceramic', friction: 'ECE R90', thickness: '18mm', pcs: 4 } },

    // Transmission — Mahindra
    { name: 'Mahindra Blazo X 28 Clutch Kit Complete', brand: 'Mahindra', part_number: 'MH-BLZ-TRN-CLT-063', category_id: C['Transmission & Clutch'], price: 8500, stock: 15, image: IMG.clutch, desc: 'Complete clutch kit for Mahindra Blazo X 28 with TCIC engine: disc, pressure plate and bearing. LuK quality. 2018–2025.', specs: { diameter: '362mm', brand: 'LuK OEM', type: 'Single Dry Plate' } },
    { name: 'Mahindra Furio 5-Speed Gearbox', brand: 'Mahindra', part_number: 'MH-FUR-TRN-GBX-064', category_id: C['Transmission & Clutch'], price: 42000, stock: 4, image: IMG.gearbox, desc: '5-speed manual gearbox for Mahindra Furio 11T–17T range. Fully rebuilt with new synchros and bearings. 2018–2025.', specs: { gears: '5F+1R', rebuilt: true, maxTorque: '450 Nm' } },

    // Suspension — Mahindra
    { name: 'Mahindra Blazo Rear Leaf Spring Set', brand: 'Mahindra', part_number: 'MH-BLZ-SUS-LSP-065', category_id: C['Suspension & Steering'], price: 9500, stock: 12, image: IMG.suspension, desc: 'Rear multi-leaf spring assembly for Mahindra Blazo 25/35 series. 8-leaf with top full and bottom half-length. 2016–2025.', specs: { leaves: 8, material: '65Si7', loadRating: '6000 kg', span: '1350mm' } },
    { name: 'Mahindra Furio Power Steering Pump', brand: 'Mahindra', part_number: 'MH-FUR-SUS-PSP-066', category_id: C['Suspension & Steering'], price: 8200, stock: 12, image: IMG.steering, desc: 'Hydraulic power steering pump for Mahindra Furio medium trucks. ZF-type vane pump. 2018–2025. Plug-and-play replacement.', specs: { type: 'Vane Pump', flowRate: '14 L/min', maxPressure: '145 bar' } },

    // Electrical — Mahindra
    { name: 'Mahindra Blazo BS6 LED Headlight Set', brand: 'Mahindra', part_number: 'MH-BLZ-ELC-HDL-067', category_id: C['Electrical & Lighting'], price: 7200, stock: 15, image: IMG.headlight, desc: 'LED headlight assembly pair for Mahindra Blazo X series BS6. High beam, low beam and position light integrated. 2019–2025.', specs: { type: 'LED', lumens: '5500lm', DRL: true, IP: 'IP67' } },
    { name: 'Mahindra Supro 12V Starter Motor', brand: 'Mahindra', part_number: 'MH-SUP-ELC-STR-068', category_id: C['Electrical & Lighting'], price: 3800, stock: 20, image: IMG.alternator, desc: '12V, 2.2kW starter motor for Mahindra Supro Profit Truck and Maxitruck. Direct Denso OEM equivalent.', specs: { voltage: '12V', power: '2.2kW', teeth: 9, weight: '4.1kg' } },

    // Filters — Mahindra
    { name: 'Mahindra Blazo Engine Oil Filter (BS6)', brand: 'Mahindra', part_number: 'MH-BLZ-FLT-OIL-069', category_id: C['Filters & Lubrication'], price: 420, stock: 100, image: IMG.oilFilter, desc: 'Heavy-duty engine oil filter for Mahindra Blazo X BS6 trucks. Mahle quality. 20,000 km change interval.', specs: { micron: '25µm', type: 'Spin-on', thread: 'M22×1.5', capacity: '0.8L' } },
    { name: 'Mahindra Furio Air Filter Primary Element', brand: 'Mahindra', part_number: 'MH-FUR-FLT-AIR-070', category_id: C['Filters & Lubrication'], price: 680, stock: 80, image: IMG.airFilter, desc: 'Primary air filter element for Mahindra Furio trucks. Donaldson-type radial seal design. 2018–2025.', specs: { type: 'Radial Seal Dry', media: 'Nano-fibre', changeInterval: '30,000 km' } },

    // ══════════════════════════════════════════════
    //  BHARATBENZ  (914R, 1214R, 1216R, 1623R, 2523R)
    // ══════════════════════════════════════════════

    // Engine Parts — BharatBenz
    { name: 'BharatBenz 1623R OM904 Fuel Injector Nozzle', brand: 'BharatBenz', part_number: 'BB-1623-ENG-INJ-071', category_id: C['Engine Parts'], price: 12500, stock: 12, image: IMG.injector, desc: 'Bosch/Denso fuel injector nozzle for BharatBenz 1623R with Mercedes OM904 engine. Common rail, high pressure. 2013–2025.', specs: { brand: 'Bosch', type: 'Common Rail', pressure: '1800 bar', cylinders: 4 } },
    { name: 'BharatBenz 2523R OM926 Cylinder Head Gasket Set', brand: 'BharatBenz', part_number: 'BB-2523-ENG-GSK-072', category_id: C['Engine Parts'], price: 6800, stock: 10, image: IMG.gasket, desc: 'Full engine gasket kit for BharatBenz 2523R trucks with OM926 6-cylinder engine. MLS head gasket + all auxiliary gaskets.', specs: { engine: 'OM926', headGasket: 'MLS 3-layer', set: 'Full engine' } },
    { name: 'BharatBenz 1214R OM904 Turbocharger', brand: 'BharatBenz', part_number: 'BB-1214-ENG-TRB-073', category_id: C['Engine Parts'], price: 25000, stock: 6, image: IMG.turbo, desc: 'KKK turbocharger for BharatBenz 1214R light-medium truck with OM904 engine. Water and oil cooled bearing housing.', specs: { brand: 'KKK', type: 'Water + Oil Cooled', oilFed: true, A_R: '0.78' } },
    { name: 'BharatBenz 914R Engine Piston + Liner Kit', brand: 'BharatBenz', part_number: 'BB-914R-ENG-PLK-074', category_id: C['Engine Parts'], price: 18000, stock: 8, image: IMG.piston, desc: 'Piston and wet liner kit (4 sets) for BharatBenz 914R trucks with 4-cylinder diesel. Mahle-standard components. 2013–2025.', specs: { pistons: 4, type: 'Wet Liner', material: 'Forged Al piston + Cast Iron liner' } },

    // Brake — BharatBenz
    { name: 'BharatBenz EBS Electronic Brake System Unit', brand: 'BharatBenz', part_number: 'BB-EBS-BRK-ECU-075', category_id: C['Brake System'], price: 45000, stock: 4, image: IMG.brake2, desc: 'Knorr-Bremse EBS electronic brake system control unit for BharatBenz heavy trucks. ABS+EBS+ESP integrated. 2016–2025.', specs: { brand: 'Knorr-Bremse', functions: 'ABS+EBS+ESP', axles: 2, voltage: '24V' } },
    { name: 'BharatBenz 2523R Brake Drum 420mm', brand: 'BharatBenz', part_number: 'BB-2523-BRK-DRM-076', category_id: C['Brake System'], price: 8500, stock: 10, image: IMG.brake, desc: 'Heavy-duty rear brake drum for BharatBenz 2523R trucks. 420mm diameter. SG iron. 2015–2025.', specs: { material: 'SG Iron', diameter: '420mm', width: '180mm', finish: 'Shot blasted' } },

    // Transmission — BharatBenz
    { name: 'BharatBenz G60 6-Speed Manual Gearbox', brand: 'BharatBenz', part_number: 'BB-G60-TRN-GBX-077', category_id: C['Transmission & Clutch'], price: 95000, stock: 3, image: IMG.gearbox, desc: 'Mercedes G60 6-speed manual gearbox for BharatBenz 1216R/1623R series. Remanufactured. Includes installation hardware.', specs: { model: 'Mercedes G60', gears: '6F+1R', maxTorque: '900 Nm', synchromesh: 'All' } },
    { name: 'BharatBenz 1623 Clutch Kit 430mm', brand: 'BharatBenz', part_number: 'BB-1623-TRN-CLT-078', category_id: C['Transmission & Clutch'], price: 12500, stock: 10, image: IMG.clutch, desc: '430mm single-disc clutch kit for BharatBenz 1623R trucks. Sachs/ZF quality. Plate + pressure plate + release bearing.', specs: { diameter: '430mm', brand: 'Sachs ZF', type: 'Single Dry' } },

    // Suspension — BharatBenz
    { name: 'BharatBenz 2523R Front Axle with Disc Brakes', brand: 'BharatBenz', part_number: 'BB-2523-SUS-FAX-079', category_id: C['Suspension & Steering'], price: 185000, stock: 2, image: IMG.suspension, desc: 'Complete front axle assembly for BharatBenz 2523R with integrated disc brakes and ABS sensors. Load rating 7500 kg.', specs: { type: 'I-beam', loadRating: '7500 kg', brakes: 'Disc', ABS: 'Included' } },
    { name: 'BharatBenz ZF Servocom Steering Box', brand: 'BharatBenz', part_number: 'BB-ZF-SUS-STR-080', category_id: C['Suspension & Steering'], price: 55000, stock: 4, image: IMG.steering, desc: 'ZF Servocom 8098 hydraulic power steering gear box for BharatBenz heavy trucks. Re-manufactured. 2013–2025.', specs: { brand: 'ZF Servocom 8098', ratio: '22:1', refurbished: true } },

    // Electrical — BharatBenz
    { name: 'BharatBenz 24V 180A Alternator (Bosch)', brand: 'BharatBenz', part_number: 'BB-24V-ELC-ALT-081', category_id: C['Electrical & Lighting'], price: 18500, stock: 8, image: IMG.alternator, desc: 'Bosch 24V 180A alternator for BharatBenz 2523R heavy-duty trucks. High-output for multiple electrical consumers.', specs: { brand: 'Bosch', voltage: '24V', output: '180A', efficiency: '75%' } },

    // ══════════════════════════════════════════════
    //  EICHER  (Pro 1049, 1059, 2095, 3015, 6025, 8031)
    // ══════════════════════════════════════════════

    // Engine Parts — Eicher
    { name: 'Eicher Pro 2095 XP Engine Cylinder Liner', brand: 'Eicher', part_number: 'EC-2095-ENG-LNR-082', category_id: C['Engine Parts'], price: 2800, stock: 30, image: IMG.engine, desc: 'Wet cylinder liner for Eicher Pro 2095 XP trucks with 3.3L MPFI engine. Centrifugally cast, induction hardened. 2012–2025.', specs: { type: 'Wet Liner', material: 'Centrifugally Cast Iron', bore: '95mm', hardness: 'HRC 45-50' } },
    { name: 'Eicher Pro 6025 Engine Crankshaft', brand: 'Eicher', part_number: 'EC-6025-ENG-CRK-083', category_id: C['Engine Parts'], price: 34000, stock: 5, image: IMG.engine2, desc: 'Forged steel crankshaft for Eicher Pro 6025 trucks with 6-cylinder TCIC engine. Nitrided for hardness. 2015–2025.', specs: { cylinders: 6, material: 'Forged Alloy Steel', nitrided: true, counterweights: 12 } },
    { name: 'Eicher Pro 8031 Turbo Intercooler (Air-Air)', brand: 'Eicher', part_number: 'EC-8031-ENG-ICL-084', category_id: C['Engine Parts'], price: 15500, stock: 8, image: IMG.engine3, desc: 'Air-to-air intercooler for Eicher Pro 8031 super-heavy trucks with VOLVO D8K engine. Bar-and-plate aluminium core.', specs: { type: 'Air-to-Air', core: 'Bar-and-Plate Aluminium', efficiency: '80%' } },
    { name: 'Eicher Pro 3015 Fuel Injection Pump (Bosch)', brand: 'Eicher', part_number: 'EC-3015-ENG-FIP-085', category_id: C['Engine Parts'], price: 28000, stock: 6, image: IMG.fuelPump, desc: 'Bosch VP44 rotary distributor injection pump for Eicher Pro 3015 trucks. Remanufactured to OEM specs. 2013–2020.', specs: { brand: 'Bosch VP44', type: 'Rotary Distributor', pressure: '1300 bar', governor: 'Electronic' } },
    { name: 'Eicher Pro 1059 CNG/LPG Engine Valve Guide Set', brand: 'Eicher', part_number: 'EC-1059-ENG-VGD-086', category_id: C['Engine Parts'], price: 1600, stock: 50, image: IMG.engine, desc: 'Valve guide set (8 pcs) for Eicher Pro 1059 CNG variant. Silicon bronze alloy for superior combustion gas resistance. 2015–2024.', specs: { pcs: 8, material: 'Silicon Bronze', innerDia: '6mm', length: '52mm' } },

    // Brake — Eicher
    { name: 'Eicher Pro 2095 Brake Drum + Shoes Kit', brand: 'Eicher', part_number: 'EC-2095-BRK-DKT-087', category_id: C['Brake System'], price: 4800, stock: 20, image: IMG.brake, desc: 'Front brake drum and shoe kit for Eicher Pro 2095/3015. Drum + 4 shoes with lining. 2012–2025. Asbestos-free.', specs: { drumMaterial: 'SG Iron', shoeLining: 'Non-asbestos', drumDiameter: '320mm' } },

    // Transmission — Eicher
    { name: 'Eicher Pro 6025 9-Speed Gearbox Assembly', brand: 'Eicher', part_number: 'EC-6025-TRN-GBX-088', category_id: C['Transmission & Clutch'], price: 115000, stock: 2, image: IMG.gearbox, desc: 'IECO 9-speed synchromesh gearbox for Eicher Pro 6025. Remanufactured. Long-range ratio set for highway application.', specs: { model: 'IECO 9-speed', gears: '9F+1R', maxTorque: '1100 Nm', weight: '265 kg' } },
    { name: 'Eicher Pro 3015 Clutch Disc 362mm', brand: 'Eicher', part_number: 'EC-3015-TRN-CDK-089', category_id: C['Transmission & Clutch'], price: 4800, stock: 20, image: IMG.clutch, desc: 'Clutch disc for Eicher Pro 3015 medium trucks. 362mm diameter, organic friction lining. Valeo quality.', specs: { diameter: '362mm', lining: 'Organic', brand: 'Valeo', hub: 'Rubber damped' } },

    // Suspension — Eicher
    { name: 'Eicher Pro 6025 Parabolic Rear Spring 11-Leaf', brand: 'Eicher', part_number: 'EC-6025-SUS-RSP-090', category_id: C['Suspension & Steering'], price: 18500, stock: 8, image: IMG.suspension, desc: '11-leaf parabolic rear leaf spring for Eicher Pro 6025 heavy trucks. High tensile steel. Load rating 12,000 kg total axle.', specs: { leaves: 11, type: 'Parabolic', loadRating: '12,000 kg total', span: '1500mm' } },

    // ══════════════════════════════════════════════
    //  FORCE MOTORS  (Traveller, Trax Cruiser Pro HD)
    // ══════════════════════════════════════════════

    { name: 'Force Motors Traveller 3700 Engine Head Gasket', brand: 'Force Motors', part_number: 'FM-TRV-ENG-GSK-091', category_id: C['Engine Parts'], price: 2200, stock: 25, image: IMG.gasket, desc: 'Cylinder head gasket for Force Motors Traveller 3700 with 2.5L diesel engine. MLS gasket. 2010–2025.', specs: { engine: '2.5L TDI', type: 'MLS', thickness: '1.0mm' } },
    { name: 'Force Motors Trax Cruiser Clutch Kit', brand: 'Force Motors', part_number: 'FM-TRX-TRN-CLT-092', category_id: C['Transmission & Clutch'], price: 5200, stock: 15, image: IMG.clutch, desc: 'Clutch kit for Force Motors Trax Cruiser Pro HD. Pressure plate + disc + bearing. OEM quality. 2013–2024.', specs: { diameter: '280mm', type: 'Diaphragm', kit: 'Complete 3-piece' } },
    { name: 'Force Motors Ambulance Multi-Leaf Spring (Front)', brand: 'Force Motors', part_number: 'FM-AMB-SUS-LSP-093', category_id: C['Suspension & Steering'], price: 5600, stock: 18, image: IMG.suspension, desc: 'Front leaf spring for Force Motors Traveller ambulance conversions. 7-leaf with graduated leaves. Extra load capacity.', specs: { leaves: 7, loadRating: '2200 kg', material: 'SAE Spring Steel' } },
    { name: 'Force Motors Traveller 12V 65Ah Battery', brand: 'Force Motors', part_number: 'FM-TRV-ELC-BAT-094', category_id: C['Electrical & Lighting'], price: 6500, stock: 20, image: IMG.battery, desc: '12V 65Ah maintenance-free battery for Force Motors Traveller and Trax series. Exide/Amaron equivalent. 2010–2025.', specs: { voltage: '12V', capacity: '65Ah', type: 'VRLA AGM', CCA: '520A' } },

    // ══════════════════════════════════════════════
    //  SML ISUZU  (Samrat, Sartaj, S7)
    // ══════════════════════════════════════════════

    { name: 'SML Isuzu Samrat 3.7L Engine Pistons (4 pcs)', brand: 'SML Isuzu', part_number: 'SI-SAM-ENG-PST-095', category_id: C['Engine Parts'], price: 7200, stock: 15, image: IMG.piston, desc: 'Forged aluminium piston set (4 pcs) for SML Isuzu Samrat GS with 3.7L 4JB1 diesel engine. OEM Isuzu specification. 2012–2024.', specs: { pistons: 4, engine: 'Isuzu 4JB1', material: 'Forged Aluminium', bore: '93mm' } },
    { name: 'SML Isuzu Sartaj CG Clutch Kit 330mm', brand: 'SML Isuzu', part_number: 'SI-SAR-TRN-CLT-096', category_id: C['Transmission & Clutch'], price: 5800, stock: 18, image: IMG.clutch, desc: 'Complete clutch kit for SML Isuzu Sartaj CG/GS trucks. 330mm clutch disc + pressure plate + release bearing.', specs: { diameter: '330mm', type: 'Cerametallic', springs: 'Coil' } },
    { name: 'SML Isuzu S7 Rear Brake Drum', brand: 'SML Isuzu', part_number: 'SI-S7-BRK-DRM-097', category_id: C['Brake System'], price: 4200, stock: 15, image: IMG.brake, desc: 'Rear brake drum for SML Isuzu S7 series trucks. 340mm diameter high-carbon SG iron. 2015–2024.', specs: { diameter: '340mm', material: 'SG Iron', finish: 'Painted' } },
    { name: 'SML Isuzu Samrat Alternator 24V 80A', brand: 'SML Isuzu', part_number: 'SI-SAM-ELC-ALT-098', category_id: C['Electrical & Lighting'], price: 7500, stock: 12, image: IMG.alternator, desc: '24V 80A alternator for SML Isuzu Samrat series trucks. Mitsubishi equivalent. Self-regulating. 2012–2024.', specs: { voltage: '24V', output: '80A', brand: 'Mitsubishi type', weight: '6.2kg' } },

    // ══════════════════════════════════════════════
    //  MAN TRUCKS  (CLA, TGA, TGS India)
    // ══════════════════════════════════════════════

    { name: 'MAN CLA 25.280 D2066 Engine Oil Filter Kit', brand: 'MAN Trucks', part_number: 'MAN-CLA-FLT-OIL-099', category_id: C['Filters & Lubrication'], price: 1850, stock: 40, image: IMG.oilFilter, desc: 'Engine oil filter kit for MAN CLA trucks with D2066 engine. Mahle OC617 equivalent. Includes drain plug gasket.', specs: { brand: 'Mahle OC617', micron: '20µm', type: 'Spin-on', changeInterval: '60,000 km' } },
    { name: 'MAN TGS 35.480 D26 Turbocharger VTG', brand: 'MAN Trucks', part_number: 'MAN-TGS-ENG-TRB-100', category_id: C['Engine Parts'], price: 65000, stock: 3, image: IMG.turbo, desc: 'MAN Holset Variable Geometry Turbocharger for MAN TGS India series heavy trucks with D26 engine. BS4 rated.', specs: { type: 'Variable Geometry (VGT)', brand: 'Holset', engine: 'MAN D26', maxBoost: '2.5 bar' } },
    { name: 'MAN CLA Rear Axle Planetary Hub', brand: 'MAN Trucks', part_number: 'MAN-CLA-TRN-HUB-101', category_id: C['Transmission & Clutch'], price: 38000, stock: 4, image: IMG.gearbox, desc: 'Rear axle planetary hub assembly for MAN CLA heavy-duty trucks. Portal axle design. OEM replacement.', specs: { type: 'Planetary Hub Reduction', ratio: '5.4:1', material: 'Cast Steel' } },
    { name: 'MAN TGA ZF 16-Speed Gearbox (AS-Tronic)', brand: 'MAN Trucks', part_number: 'MAN-TGA-TRN-GBX-102', category_id: C['Transmission & Clutch'], price: 285000, stock: 2, image: IMG.gearbox, desc: 'ZF AS-Tronic 16-speed automated manual gearbox for MAN TGA trucks. Remanufactured. Includes TCU module.', specs: { model: 'ZF AS-Tronic 16S181', gears: '16F+2R', maxTorque: '1900 Nm', type: 'Automated Manual' } },
    { name: 'MAN CLA Knorr-Bremse Air Dryer', brand: 'MAN Trucks', part_number: 'MAN-CLA-BRK-ADR-103', category_id: C['Brake System'], price: 12500, stock: 8, image: IMG.brake2, desc: 'Knorr-Bremse air dryer with integrated pressure governor for MAN CLA trucks. Ensures dry air to brake system.', specs: { brand: 'Knorr-Bremse', type: 'Desiccant Cartridge', purgeValve: 'Integrated', voltage: '24V' } },
    { name: 'MAN TGS Wabco EBS Modulator', brand: 'MAN Trucks', part_number: 'MAN-TGS-BRK-EBS-104', category_id: C['Brake System'], price: 32000, stock: 4, image: IMG.brake2, desc: 'WABCO Electronic Brake System (EBS) brake pressure modulator for MAN TGS heavy trucks. ABS + EBS + ETC functions.', specs: { brand: 'WABCO', functions: 'ABS+EBS+ETC', axles: 2, compatible: 'MAN TGS Euro4/5' } },

    // ══════════════════════════════════════════════
    //  VOLVO TRUCKS  (FH, FM, FMX India)
    // ══════════════════════════════════════════════

    { name: 'Volvo FH D13 Engine Cylinder Head', brand: 'Volvo Trucks', part_number: 'VLV-FH-ENG-CHD-105', category_id: C['Engine Parts'], price: 125000, stock: 2, image: IMG.engine3, desc: 'OEM-grade reconditioned cylinder head for Volvo FH/FM trucks with D13A engine. 6-cylinder, 4 valves per cylinder. India assembled.', specs: { engine: 'Volvo D13A', valves: '4 per cylinder', chambers: 6, condition: 'Reconditioned' } },
    { name: 'Volvo FM D11 Turbocharger (Holset HE551)', brand: 'Volvo Trucks', part_number: 'VLV-FM-ENG-TRB-106', category_id: C['Engine Parts'], price: 92000, stock: 3, image: IMG.turbo, desc: 'Holset HE551V variable geometry turbocharger for Volvo FM with D11 engine. Electronic actuator. 2012–2025.', specs: { brand: 'Holset HE551V', type: 'VGT Electronic', actuator: 'Electric', wastegate: 'No' } },
    { name: 'Volvo FH ZF 12-Speed I-Shift AMT Gearbox', brand: 'Volvo Trucks', part_number: 'VLV-FH-TRN-GBX-107', category_id: C['Transmission & Clutch'], price: 385000, stock: 2, image: IMG.gearbox, desc: 'Volvo I-Shift 12-speed automated manual gearbox for FH/FM trucks. Complete remanufactured with ECU. 2013–2025 India spec.', specs: { model: 'Volvo I-Shift 12-speed', gears: '12F+4R', maxTorque: '2500 Nm', type: 'AMT' } },
    { name: 'Volvo FMX Rear Air Spring Bellows', brand: 'Volvo Trucks', part_number: 'VLV-FMX-SUS-ASB-108', category_id: C['Suspension & Steering'], price: 22000, stock: 8, image: IMG.shockAbsorber, desc: 'Firestone double-convoluted rear air spring for Volvo FMX series trucks with air suspension. 2012–2025 India models.', specs: { brand: 'Firestone', type: 'Double Convoluted', diameter: '340mm', maxPressure: '10 bar' } },
    { name: 'Volvo FH WABCO Air Compressor 707cc', brand: 'Volvo Trucks', part_number: 'VLV-FH-BRK-CMP-109', category_id: C['Brake System'], price: 45000, stock: 4, image: IMG.brake2, desc: 'WABCO 707cc 2-cylinder air compressor for Volvo FH/FM trucks. Oil-cooled and water-cooled. Direct OEM fitment.', specs: { brand: 'WABCO', displacement: '707cc', cylinders: 2, cooling: 'Water + Oil' } },
    { name: 'Volvo FM 295/80R22.5 Bridgestone Tyre', brand: 'Volvo Trucks', part_number: 'VLV-FM-WHL-TYR-110', category_id: C['Wheels & Tyres'], price: 24000, stock: 8, image: IMG.tyre, desc: 'Bridgestone R-DRIVE 001 295/80R22.5 drive axle tyre for Volvo FM trucks. Long-haul highway compound. Low rolling resistance.', specs: { size: '295/80R22.5', brand: 'Bridgestone R-DRIVE 001', loadIndex: 152, speedIndex: 'M' } },

    // ══════════════════════════════════════════════
    //  SCANIA  (R, G, P Series India)
    // ══════════════════════════════════════════════

    { name: 'Scania R 480 XPI Injector (Denso)', brand: 'Scania', part_number: 'SCA-R480-ENG-INJ-111', category_id: C['Engine Parts'], price: 35000, stock: 5, image: IMG.injector, desc: 'Denso common rail injector for Scania R 480 and R 560 trucks with DC16 XPI engine. Reconditioned to factory spec.', specs: { brand: 'Denso', type: 'XPI Piezo', pressure: '2400 bar', each: 'Single injector' } },
    { name: 'Scania G 410 Cylinder Head Gasket MLS', brand: 'Scania', part_number: 'SCA-G410-ENG-GSK-112', category_id: C['Engine Parts'], price: 8500, stock: 8, image: IMG.gasket, desc: 'Multi-layer steel cylinder head gasket for Scania G 410 with DC13 5-cylinder engine. Victor-Reinz quality.', specs: { brand: 'Victor-Reinz', engine: 'Scania DC13', type: 'MLS 3-layer', cylinders: 5 } },
    { name: 'Scania R Series Opticruise AMT Gearbox', brand: 'Scania', part_number: 'SCA-R-TRN-GBX-113', category_id: C['Transmission & Clutch'], price: 420000, stock: 2, image: IMG.gearbox, desc: 'Scania GRS905R Opticruise 12-speed automated gearbox for R-series trucks. Remanufactured. Includes gear selector unit.', specs: { model: 'GRS905R', gears: '12F+4R', type: 'Automated Synchromesh', maxTorque: '3000 Nm' } },
    { name: 'Scania P 410 Disc Brake Caliper (Front)', brand: 'Scania', part_number: 'SCA-P410-BRK-CAL-114', category_id: C['Brake System'], price: 28000, stock: 6, image: IMG.brakePad, desc: 'Front disc brake caliper for Scania P-series trucks. Knorr-Bremse SB7 single-piston sliding caliper. 2012–2025.', specs: { brand: 'Knorr-Bremse SB7', pistons: 1, diameter: '60mm', swept: '330mm disc' } },
    { name: 'Scania R-Series Front Shock Absorber (Sachs)', brand: 'Scania', part_number: 'SCA-R-SUS-SHK-115', category_id: C['Suspension & Steering'], price: 18500, stock: 8, image: IMG.shockAbsorber, desc: 'Sachs twin-tube front shock absorber for Scania R/G series trucks. Heavy-duty gas-charged. 2012–2025 India spec.', specs: { brand: 'Sachs', type: 'Twin-tube Gas', stroke: '220mm', load: 'up to 20,000 kg GVW' } },

    // ══════════════════════════════════════════════
    //  UNIVERSAL / MULTI-BRAND PARTS
    //  (Fits all truck brands, sold generically)
    // ══════════════════════════════════════════════

    // Filters (Multi-brand)
    { name: 'Truck Universal Air Filter (Dry Type 300mm)', brand: 'Cummins', part_number: 'UNV-FLT-AIR-116', category_id: C['Filters & Lubrication'], price: 850, stock: 80, image: IMG.airFilter, desc: 'Universal dry-type primary air filter, 300mm diameter radial seal. Fits most Indian medium-duty trucks 2010–2025. Donaldson-standard.', specs: { type: 'Dry Radial Seal', diameter: '300mm', micron: '3µm', brand: 'Donaldson equivalent' } },
    { name: 'Truck Diesel Water Separator Filter 90mm', brand: 'Bosch', part_number: 'UNV-FLT-WFS-117', category_id: C['Filters & Lubrication'], price: 680, stock: 90, image: IMG.oilFilter, desc: 'Diesel fuel water separator filter for Indian diesel truck engines. 90mm spin-on. Removes water and particulates above 5 micron.', specs: { type: 'Spin-on Water Separator', micron: '5µm', thread: 'M20×1.5', bowlType: 'Transparent' } },
    { name: 'Premium SAE 15W-40 CI-4 Diesel Engine Oil 5L', brand: 'Cummins', part_number: 'UNV-OIL-15W40-118', category_id: C['Filters & Lubrication'], price: 1250, stock: 200, image: IMG.oilFilter, desc: 'SAE 15W-40 CI-4 Plus mineral engine oil for all Indian diesel truck engines. 5-litre can. Compatible with BS4 and BS6 engines.', specs: { grade: 'SAE 15W-40', standard: 'API CI-4+', volume: '5L', compatibility: 'BS4 + BS6' } },
    { name: 'Heavy-Duty Truck Coolant -40°C 5L (OAT)', brand: 'Cummins', part_number: 'UNV-CLT-OAT-5L-119', category_id: C['Cooling System'], price: 950, stock: 150, image: IMG.radiator, desc: 'Organic Acid Technology (OAT) truck coolant for all Indian truck brands. Pink colour. -40°C freeze protection. Ready to use.', specs: { type: 'OAT Organic Acid', protection: '-40°C', volume: '5L', colour: 'Pink' } },
    { name: 'Universal Truck Wiper Blade Set 24" (600mm)', brand: 'Bosch', part_number: 'UNV-WPR-BLD-120', category_id: C['Safety & Accessories'], price: 480, stock: 120, image: IMG.dashCam, desc: 'Bosch 24-inch (600mm) universal truck wiper blade pair. Multi-clip adapter system fits most Indian truck windscreens 2010–2025.', specs: { length: '600mm (24")', type: 'Flat Frameless', pcs: 2, adapter: 'Multi-clip universal' } },

    // Additional premium parts across all categories
    { name: 'Tata Prima 4928 Engine Rebuild Kit Complete', brand: 'Tata Motors', part_number: 'TAT-PRM-ENG-RBK-121', category_id: C['Engine Parts'], price: 95000, stock: 3, image: IMG.engine, desc: 'Complete engine rebuild kit for Tata Prima 4928.S with Cummins ISLe engine. Includes pistons, rings, bearings, gaskets, seals. OEM + aftermarket quality mix.', specs: { components: '250+ pieces', engine: 'Cummins ISLe 9', includes: 'Pistons, Rings, Bearings, Gaskets' } },
    { name: 'Ashok Leyland 3118 Rear Differential Assembly', brand: 'Ashok Leyland', part_number: 'AL-3118-TRN-DIF-122', category_id: C['Transmission & Clutch'], price: 145000, stock: 2, image: IMG.gearbox, desc: 'Rear tandem differential assembly for Ashok Leyland 3118 trucks. Spiral bevel gear, limited slip optional. 2014–2024.', specs: { type: 'Spiral Bevel', ratio: '4.875:1', LSD: 'Optional', capacity: '18 tonnes GVW' } },
    { name: 'BharatBenz 3143S Exhaust DPF Assembly', brand: 'BharatBenz', part_number: 'BB-3143-EXH-DPF-123', category_id: C['Exhaust System'], price: 135000, stock: 3, image: IMG.exhaust, desc: 'Diesel Particulate Filter (DPF) assembly for BharatBenz 3143S BS6 trucks. Cordierite honeycomb substrate. 2019–2025.', specs: { standard: 'BS6/Euro 6', substrate: 'Cordierite', regenTemp: '550-650°C', sootCapacity: '8.5g/L' } },
    { name: 'Eicher Pro 8031 Complete Exhaust System Kit', brand: 'Eicher', part_number: 'EC-8031-EXH-KIT-124', category_id: C['Exhaust System'], price: 45000, stock: 4, image: IMG.muffler, desc: 'Complete stainless steel exhaust system for Eicher Pro 8031 XP. Includes manifold, downpipe, DPF-SCR, muffler and tips.', specs: { material: 'SS 409', includes: 'Manifold to tail pipe', standard: 'BS6' } },
    { name: 'Tata Ultra 1518 Aluminium Wheel Rim 17.5"', brand: 'Tata Motors', part_number: 'TAT-ULT-WHL-RIM-125', category_id: C['Wheels & Tyres'], price: 8500, stock: 15, image: IMG.wheel, desc: 'Aluminium alloy wheel rim for Tata Ultra 1518 trucks. Tubeless 17.5×6.00 inch. 8-stud. Weight: 11 kg (40% lighter than steel).', specs: { size: '17.5×6.00"', material: 'Aluminium Alloy 6061-T6', studs: 8, weight: '11 kg' } },
    { name: 'Mahindra Blazo X Urea SCR System (AdBlue Tank)', brand: 'Mahindra', part_number: 'MH-BLZ-EXH-SCR-126', category_id: C['Exhaust System'], price: 18500, stock: 8, image: IMG.exhaust, desc: 'DEF/AdBlue SCR urea tank + dosing pump assembly for Mahindra Blazo X BS6 trucks. 30-litre tank. Complete kit. 2019–2025.', specs: { capacity: '30L', includes: 'Tank + Pump + Lines', pump: 'Continental', standard: 'BS6' } },
    { name: 'Scania R580 Drive Axle Wheel Bearing Kit', brand: 'Scania', part_number: 'SCA-R580-WHL-BRG-127', category_id: C['Wheels & Tyres'], price: 8500, stock: 10, image: IMG.wheel, desc: 'SKF drive axle wheel bearing kit for Scania R-series trucks. Includes inner and outer bearing cones, cups and seals.', specs: { brand: 'SKF', type: 'Tapered Roller', kit: 'Inner + Outer + Seals', axle: 'Drive' } },
    { name: 'Volvo FH16 750 Front Disc Brake Rotor', brand: 'Volvo Trucks', part_number: 'VLV-FH16-BRK-ROT-128', category_id: C['Brake System'], price: 22000, stock: 6, image: IMG.brake, desc: 'Ventilated front disc brake rotor for Volvo FH16 750 super-heavy trucks. 430mm diameter. 2013–2025.', specs: { diameter: '430mm', type: 'Ventilated Disc', material: 'Grey Cast Iron', thickness: '45mm' } },
    { name: 'MAN CLA 25.280 Front Suspension Stabiliser Bar', brand: 'MAN Trucks', part_number: 'MAN-CLA-SUS-STB-129', category_id: C['Suspension & Steering'], price: 8200, stock: 10, image: IMG.suspension, desc: 'Front anti-roll (stabiliser) bar for MAN CLA trucks. 38mm solid bar. Includes mounting brackets and link rods.', specs: { diameter: '38mm', type: 'Solid', includes: 'Brackets + Links', material: 'Spring Steel' } },
    { name: 'BharatBenz 1616 Cabin Air Suspension Bellows', brand: 'BharatBenz', part_number: 'BB-1616-BDY-CAB-130', category_id: C['Body & Cabin Parts'], price: 12000, stock: 8, image: IMG.cabin, desc: 'Cabin air suspension bellow (single) for BharatBenz 1216R/1616R trucks with cab air suspension. Contitech quality.', specs: { type: 'Single Convoluted', maxPressure: '8 bar', height: '250mm' } },
    { name: 'Tata Signa 4923 Windshield Glass (Laminated)', brand: 'Tata Motors', part_number: 'TAT-SGN-BDY-WND-131', category_id: C['Body & Cabin Parts'], price: 22000, stock: 5, image: IMG.cabin, desc: 'Laminated windshield glass for Tata Signa 4923.S/2818 trucks. AS1 safety glass with UV filter. 2016–2025.', specs: { type: 'Laminated AS1', UV: 'UV Protected', acoustic: 'Acoustic PVB', tint: 'Light tint' } },
    { name: 'Ashok Leyland U-Truck LED Light Bar (Front)', brand: 'Ashok Leyland', part_number: 'AL-UTK-BDY-LED-132', category_id: C['Body & Cabin Parts'], price: 6500, stock: 15, image: IMG.headlight, desc: 'LED cab roof light bar for Ashok Leyland U-Truck range. 6 dual-colour LED pods, day-running + work light modes. 2015–2025.', specs: { LEDs: 6, modes: 'DRL + Work', voltage: '24V', IP: 'IP67' } },
    { name: 'Universal Truck Fire Extinguisher 6kg ABC', brand: 'Bosch', part_number: 'UNV-SAF-FEX-133', category_id: C['Safety & Accessories'], price: 1850, stock: 80, image: IMG.seatBelt, desc: '6kg ABC dry powder fire extinguisher for trucks and buses. ISI marked. Meets AIS-139 requirement for Indian trucks. With bracket.', specs: { weight: '6 kg', type: 'ABC Dry Powder', standard: 'IS:2171 ISI', bracket: 'Included' } },
    { name: 'Dash Camera 4K Dual Lens with GPS (Truck Mount)', brand: 'Tata Motors', part_number: 'UNV-SAF-DCM-134', category_id: C['Safety & Accessories'], price: 8500, stock: 40, image: IMG.dashCam, desc: '4K front + 1080P rear dual lens dashcam with GPS tracking, G-sensor and 128GB loop recording. Fits all Indian trucks 12V/24V.', specs: { front: '4K', rear: '1080P', GPS: 'Yes', storage: '128GB max', voltage: '12V/24V' } },
    { name: 'Eicher Pro 3015 Exhaust Pipe + Muffler Kit', brand: 'Eicher', part_number: 'EC-3015-EXH-KIT-135', category_id: C['Exhaust System'], price: 8500, stock: 12, image: IMG.muffler, desc: 'Stainless steel exhaust pipe and muffler kit for Eicher Pro 3015 trucks. Reduces noise to below 82 dB. Direct fit. 2013–2025.', specs: { material: 'SS 409', dB: '< 82 dB', diameter: '90mm', includes: 'Pipe + Muffler + Clamps' } },
    { name: 'Tata 407 Radiator Coolant Hose Set (4 pcs)', brand: 'Tata Motors', part_number: 'TAT-407-COL-HOS-136', category_id: C['Cooling System'], price: 1800, stock: 40, image: IMG.waterPump, desc: 'Set of 4 radiator cooling hoses (upper + lower + bypass + overflow) for Tata 407/407 EX2. EPDM rubber with nylon braid. 2010–2024.', specs: { material: 'EPDM Nylon Braid', pcs: 4, maxTemp: '150°C', includes: 'All critical hoses' } },
    { name: 'Ashok Leyland 2518 Thermostat + Housing', brand: 'Ashok Leyland', part_number: 'AL-2518-COL-THS-137', category_id: C['Cooling System'], price: 1650, stock: 30, image: IMG.waterPump, desc: 'Engine thermostat and housing assembly for Ashok Leyland 2518 with 6-cylinder CRS engine. Opens at 82°C. 2014–2025.', specs: { opens: '82°C', fullOpen: '92°C', includesHousing: true } },
    { name: 'Mahindra Blazo X Common Rail Fuel Pump', brand: 'Mahindra', part_number: 'MH-BLZ-FUL-CRP-138', category_id: C['Fuel System'], price: 32000, stock: 6, image: IMG.fuelPump, desc: 'Bosch CP3 high-pressure common rail fuel pump for Mahindra Blazo X BS6 trucks. 2019–2025 models. Remanufactured.', specs: { brand: 'Bosch CP3', type: 'Common Rail HP Pump', pressure: '1600 bar', remanufactured: true } },
    { name: 'BharatBenz 2523R 150-Litre Diesel Tank', brand: 'BharatBenz', part_number: 'BB-2523-FUL-TNK-139', category_id: C['Fuel System'], price: 18500, stock: 5, image: IMG.fuelTank, desc: 'Aluminium 150-litre diesel fuel tank for BharatBenz 2523R trucks. Includes fuel gauge sender, filler cap and mounting straps.', specs: { capacity: '150L', material: 'Aluminium', gauge: 'Sender included', shape: 'Rectangular' } },
    { name: 'Eicher Pro 6025 AdBlue/DEF Injector + Nozzle', brand: 'Eicher', part_number: 'EC-6025-EXH-ADN-140', category_id: C['Exhaust System'], price: 8500, stock: 12, image: IMG.exhaust, desc: 'AdBlue (DEF) dosing injector and nozzle for Eicher Pro 6025 BS6 SCR system. Continental/Bosch quality. 2019–2025.', specs: { brand: 'Continental', type: 'Dosing Injector', fluid: 'AdBlue/DEF 32.5%', compatibility: 'BS6 SCR' } },

    // More tyres for each brand range
    { name: 'CEAT Milaze X3 Tyre 235/75R17.5 (Truck)', brand: 'Ashok Leyland', part_number: 'CEA-MZX-WHL-TYR-141', category_id: C['Wheels & Tyres'], price: 9500, stock: 20, image: IMG.tyre, desc: 'CEAT Milaze X3 tubeless radial tyre 235/75R17.5 for medium-duty Indian trucks. Suitable for Ashok Leyland Dost/Boss series. Highway pattern.', specs: { size: '235/75R17.5', brand: 'CEAT Milaze X3', type: 'Tubeless Radial', loadIndex: 132 } },
    { name: 'MRF METEOR PLUS Tyre 10.00R20 (All Position)', brand: 'Tata Motors', part_number: 'MRF-MTP-WHL-TYR-142', category_id: C['Wheels & Tyres'], price: 14500, stock: 15, image: IMG.tyre, desc: 'MRF METEOR PLUS 10.00R20 14PR tubeless radial tyre. All-position fitment. Suitable for Tata 1616/2518/3118 series.', specs: { size: '10.00R20', brand: 'MRF METEOR PLUS', plyRating: '14PR', type: 'Tubeless Radial' } },
    { name: 'Apollo Endurace RD Tyre 295/80R22.5', brand: 'BharatBenz', part_number: 'APL-ENR-WHL-TYR-143', category_id: C['Wheels & Tyres'], price: 19500, stock: 10, image: IMG.tyre, desc: 'Apollo Endurace RD 295/80R22.5 drive-axle radial tyre for BharatBenz/Volvo/Scania heavy trucks. Long-haul optimised tread.', specs: { size: '295/80R22.5', brand: 'Apollo Endurace RD', axle: 'Drive', rolling: 'Low Rolling Resistance' } },
    { name: 'JK Tyre RANGER H/T 7.50R16 10PR Tubeless', brand: 'Mahindra', part_number: 'JK-RHT-WHL-TYR-144', category_id: C['Wheels & Tyres'], price: 7800, stock: 20, image: IMG.tyre, desc: 'JK Tyre Ranger H/T 7.50R16 10PR tubeless tyre for Mahindra Furio / SML Isuzu Samrat light trucks. On-off road tread.', specs: { size: '7.50R16', brand: 'JK Ranger H/T', plyRating: '10PR', tread: 'On-Off Road' } },

    // Additional body parts
    { name: 'Tata 407 Cabin Door Hinges Set (4 pcs)', brand: 'Tata Motors', part_number: 'TAT-407-BDY-HNG-145', category_id: C['Body & Cabin Parts'], price: 1200, stock: 50, image: IMG.body, desc: 'Heavy-duty door hinge set (4 pcs) for Tata 407 trucks. Stainless steel with grease nipples. 2010–2024. Universal fit.', specs: { material: 'Stainless Steel', pcs: 4, greaseNipple: true } },
    { name: 'Ashok Leyland Captain Front Bumper (Heavy Duty)', brand: 'Ashok Leyland', part_number: 'AL-CPT-BDY-BMP-146', category_id: C['Body & Cabin Parts'], price: 7800, stock: 10, image: IMG.body, desc: 'Steel front bumper with bull bar for Ashok Leyland Captain 3518. Heavy-duty 5mm steel plate. Fitted with towing hook. 2016–2025.', specs: { material: '5mm MS Steel', protection: 'Bull bar + underguard', finish: 'Primer + paint' } },
    { name: 'Eicher Pro 3015 Cabin Side Panel Set', brand: 'Eicher', part_number: 'EC-3015-BDY-PNL-147', category_id: C['Body & Cabin Parts'], price: 9500, stock: 8, image: IMG.cabin, desc: 'Left and right cabin side panels (fibreglass) for Eicher Pro 3015/2095 trucks. Pre-painted white. 2012–2025.', specs: { material: 'Fibreglass', colour: 'White', pcs: 2, finish: 'Pre-painted' } },

    // More filter items
    { name: 'Truck Spin-On Hydraulic Oil Filter 1"UNF', brand: 'Bosch', part_number: 'UNV-FLT-HYD-148', category_id: C['Filters & Lubrication'], price: 520, stock: 80, image: IMG.oilFilter, desc: 'Hydraulic oil filter for power steering systems on Indian trucks. 1-inch UNF thread spin-on type. Fits most brands.', specs: { thread: '1" UNF', micron: '10µm', type: 'Spin-on', pressure: '345 bar max' } },
    { name: 'SAE 90 Differential / Gearbox Oil 5L', brand: 'Cummins', part_number: 'UNV-OIL-GL5-149', category_id: C['Filters & Lubrication'], price: 950, stock: 100, image: IMG.oilFilter, desc: 'SAE 90 GL-5 mineral gear oil for truck differentials and manual gearboxes. Suitable for all Indian truck brands. 5L can.', specs: { grade: 'SAE 90 GL-5', volume: '5L', standard: 'API GL-5', type: 'Mineral' } },
    { name: 'Anti-Freeze Coolant Concentrate 1L (Blue)', brand: 'Cummins', part_number: 'UNV-COL-AFC-150', category_id: C['Cooling System'], price: 380, stock: 120, image: IMG.radiator, desc: 'Ethylene glycol anti-freeze coolant concentrate (blue). Dilute 1:1 with water for -25°C protection. Suitable for all Indian truck brands.', specs: { type: 'Ethylene Glycol', concentrate: '100% dilute 1:1', protection: '-25°C', volume: '1L' } },
  ];
};

// ─── Main Seed Function ──────────────────────────────────────────────────────
async function seed() {
  console.log('\n🌱 TruckParts Market — Seed Starting…\n');
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Sync tables (safe for dev)
    await sequelize.sync({ alter: true });
    console.log('✅ Tables synced');

    // ── Step 1: Upsert Categories ──────────────────────────────────────────
    console.log('\n📂 Seeding categories…');
    const categoryMap = {};
    for (const cat of CATEGORIES) {
      const [record, created] = await Category.findOrCreate({
        where: { name: cat.name },
        defaults: { description: cat.description, image_url: cat.image_url },
      });
      if (!created) {
        // Update image if missing
        await record.update({ description: cat.description, image_url: cat.image_url });
      }
      categoryMap[cat.name] = record.id;
      console.log(`   ${created ? '✅ Created' : '⟳  Found'} category: ${cat.name} (id=${record.id})`);
    }

    // ── Step 2: Build product list ─────────────────────────────────────────
    const products = buildProducts(categoryMap);
    console.log(`\n🛒 Seeding ${products.length} products…`);

    let created = 0;
    let updated = 0;

    for (const p of products) {
      const [record, wasCreated] = await Product.findOrCreate({
        where: { part_number: p.part_number },
        defaults: {
          name: p.name,
          description: p.desc,
          price: p.price,
          stock_quantity: p.stock,
          category_id: p.category_id,
          seller_id: 1,
          brand: p.brand,
          part_number: p.part_number,
          image_url: p.image,
          specifications: p.specs || {},
          approval_status: 'approved',
          is_approved: true,
        },
      });

      if (wasCreated) {
        created++;
        process.stdout.write('.');
      } else {
        // Update image_url and stock if product already exists
        await record.update({
          image_url: p.image,
          stock_quantity: p.stock,
          price: p.price,
        });
        updated++;
        process.stdout.write('~');
      }
    }

    console.log(`\n\n📊 Results:`);
    console.log(`   ✅ ${created} products created`);
    console.log(`   ⟳  ${updated} products updated (images + price refreshed)`);
    console.log(`   📦 ${products.length} total products processed`);
    console.log(`   📂 ${CATEGORIES.length} categories ready`);

    console.log('\n🚀 Seed complete! Your product catalogue is ready.\n');
  } catch (err) {
    console.error('\n❌ Seed failed:', err.message);
    console.error(err.stack);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

seed();
