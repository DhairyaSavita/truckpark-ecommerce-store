/**
 * seed-10000-products.js
 *
 * Generates ~10,050 approved Indian truck spare-parts products
 * (67 truck models × 150 part templates) across all 12 categories.
 *
 * Strategy:
 *   - 67 TRUCKS  (10 brands, model years 2010-2025)
 *   - 150 PARTS  (30 engine + 15 brake + 15 trans + 15 susp + 15 elec +
 *                  12 body + 10 cool + 10 fuel + 8 exhaust + 8 tyres +
 *                  8 filters + 4 safety)
 *   - Bulk insert in batches of 500 (fast, < 30 s)
 *   - ignoreDuplicates: true – safe to re-run
 *
 * Run:  node seed-10000-products.js
 */

require('dotenv').config();
const { Sequelize, DataTypes, Op } = require('sequelize');

// ─── DB ──────────────────────────────────────────────────────────────────────
const sequelize = new Sequelize(
  process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD,
  { host: process.env.DB_HOST, dialect: 'postgres', logging: false }
);

const Product = sequelize.define('Product', {
  id:             { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name:           { type: DataTypes.STRING,  allowNull: false },
  description:    { type: DataTypes.TEXT,    allowNull: false },
  price:          { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  stock_quantity: { type: DataTypes.INTEGER, defaultValue: 0 },
  category_id:    { type: DataTypes.INTEGER, allowNull: false },
  seller_id:      { type: DataTypes.INTEGER, defaultValue: 1 },
  brand:          { type: DataTypes.STRING },
  part_number:    { type: DataTypes.STRING },
  image_url:      { type: DataTypes.STRING },
  specifications: { type: DataTypes.JSONB, defaultValue: {} },
  approval_status:{ type: DataTypes.STRING, defaultValue: 'approved' },
  is_approved:    { type: DataTypes.BOOLEAN, defaultValue: true },
  rejection_reason: { type: DataTypes.TEXT },
}, { tableName: 'products', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

// ─── Helpers ──────────────────────────────────────────────────────────────────
const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const jitter = (base, pct = 0.25) =>
  Math.round(base * (1 + (Math.random() * 2 - 1) * pct));
const slug = (s) => s.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 4);

// ─── Curated Image Bank (part-type → Unsplash URL) ──────────────────────────
const IMG = {
  piston:      'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&auto=format&fit=crop',
  gasket:      'https://images.unsplash.com/photo-1606577924006-27d39b132ae2?w=600&auto=format&fit=crop',
  crankshaft:  'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600&auto=format&fit=crop',
  camshaft:    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop',
  turbo:       'https://images.unsplash.com/photo-1565793979698-7c72a64ca4d8?w=600&auto=format&fit=crop',
  injector:    'https://images.unsplash.com/photo-1563694983011-6f4d90358083?w=600&auto=format&fit=crop',
  engine:      'https://images.unsplash.com/photo-1581092335871-4e1e5f5f8e6c?w=600&auto=format&fit=crop',
  valves:      'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600&auto=format&fit=crop',
  bearing:     'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop',
  oilpump:     'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=600&auto=format&fit=crop',
  brake:       'https://images.unsplash.com/photo-1600186500707-bdb71becd3e0?w=600&auto=format&fit=crop',
  brakepad:    'https://images.unsplash.com/photo-1491897554428-130a60dd4757?w=600&auto=format&fit=crop',
  brakedrum:   'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop',
  abs:         'https://images.unsplash.com/photo-1600186500707-bdb71becd3e0?w=600&auto=format&fit=crop',
  gearbox:     'https://images.unsplash.com/photo-1617469767611-15c6b7960c2b?w=600&auto=format&fit=crop',
  clutch:      'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600&auto=format&fit=crop',
  propshaft:   'https://images.unsplash.com/photo-1617469767611-15c6b7960c2b?w=600&auto=format&fit=crop',
  differential:'https://images.unsplash.com/photo-1617469767611-15c6b7960c2b?w=600&auto=format&fit=crop',
  leafspring:  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop',
  shockabs:    'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?w=600&auto=format&fit=crop',
  steering:    'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&auto=format&fit=crop',
  ballJoint:   'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop',
  alternator:  'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600&auto=format&fit=crop',
  battery:     'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&auto=format&fit=crop',
  headlight:   'https://images.unsplash.com/photo-1543465077-db45d34b88a5?w=600&auto=format&fit=crop',
  starter:     'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600&auto=format&fit=crop',
  wiring:      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop',
  sensor:      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop',
  body:        'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&auto=format&fit=crop',
  cabin:       'https://images.unsplash.com/photo-1532987748424-e41dc13e6b9b?w=600&auto=format&fit=crop',
  mirror:      'https://images.unsplash.com/photo-1514316454349-750a7fd3da3a?w=600&auto=format&fit=crop',
  radiator:    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop',
  waterpump:   'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop',
  fuelPump:    'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&auto=format&fit=crop',
  fuelTank:    'https://images.unsplash.com/photo-1531491386087-ff55a24dd0cf?w=600&auto=format&fit=crop',
  exhaust:     'https://images.unsplash.com/photo-1567443024551-f3e3cc2be870?w=600&auto=format&fit=crop',
  muffler:     'https://images.unsplash.com/photo-1519167737758-1d2d3a4bf6e5?w=600&auto=format&fit=crop',
  dpf:         'https://images.unsplash.com/photo-1567443024551-f3e3cc2be870?w=600&auto=format&fit=crop',
  tyre:        'https://images.unsplash.com/photo-1567037026759-de13898c29a5?w=600&auto=format&fit=crop',
  wheel:       'https://images.unsplash.com/photo-1566008885218-90abf9200ddb?w=600&auto=format&fit=crop',
  oilFilter:   'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=600&auto=format&fit=crop',
  airFilter:   'https://images.unsplash.com/photo-1608452964553-9b4d97b2752f?w=600&auto=format&fit=crop',
  safety:      'https://images.unsplash.com/photo-1449427283979-e17e0822e272?w=600&auto=format&fit=crop',
  dashcam:     'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop',
};

// ─── Truck Fleet (67 models) ─────────────────────────────────────────────────
// class: mini | light | medium | heavy | super
// priceX: price multiplier relative to base (heavy = 1.0)
const TRUCKS = [
  // TATA MOTORS (10 models)
  { brand: 'Tata Motors', abbr: 'TAT', model: 'Ace Gold',     code: 'ACEG', years: '2013-2025', class: 'mini',   priceX: 0.35 },
  { brand: 'Tata Motors', abbr: 'TAT', model: 'Ace Pro',      code: 'ACEP', years: '2016-2025', class: 'mini',   priceX: 0.35 },
  { brand: 'Tata Motors', abbr: 'TAT', model: '407 EX2',      code: '407E', years: '2010-2025', class: 'light',  priceX: 0.55 },
  { brand: 'Tata Motors', abbr: 'TAT', model: 'Ultra 1018',   code: 'U018', years: '2014-2025', class: 'light',  priceX: 0.60 },
  { brand: 'Tata Motors', abbr: 'TAT', model: '1109 LPT',     code: '109L', years: '2010-2022', class: 'medium', priceX: 0.75 },
  { brand: 'Tata Motors', abbr: 'TAT', model: '1616 LPT',     code: '616L', years: '2010-2025', class: 'medium', priceX: 0.85 },
  { brand: 'Tata Motors', abbr: 'TAT', model: 'LPT 2518',     code: '518L', years: '2012-2025', class: 'heavy',  priceX: 1.00 },
  { brand: 'Tata Motors', abbr: 'TAT', model: 'Signa 1923.K', code: 'S923', years: '2016-2025', class: 'heavy',  priceX: 1.10 },
  { brand: 'Tata Motors', abbr: 'TAT', model: 'Signa 2818.T', code: 'S818', years: '2016-2025', class: 'heavy',  priceX: 1.15 },
  { brand: 'Tata Motors', abbr: 'TAT', model: 'Prima 4928.S', code: 'P928', years: '2013-2025', class: 'super',  priceX: 1.60 },

  // ASHOK LEYLAND (9 models)
  { brand: 'Ashok Leyland', abbr: 'AL', model: 'Dost',          code: 'DST', years: '2011-2025', class: 'light',  priceX: 0.50 },
  { brand: 'Ashok Leyland', abbr: 'AL', model: 'Dost+',         code: 'DSP', years: '2018-2025', class: 'light',  priceX: 0.55 },
  { brand: 'Ashok Leyland', abbr: 'AL', model: 'Boss 1614',     code: 'B614', years:'2014-2025', class: 'medium', priceX: 0.80 },
  { brand: 'Ashok Leyland', abbr: 'AL', model: 'U-Truck 1414',  code: 'U414', years:'2010-2020', class: 'medium', priceX: 0.75 },
  { brand: 'Ashok Leyland', abbr: 'AL', model: 'U-Truck 1616',  code: 'U616', years:'2010-2024', class: 'medium', priceX: 0.85 },
  { brand: 'Ashok Leyland', abbr: 'AL', model: '2518 IL',       code: '2518', years:'2012-2025', class: 'heavy',  priceX: 1.00 },
  { brand: 'Ashok Leyland', abbr: 'AL', model: '3116 IL',       code: '3116', years:'2014-2025', class: 'heavy',  priceX: 1.05 },
  { brand: 'Ashok Leyland', abbr: 'AL', model: 'Captain 3518',  code: 'C518', years:'2016-2025', class: 'super',  priceX: 1.40 },
  { brand: 'Ashok Leyland', abbr: 'AL', model: 'Captain 4018',  code: 'C418', years:'2018-2025', class: 'super',  priceX: 1.55 },

  // MAHINDRA (8 models)
  { brand: 'Mahindra', abbr: 'MH', model: 'Jeeto L33',       code: 'JL33', years: '2015-2025', class: 'mini',   priceX: 0.30 },
  { brand: 'Mahindra', abbr: 'MH', model: 'Supro Profit',    code: 'SUPR', years: '2016-2025', class: 'mini',   priceX: 0.32 },
  { brand: 'Mahindra', abbr: 'MH', model: 'Big Bolero Pkp',  code: 'BBOL', years: '2018-2025', class: 'light',  priceX: 0.55 },
  { brand: 'Mahindra', abbr: 'MH', model: 'Furio 7',         code: 'FUR7', years: '2018-2025', class: 'light',  priceX: 0.60 },
  { brand: 'Mahindra', abbr: 'MH', model: 'Furio 14',        code: 'F14',  years: '2018-2025', class: 'medium', priceX: 0.80 },
  { brand: 'Mahindra', abbr: 'MH', model: 'Blazo 25',        code: 'BL25', years: '2016-2025', class: 'heavy',  priceX: 0.95 },
  { brand: 'Mahindra', abbr: 'MH', model: 'Blazo X 35',      code: 'BX35', years: '2018-2025', class: 'heavy',  priceX: 1.05 },
  { brand: 'Mahindra', abbr: 'MH', model: 'Blazo X 40',      code: 'BX40', years: '2019-2025', class: 'super',  priceX: 1.35 },

  // BHARATBENZ (8 models)
  { brand: 'BharatBenz', abbr: 'BB', model: '914R',   code: '914R', years: '2012-2025', class: 'light',  priceX: 0.65 },
  { brand: 'BharatBenz', abbr: 'BB', model: '1014R',  code: '14R',  years: '2015-2025', class: 'medium', priceX: 0.80 },
  { brand: 'BharatBenz', abbr: 'BB', model: '1214R',  code: '14R2', years: '2013-2025', class: 'medium', priceX: 0.90 },
  { brand: 'BharatBenz', abbr: 'BB', model: '1216R',  code: '16R',  years: '2013-2025', class: 'medium', priceX: 0.90 },
  { brand: 'BharatBenz', abbr: 'BB', model: '1617R',  code: '17R',  years: '2014-2025', class: 'heavy',  priceX: 1.05 },
  { brand: 'BharatBenz', abbr: 'BB', model: '1623R',  code: '23R',  years: '2013-2025', class: 'heavy',  priceX: 1.10 },
  { brand: 'BharatBenz', abbr: 'BB', model: '2523R',  code: '25R',  years: '2014-2025', class: 'super',  priceX: 1.45 },
  { brand: 'BharatBenz', abbr: 'BB', model: '3143S',  code: '43S',  years: '2016-2025', class: 'super',  priceX: 1.80 },

  // EICHER (8 models)
  { brand: 'Eicher', abbr: 'EC', model: 'Pro 1049',      code: 'P049', years: '2010-2025', class: 'light',  priceX: 0.55 },
  { brand: 'Eicher', abbr: 'EC', model: 'Pro 1059 CNG',  code: 'P059', years: '2015-2025', class: 'light',  priceX: 0.58 },
  { brand: 'Eicher', abbr: 'EC', model: 'Pro 2095 XP',   code: 'P095', years: '2012-2025', class: 'medium', priceX: 0.80 },
  { brand: 'Eicher', abbr: 'EC', model: 'Pro 3015',      code: 'P015', years: '2013-2025', class: 'medium', priceX: 0.85 },
  { brand: 'Eicher', abbr: 'EC', model: 'Pro 3015 XP',   code: 'P15X', years: '2016-2025', class: 'medium', priceX: 0.90 },
  { brand: 'Eicher', abbr: 'EC', model: 'Pro 6025',      code: 'P625', years: '2015-2025', class: 'heavy',  priceX: 1.10 },
  { brand: 'Eicher', abbr: 'EC', model: 'Pro 6025 XP',   code: 'P62X', years: '2017-2025', class: 'heavy',  priceX: 1.20 },
  { brand: 'Eicher', abbr: 'EC', model: 'Pro 8031 XP',   code: 'P831', years: '2018-2025', class: 'super',  priceX: 1.70 },

  // FORCE MOTORS (5 models)
  { brand: 'Force Motors', abbr: 'FM', model: 'Traveller 3350',   code: 'T350', years: '2010-2025', class: 'mini',   priceX: 0.40 },
  { brand: 'Force Motors', abbr: 'FM', model: 'Traveller 3700',   code: 'T700', years: '2012-2025', class: 'light',  priceX: 0.50 },
  { brand: 'Force Motors', abbr: 'FM', model: 'Trax Cruiser',     code: 'TRAX', years: '2013-2024', class: 'light',  priceX: 0.52 },
  { brand: 'Force Motors', abbr: 'FM', model: 'Citiline',         code: 'CTL',  years: '2015-2024', class: 'medium', priceX: 0.70 },
  { brand: 'Force Motors', abbr: 'FM', model: 'Kargo King',       code: 'KKG',  years: '2010-2024', class: 'medium', priceX: 0.72 },

  // SML ISUZU (5 models)
  { brand: 'SML Isuzu', abbr: 'SI', model: 'Samrat GS',     code: 'SGS', years: '2012-2024', class: 'light',  priceX: 0.58 },
  { brand: 'SML Isuzu', abbr: 'SI', model: 'Samrat GX',     code: 'SGX', years: '2016-2024', class: 'medium', priceX: 0.78 },
  { brand: 'SML Isuzu', abbr: 'SI', model: 'Sartaj CG',     code: 'SCG', years: '2013-2024', class: 'medium', priceX: 0.80 },
  { brand: 'SML Isuzu', abbr: 'SI', model: 'Sartaj Max GS', code: 'SMX', years: '2017-2024', class: 'medium', priceX: 0.85 },
  { brand: 'SML Isuzu', abbr: 'SI', model: 'S7',            code: 'SS7', years: '2018-2024', class: 'heavy',  priceX: 1.00 },

  // MAN TRUCKS (5 models)
  { brand: 'MAN Trucks', abbr: 'MAN', model: 'CLA 25.280',    code: 'C280', years: '2010-2025', class: 'heavy',  priceX: 1.60 },
  { brand: 'MAN Trucks', abbr: 'MAN', model: 'CLA 40.280',    code: 'C402', years: '2012-2025', class: 'super',  priceX: 1.90 },
  { brand: 'MAN Trucks', abbr: 'MAN', model: 'TGS 28.480',    code: 'T480', years: '2014-2025', class: 'super',  priceX: 2.20 },
  { brand: 'MAN Trucks', abbr: 'MAN', model: 'TGA 26.480',    code: 'T426', years: '2010-2020', class: 'super',  priceX: 2.10 },
  { brand: 'MAN Trucks', abbr: 'MAN', model: 'TGS 35.480',    code: 'T354', years: '2016-2025', class: 'super',  priceX: 2.30 },

  // VOLVO TRUCKS (5 models)
  { brand: 'Volvo Trucks', abbr: 'VLV', model: 'FH 420',     code: 'F420', years: '2012-2025', class: 'super',  priceX: 2.40 },
  { brand: 'Volvo Trucks', abbr: 'VLV', model: 'FH 460',     code: 'F460', years: '2014-2025', class: 'super',  priceX: 2.50 },
  { brand: 'Volvo Trucks', abbr: 'VLV', model: 'FM 370',     code: 'FM37', years: '2010-2025', class: 'heavy',  priceX: 1.90 },
  { brand: 'Volvo Trucks', abbr: 'VLV', model: 'FM 430',     code: 'FM43', years: '2013-2025', class: 'heavy',  priceX: 2.00 },
  { brand: 'Volvo Trucks', abbr: 'VLV', model: 'FMX 460',    code: 'FMX4', years: '2013-2025', class: 'super',  priceX: 2.60 },

  // SCANIA (5 models)
  { brand: 'Scania', abbr: 'SCA', model: 'P 360',    code: 'P360', years: '2010-2025', class: 'heavy',  priceX: 1.80 },
  { brand: 'Scania', abbr: 'SCA', model: 'G 410',    code: 'G410', years: '2012-2025', class: 'heavy',  priceX: 2.00 },
  { brand: 'Scania', abbr: 'SCA', model: 'R 410',    code: 'R410', years: '2013-2025', class: 'super',  priceX: 2.20 },
  { brand: 'Scania', abbr: 'SCA', model: 'R 450',    code: 'R450', years: '2015-2025', class: 'super',  priceX: 2.30 },
  { brand: 'Scania', abbr: 'SCA', model: 'R 480 XPI',code: 'R480', years: '2016-2025', class: 'super',  priceX: 2.50 },
];

// ─── Part Templates (150 total) ──────────────────────────────────────────────
// catId refers to actual DB category IDs from migration
// basePrice is for a 'heavy' class truck; scaled by truck.priceX
const PARTS = [

  // ═══ ENGINE PARTS (catId=1) — 30 parts ═══════════════════════════════════
  { code:'ENG01', catId:1, img:IMG.piston,
    name: (b,m,y) => `${b} ${m} Engine Piston Set (${y})`,
    desc: (b,m,y) => `OEM-grade forged aluminium piston set for ${b} ${m} diesel engine (${y}). Includes piston rings and circlips. Sized for standard bore.`,
    basePrice: 5200, specs: { material:'Forged Aluminium', warranty:'12 months', type:'Std bore' } },

  { code:'ENG02', catId:1, img:IMG.gasket,
    name: (b,m,y) => `${b} ${m} Cylinder Head Gasket MLS (${y})`,
    desc: (b,m,y) => `Multi-layer steel cylinder head gasket for ${b} ${m} (${y}). High-compression sealing, BS4/BS6 compatible.`,
    basePrice: 3200, specs: { type:'MLS 3-layer', material:'Stainless Steel', BS:'BS4/BS6' } },

  { code:'ENG03', catId:1, img:IMG.crankshaft,
    name: (b,m,y) => `${b} ${m} Crankshaft Assembly (${y})`,
    desc: (b,m,y) => `Forged steel crankshaft for ${b} ${m} (${y}). Precision-ground main and rod journals. Factory balanced.`,
    basePrice: 32000, specs: { material:'Forged Steel', balanced:true, journals:'Ground' } },

  { code:'ENG04', catId:1, img:IMG.camshaft,
    name: (b,m,y) => `${b} ${m} Camshaft Assembly (${y})`,
    desc: (b,m,y) => `Induction-hardened camshaft for ${b} ${m} diesel engine (${y}). Cast iron with nitrided lobes for extended service life.`,
    basePrice: 13500, specs: { material:'Cast Iron', lobes:'Nitrided', process:'Induction Hardened' } },

  { code:'ENG05', catId:1, img:IMG.turbo,
    name: (b,m,y) => `${b} ${m} Turbocharger Assembly (${y})`,
    desc: (b,m,y) => `Replacement turbocharger for ${b} ${m} (${y}). Balanced rotating assembly, oil/water cooled bearing housing.`,
    basePrice: 19500, specs: { type:'Fixed Geometry', cooling:'Oil + Water', balanced:true } },

  { code:'ENG06', catId:1, img:IMG.injector,
    name: (b,m,y) => `${b} ${m} Diesel Fuel Injector (${y})`,
    desc: (b,m,y) => `Common-rail diesel injector for ${b} ${m} (${y}). Bosch/Denso equivalent. Precision-calibrated flow rate.`,
    basePrice: 8500, specs: { type:'CRS Solenoid', pressure:'1600 bar', sold:'Each' } },

  { code:'ENG07', catId:1, img:IMG.valves,
    name: (b,m,y) => `${b} ${m} Engine Valve Set Intake + Exhaust (${y})`,
    desc: (b,m,y) => `Complete valve set for ${b} ${m} (${y}). Nitrided steel intake valves + Stellite-tipped exhaust valves.`,
    basePrice: 3600, specs: { intake:'Nitrided Steel', exhaust:'Stellite Tipped', per:'Per cylinder' } },

  { code:'ENG08', catId:1, img:IMG.bearing,
    name: (b,m,y) => `${b} ${m} Main Bearing Set (${y})`,
    desc: (b,m,y) => `Full set of main and rod bearings for ${b} ${m} engine (${y}). Tri-metal construction: steel-bronze-lead tin overlay.`,
    basePrice: 4800, specs: { type:'Tri-metal', material:'Steel/Bronze/Lead-Tin', std:'OEM' } },

  { code:'ENG09', catId:1, img:IMG.oilpump,
    name: (b,m,y) => `${b} ${m} Engine Oil Pump (${y})`,
    desc: (b,m,y) => `Gear-type engine oil pump for ${b} ${m} (${y}). Cast iron housing with replaceable gears. Maintains full pressure at low RPM.`,
    basePrice: 6500, specs: { type:'Gear Pump', material:'Cast Iron', pressureRelief:'Integrated' } },

  { code:'ENG10', catId:1, img:IMG.engine,
    name: (b,m,y) => `${b} ${m} Cylinder Liner Set (${y})`,
    desc: (b,m,y) => `Wet-type cylinder liner set for ${b} ${m} (${y}). Centrifugally cast with plateau-honed bore surface finish.`,
    basePrice: 7200, specs: { type:'Wet Liner', surface:'Plateau Honed', material:'Cast Iron' } },

  { code:'ENG11', catId:1, img:IMG.gasket,
    name: (b,m,y) => `${b} ${m} Full Engine Gasket Set (${y})`,
    desc: (b,m,y) => `Complete engine gasket set for ${b} ${m} (${y}). Over 80 pieces including head, sump, timing cover and all seals.`,
    basePrice: 8900, specs: { pieces:'80+', includes:'Head to Sump + Seals' } },

  { code:'ENG12', catId:1, img:IMG.turbo,
    name: (b,m,y) => `${b} ${m} Intercooler Air-to-Air (${y})`,
    desc: (b,m,y) => `Bar-and-plate aluminium intercooler for ${b} ${m} (${y}). Reduces intake air temperature by up to 60°C for better combustion efficiency.`,
    basePrice: 12000, specs: { type:'Bar-and-Plate Al', ΔT:'60°C max', efficiency:'78%' } },

  { code:'ENG13', catId:1, img:IMG.piston,
    name: (b,m,y) => `${b} ${m} Piston Ring Set STD (${y})`,
    desc: (b,m,y) => `Standard-size piston ring set for ${b} ${m} (${y}). Chrome-plated top compression ring, nitrided second ring, oil scraper ring.`,
    basePrice: 2800, specs: { top:'Chrome Plated', second:'Nitrided', oil:'3-piece scraper' } },

  { code:'ENG14', catId:1, img:IMG.engine,
    name: (b,m,y) => `${b} ${m} Timing Chain Kit Complete (${y})`,
    desc: (b,m,y) => `Timing chain kit for ${b} ${m} (${y}). Includes chain, tensioner, sprockets and guide rails.`,
    basePrice: 5500, specs: { includes:'Chain+Tensioner+Sprockets+Guides', material:'Chromoly' } },

  { code:'ENG15', catId:1, img:IMG.valves,
    name: (b,m,y) => `${b} ${m} Valve Stem Seal Set (${y})`,
    desc: (b,m,y) => `Silicone/PTFE valve stem seals for ${b} ${m} (${y}). Prevents oil burning and reduces emissions.`,
    basePrice: 1200, specs: { material:'PTFE + FKM', type:'Spring-loaded', sold:'Per engine set' } },

  { code:'ENG16', catId:1, img:IMG.oilpump,
    name: (b,m,y) => `${b} ${m} Engine Sump with Gasket (${y})`,
    desc: (b,m,y) => `Steel engine oil sump and gasket for ${b} ${m} (${y}). Powder-coated finish. With integrated baffles for oil control.`,
    basePrice: 5800, specs: { material:'MS Steel', finish:'Powder Coat', baffles:'Yes' } },

  { code:'ENG17', catId:1, img:IMG.engine,
    name: (b,m,y) => `${b} ${m} Engine Mount Set Front + Rear (${y})`,
    desc: (b,m,y) => `Rubber-bonded engine mounting set for ${b} ${m} (${y}). Reduces vibration transfer to chassis.`,
    basePrice: 3200, specs: { type:'Rubber-bonded', positions:'Front+Rear', set:'4 pcs' } },

  { code:'ENG18', catId:1, img:IMG.camshaft,
    name: (b,m,y) => `${b} ${m} Rocker Arm Assembly (${y})`,
    desc: (b,m,y) => `Complete rocker arm assembly with shaft and pedestals for ${b} ${m} (${y}). Investment cast steel.`,
    basePrice: 8500, specs: { material:'Cast Steel', includes:'Shaft+Arms+Pedestals' } },

  { code:'ENG19', catId:1, img:IMG.bearing,
    name: (b,m,y) => `${b} ${m} Conrod (Connecting Rod) Assembly (${y})`,
    desc: (b,m,y) => `High-strength connecting rod for ${b} ${m} diesel engine (${y}). Forged H-beam design. OEM standard.`,
    basePrice: 9800, specs: { type:'H-Beam Forged', boltTorque:'OEM spec', sold:'Each' } },

  { code:'ENG20', catId:1, img:IMG.turbo,
    name: (b,m,y) => `${b} ${m} Turbo Oil Feed + Return Lines (${y})`,
    desc: (b,m,y) => `Braided stainless-steel turbocharger oil feed and return line kit for ${b} ${m} (${y}). High-pressure rated.`,
    basePrice: 2400, specs: { material:'Braided SS', ratedPressure:'25 bar', kit:'Feed + Return' } },

  { code:'ENG21', catId:1, img:IMG.engine,
    name: (b,m,y) => `${b} ${m} EGR Valve + Cooler Assembly (${y})`,
    desc: (b,m,y) => `Exhaust Gas Recirculation (EGR) valve and cooler for ${b} ${m} BS4/BS6 (${y}). Reduces NOx emissions.`,
    basePrice: 15000, specs: { standard:'BS4/BS6', type:'Cooled EGR', actuator:'Pneumatic' } },

  { code:'ENG22', catId:1, img:IMG.injector,
    name: (b,m,y) => `${b} ${m} High-Pressure Fuel Rail (${y})`,
    desc: (b,m,y) => `Common-rail fuel distribution rail for ${b} ${m} (${y}). Forged steel. With integrated pressure sensor port.`,
    basePrice: 12500, specs: { material:'Forged Steel', pressure:'1800 bar', sensor:'Port integrated' } },

  { code:'ENG23', catId:1, img:IMG.engine,
    name: (b,m,y) => `${b} ${m} Cylinder Head Assembly (Recond.) (${y})`,
    desc: (b,m,y) => `Reconditioned cylinder head for ${b} ${m} (${y}). Pressure-tested, valve ground, resurfaced. Ready to install.`,
    basePrice: 45000, specs: { condition:'Reconditioned', tested:'Pressure tested', surface:'Resurfaced' } },

  { code:'ENG24', catId:1, img:IMG.engine,
    name: (b,m,y) => `${b} ${m} Air Filter Housing Assembly (${y})`,
    desc: (b,m,y) => `Plastic/GRP air filter housing for ${b} ${m} (${y}). Includes primary and safety filter element.`,
    basePrice: 3800, specs: { material:'GRP Fibreglass', type:'Radial Seal', includes:'Primary+Safety' } },

  { code:'ENG25', catId:1, img:IMG.camshaft,
    name: (b,m,y) => `${b} ${m} VGT Turbo Actuator (${y})`,
    desc: (b,m,y) => `Variable Geometry Turbo actuator (electric/pneumatic) for ${b} ${m} BS6 (${y}). Compatible with OEM ECU.`,
    basePrice: 14500, specs: { type:'VGT Electronic', voltage:'24V', BS:'BS6' } },

  { code:'ENG26', catId:1, img:IMG.oilpump,
    name: (b,m,y) => `${b} ${m} Power Steering Reservoir + Pump (${y})`,
    desc: (b,m,y) => `Hydraulic power steering pump with reservoir for ${b} ${m} (${y}). Flow rate 14 L/min.`,
    basePrice: 9500, specs: { flow:'14 L/min', pressure:'145 bar', includes:'Pump+Reservoir' } },

  { code:'ENG27', catId:1, img:IMG.engine,
    name: (b,m,y) => `${b} ${m} Engine Rebuild Kit Complete (${y})`,
    desc: (b,m,y) => `Complete engine rebuild kit for ${b} ${m} (${y}). Pistons, rings, bearings, gaskets and all seals.`,
    basePrice: 88000, specs: { includes:'Pistons+Rings+Bearings+Gaskets+Seals', qty:'250+ pieces' } },

  { code:'ENG28', catId:1, img:IMG.valves,
    name: (b,m,y) => `${b} ${m} Swirl Control Valve / Intake Manifold (${y})`,
    desc: (b,m,y) => `Intake swirl control valve / manifold for ${b} ${m} BS6 (${y}). Aluminium casting. Improves low-RPM torque.`,
    basePrice: 8200, specs: { material:'Aluminium', function:'Swirl Control', BS:'BS6' } },

  { code:'ENG29', catId:1, img:IMG.injector,
    name: (b,m,y) => `${b} ${m} Glow Plug Set (${y})`,
    desc: (b,m,y) => `Ceramic glow plugs for cold starting of ${b} ${m} diesel engine (${y}). 2-second heat-up. Set of 4 or 6.`,
    basePrice: 3200, specs: { type:'Ceramic Sheath', heatUp:'2 seconds', voltage:'12/24V' } },

  { code:'ENG30', catId:1, img:IMG.engine,
    name: (b,m,y) => `${b} ${m} Engine Air-Oil Separator (${y})`,
    desc: (b,m,y) => `Crankcase ventilation air-oil separator for ${b} ${m} BS6 (${y}). Reduces oil consumption and emissions.`,
    basePrice: 4500, specs: { type:'Coalescing', efficiency:'99.9% oil removal', BS:'BS6' } },

  // ═══ BRAKE SYSTEM (catId=3) — 15 parts ═══════════════════════════════════
  { code:'BRK01', catId:3, img:IMG.brake,
    name: (b,m,y) => `${b} ${m} Front Brake Drum Set (${y})`,
    desc: (b,m,y) => `Cast iron front brake drum for ${b} ${m} (${y}). High-carbon SG iron. Balanced for smooth braking.`,
    basePrice: 4200, specs: { material:'SG Cast Iron', balanced:true, position:'Front' } },

  { code:'BRK02', catId:3, img:IMG.brakedrum,
    name: (b,m,y) => `${b} ${m} Rear Brake Drum Set (${y})`,
    desc: (b,m,y) => `Heavy-duty rear brake drum for ${b} ${m} (${y}). Extra wall thickness for heavy-load applications.`,
    basePrice: 5500, specs: { material:'High Carbon Cast Iron', wallThickness:'+2mm', position:'Rear' } },

  { code:'BRK03', catId:3, img:IMG.brakepad,
    name: (b,m,y) => `${b} ${m} Brake Shoe + Lining Set (${y})`,
    desc: (b,m,y) => `Asbestos-free brake shoe and lining set for ${b} ${m} (${y}). Consistent coefficient of friction.`,
    basePrice: 2800, specs: { material:'Non-asbestos Organic', friction:'F-coefficient', pcs:4 } },

  { code:'BRK04', catId:3, img:IMG.brake,
    name: (b,m,y) => `${b} ${m} Brake Master Cylinder (${y})`,
    desc: (b,m,y) => `Hydraulic brake master cylinder for ${b} ${m} (${y}). Aluminium alloy body with integrated reservoir.`,
    basePrice: 2500, specs: { bore:'25.4mm', material:'Aluminium', reservoir:'Integrated' } },

  { code:'BRK05', catId:3, img:IMG.brake,
    name: (b,m,y) => `${b} ${m} Brake Wheel Cylinder Set (${y})`,
    desc: (b,m,y) => `Wheel cylinder set (4 pcs) for ${b} ${m} (${y}). Cast iron body, rubber seal kit included.`,
    basePrice: 1800, specs: { pcs:4, body:'Cast Iron', seals:'NBR rubber kit included' } },

  { code:'BRK06', catId:3, img:IMG.abs,
    name: (b,m,y) => `${b} ${m} ABS Wheel Speed Sensor Set (${y})`,
    desc: (b,m,y) => `Hall-effect ABS wheel speed sensors (4 pcs) for ${b} ${m} (${y}). All-wheel set. Plug-and-play OEM replacement.`,
    basePrice: 6200, specs: { type:'Hall Effect Active', voltage:'12-24V', pcs:4 } },

  { code:'BRK07', catId:3, img:IMG.brake,
    name: (b,m,y) => `${b} ${m} Air Brake Compressor (${y})`,
    desc: (b,m,y) => `2-cylinder air brake compressor for ${b} ${m} heavy trucks (${y}). Direct drive, oil and water cooled.`,
    basePrice: 16500, specs: { cylinders:2, cooling:'Water+Oil', maxPressure:'12.5 bar' } },

  { code:'BRK08', catId:3, img:IMG.brake,
    name: (b,m,y) => `${b} ${m} Air Dryer + Pressure Governor (${y})`,
    desc: (b,m,y) => `Knorr-Bremse/WABCO-equivalent air dryer for ${b} ${m} (${y}). Desiccant cartridge, integrated governor valve.`,
    basePrice: 14000, specs: { type:'Desiccant Cartridge', governor:'Integrated 12.5 bar', voltage:'24V' } },

  { code:'BRK09', catId:3, img:IMG.brake,
    name: (b,m,y) => `${b} ${m} Spring Brake Chamber (${y})`,
    desc: (b,m,y) => `Combination service/spring brake chamber (piggyback) for ${b} ${m} (${y}). Type 20/24 or 24/24.`,
    basePrice: 8500, specs: { type:'Combination Spring/Service', std:'WABCO equivalent' } },

  { code:'BRK10', catId:3, img:IMG.brakedrum,
    name: (b,m,y) => `${b} ${m} Disc Brake Rotor Front (${y})`,
    desc: (b,m,y) => `Ventilated front disc brake rotor for ${b} ${m} (${y}). Grey cast iron, balanced to < 5g runout.`,
    basePrice: 9500, specs: { type:'Ventilated', material:'Grey Cast Iron', runout:'< 0.05mm' } },

  { code:'BRK11', catId:3, img:IMG.brakepad,
    name: (b,m,y) => `${b} ${m} Disc Brake Pad Set (${y})`,
    desc: (b,m,y) => `Low-metallic disc brake pads for ${b} ${m} (${y}). ECE R90 certified. Low dust, low noise formulation.`,
    basePrice: 3200, specs: { type:'Low Metallic', certified:'ECE R90', pcs:4 } },

  { code:'BRK12', catId:3, img:IMG.abs,
    name: (b,m,y) => `${b} ${m} Brake Slack Adjuster Auto (${y})`,
    desc: (b,m,y) => `Automatic brake slack adjuster for ${b} ${m} drum brakes (${y}). Maintains optimal brake lining clearance.`,
    basePrice: 3500, specs: { type:'Automatic', arm:'150mm', rotation:'Clockwise' } },

  { code:'BRK13', catId:3, img:IMG.brake,
    name: (b,m,y) => `${b} ${m} Air Reservoir Tank 30L (${y})`,
    desc: (b,m,y) => `30-litre steel air reservoir tank for ${b} ${m} brake circuit (${y}). Zinc-coated. With drain valve.`,
    basePrice: 4200, specs: { capacity:'30L', material:'Zinc-coated Steel', pressure:'13 bar' } },

  { code:'BRK14', catId:3, img:IMG.brake,
    name: (b,m,y) => `${b} ${m} Brake Booster / Servo (${y})`,
    desc: (b,m,y) => `Vacuum or air-assisted brake booster for ${b} ${m} (${y}). Increases pedal force by 3:1 ratio.`,
    basePrice: 7500, specs: { boost:'3:1 ratio', type:'Vacuum/Air', diaphragm:'Dual' } },

  { code:'BRK15', catId:3, img:IMG.brake,
    name: (b,m,y) => `${b} ${m} Brake Drum Brake Lining Roll (${y})`,
    desc: (b,m,y) => `Woven brake lining roll (1 metre) for ${b} ${m} (${y}). Riveted type, asbestos-free. Suitable for rebonding.`,
    basePrice: 1400, specs: { length:'1 metre', type:'Woven Non-asbestos', method:'Riveted' } },

  // ═══ TRANSMISSION & CLUTCH (catId=11) — 15 parts ═══════════════════════
  { code:'TRN01', catId:11, img:IMG.gearbox,
    name: (b,m,y) => `${b} ${m} Manual Gearbox Assembly (${y})`,
    desc: (b,m,y) => `Full synchromesh manual gearbox for ${b} ${m} (${y}). Remanufactured. All gears and bearings replaced.`,
    basePrice: 72000, specs: { type:'Synchromesh', condition:'Remanufactured', warranty:'6 months' } },

  { code:'TRN02', catId:11, img:IMG.clutch,
    name: (b,m,y) => `${b} ${m} Clutch Disc (${y})`,
    desc: (b,m,y) => `Single dry clutch disc for ${b} ${m} (${y}). Organic friction lining. Rubber-damped hub for smooth engagement.`,
    basePrice: 4200, specs: { type:'Single Dry Organic', hub:'Rubber Damped', sold:'Each' } },

  { code:'TRN03', catId:11, img:IMG.clutch,
    name: (b,m,y) => `${b} ${m} Clutch Pressure Plate (${y})`,
    desc: (b,m,y) => `Diaphragm-spring clutch pressure plate for ${b} ${m} (${y}). Enhanced clamping force vs OEM +15%.`,
    basePrice: 5800, specs: { spring:'Diaphragm', clampForce:'+15% vs OEM', material:'Cast Iron' } },

  { code:'TRN04', catId:11, img:IMG.clutch,
    name: (b,m,y) => `${b} ${m} Clutch Release Bearing (${y})`,
    desc: (b,m,y) => `Clutch release (throw-out) bearing for ${b} ${m} (${y}). Self-centring, grease-sealed for life.`,
    basePrice: 1400, specs: { type:'Self-centring', lubrication:'Sealed for life', ID:'38mm' } },

  { code:'TRN05', catId:11, img:IMG.clutch,
    name: (b,m,y) => `${b} ${m} Complete Clutch Kit (Disc+PP+Brg) (${y})`,
    desc: (b,m,y) => `Complete 3-piece clutch kit for ${b} ${m} (${y}): disc, pressure plate and release bearing.`,
    basePrice: 9800, specs: { pieces:3, includes:'Disc+Pressure Plate+Release Bearing' } },

  { code:'TRN06', catId:11, img:IMG.gearbox,
    name: (b,m,y) => `${b} ${m} Gearbox Input Shaft (${y})`,
    desc: (b,m,y) => `Gearbox input (primary) shaft for ${b} ${m} (${y}). Case-hardened alloy steel with splines.`,
    basePrice: 8500, specs: { material:'Alloy Steel Case-hardened', splines:'Involute' } },

  { code:'TRN07', catId:11, img:IMG.gearbox,
    name: (b,m,y) => `${b} ${m} Gearbox Output Shaft (${y})`,
    desc: (b,m,y) => `Gearbox output (main/secondary) shaft for ${b} ${m} (${y}). Drop-forged steel with ground journals.`,
    basePrice: 9800, specs: { material:'Drop-forged Steel', bearingJournals:'Ground' } },

  { code:'TRN08', catId:11, img:IMG.gearbox,
    name: (b,m,y) => `${b} ${m} Gearbox Synchromesh Ring Set (${y})`,
    desc: (b,m,y) => `Brass synchromesh ring set for ${b} ${m} (${y}). All gears. Restores smooth gear changes.`,
    basePrice: 8000, specs: { material:'Brass Alloy', set:'All gears', application:'All synchros' } },

  { code:'TRN09', catId:11, img:IMG.propshaft,
    name: (b,m,y) => `${b} ${m} Propeller Shaft Assembly (${y})`,
    desc: (b,m,y) => `Steel propeller shaft with universal joints for ${b} ${m} (${y}). Balanced, ready to install.`,
    basePrice: 18500, specs: { material:'Seamless Steel', UJs:2, balanced:true } },

  { code:'TRN10', catId:11, img:IMG.propshaft,
    name: (b,m,y) => `${b} ${m} Universal Joint (UJ) Cross Kit (${y})`,
    desc: (b,m,y) => `Spider and bearing cup universal joint kit for ${b} ${m} propeller shaft (${y}). Grease-sealed design.`,
    basePrice: 2400, specs: { type:'Spider + Bearing Cups', sealed:'Grease-sealed', spiderDia:'47mm' } },

  { code:'TRN11', catId:11, img:IMG.differential,
    name: (b,m,y) => `${b} ${m} Rear Differential Assembly (${y})`,
    desc: (b,m,y) => `Rear axle differential assembly for ${b} ${m} (${y}). Spiral bevel gears. Ratio specific to model.`,
    basePrice: 135000, specs: { type:'Spiral Bevel', LSD:'Optional', condition:'Rebuilt' } },

  { code:'TRN12', catId:11, img:IMG.differential,
    name: (b,m,y) => `${b} ${m} Axle Half Shaft (${y})`,
    desc: (b,m,y) => `Full-floating rear axle half shaft for ${b} ${m} (${y}). Forged alloy steel, induction hardened splines.`,
    basePrice: 8500, specs: { type:'Full Floating', material:'Forged Alloy Steel', splines:'Inducton Hardened' } },

  { code:'TRN13', catId:11, img:IMG.gearbox,
    name: (b,m,y) => `${b} ${m} Gearshift Fork Set (${y})`,
    desc: (b,m,y) => `Set of selector/shift forks for all gears in ${b} ${m} gearbox (${y}). Hardened steel.`,
    basePrice: 5200, specs: { material:'Hardened Alloy Steel', set:'All gears', positions:'All' } },

  { code:'TRN14', catId:11, img:IMG.clutch,
    name: (b,m,y) => `${b} ${m} Clutch Slave Cylinder (${y})`,
    desc: (b,m,y) => `External clutch slave cylinder for ${b} ${m} hydraulic clutch (${y}). With bleed nipple.`,
    basePrice: 1800, specs: { bore:'25.4mm', material:'Cast Iron', bleeding:'Nipple included' } },

  { code:'TRN15', catId:11, img:IMG.gearbox,
    name: (b,m,y) => `${b} ${m} Transfer Box Assembly (4×4) (${y})`,
    desc: (b,m,y) => `Transfer case assembly for ${b} ${m} 4×4/AWD trucks (${y}). Two-speed Hi/Lo range selector.`,
    basePrice: 42000, specs: { ratios:'Hi/Lo', type:'Part-time 4WD', condition:'Rebuilt' } },

  // ═══ SUSPENSION & STEERING (catId=12) — 15 parts ══════════════════════════
  { code:'SUS01', catId:12, img:IMG.leafspring,
    name: (b,m,y) => `${b} ${m} Front Leaf Spring Assembly (${y})`,
    desc: (b,m,y) => `Parabolic front leaf spring for ${b} ${m} (${y}). High-tensile 65Si7 steel. Shot-peened for fatigue life.`,
    basePrice: 6200, specs: { type:'Parabolic Multi-leaf', material:'65Si7', surface:'Shot-Peened' } },

  { code:'SUS02', catId:12, img:IMG.leafspring,
    name: (b,m,y) => `${b} ${m} Rear Leaf Spring Assembly (${y})`,
    desc: (b,m,y) => `Multi-leaf rear spring pack for ${b} ${m} (${y}). Progressive-rate with helper spring leaf.`,
    basePrice: 11500, specs: { type:'Progressive Multi-leaf', helper:'Yes', material:'65Si7' } },

  { code:'SUS03', catId:12, img:IMG.shockabs,
    name: (b,m,y) => `${b} ${m} Front Shock Absorber Pair (${y})`,
    desc: (b,m,y) => `Hydraulic twin-tube shock absorbers (pair) for ${b} ${m} front axle (${y}). Nitrogen-charged.`,
    basePrice: 4500, specs: { type:'Twin-tube Hydraulic', gas:'Nitrogen Charged', pcs:2 } },

  { code:'SUS04', catId:12, img:IMG.shockabs,
    name: (b,m,y) => `${b} ${m} Rear Shock Absorber Pair (${y})`,
    desc: (b,m,y) => `Heavy-duty rear shock absorbers (pair) for ${b} ${m} (${y}). Extra-long stroke for loaded operation.`,
    basePrice: 5800, specs: { type:'Heavy Duty Monotube', stroke:'250mm', pcs:2 } },

  { code:'SUS05', catId:12, img:IMG.ballJoint,
    name: (b,m,y) => `${b} ${m} Front Axle Kingpin Kit (${y})`,
    desc: (b,m,y) => `Kingpin and bronze bushing kit for ${b} ${m} front axle (${y}). Includes thrust bearing and lock pin.`,
    basePrice: 5500, specs: { pinMaterial:'SCM420 Steel', bush:'Bronze', includes:'Pin+Bush+Thrust+Lock' } },

  { code:'SUS06', catId:12, img:IMG.steering,
    name: (b,m,y) => `${b} ${m} Drag Link Assembly (${y})`,
    desc: (b,m,y) => `Complete drag link assembly with ball joints for ${b} ${m} (${y}). Heavy-duty forged steel.`,
    basePrice: 4800, specs: { material:'Forged Steel', ballJoints:'Sealed', adjustable:true } },

  { code:'SUS07', catId:12, img:IMG.steering,
    name: (b,m,y) => `${b} ${m} Tie Rod End Kit (${y})`,
    desc: (b,m,y) => `Tie rod end set for ${b} ${m} (${y}). Heavy-duty sealed ball joint, includes castellated nut.`,
    basePrice: 2800, specs: { type:'Heavy Duty Ball Joint', sealed:true, includes:'Nut+Cotter' } },

  { code:'SUS08', catId:12, img:IMG.steering,
    name: (b,m,y) => `${b} ${m} Power Steering Pump (${y})`,
    desc: (b,m,y) => `Hydraulic power steering pump for ${b} ${m} (${y}). Vane-type, self-regulating pressure relief.`,
    basePrice: 10500, specs: { type:'Vane Pump', flow:'14 L/min', pressure:'145 bar' } },

  { code:'SUS09', catId:12, img:IMG.steering,
    name: (b,m,y) => `${b} ${m} Power Steering Gear Box (${y})`,
    desc: (b,m,y) => `Hydraulic recirculating-ball power steering gearbox for ${b} ${m} (${y}). Reconditioned.`,
    basePrice: 28000, specs: { type:'Recirculating Ball', ratio:'24:1', condition:'Reconditioned' } },

  { code:'SUS10', catId:12, img:IMG.shockabs,
    name: (b,m,y) => `${b} ${m} Air Suspension Bellows (${y})`,
    desc: (b,m,y) => `Double-convoluted air spring/bellow for ${b} ${m} air suspension (${y}). Contitech equivalent.`,
    basePrice: 9200, specs: { type:'Double Convoluted', maxPressure:'10 bar', material:'Neoprene+Nylon' } },

  { code:'SUS11', catId:12, img:IMG.ballJoint,
    name: (b,m,y) => `${b} ${m} Front Axle I-Beam Assembly (${y})`,
    desc: (b,m,y) => `Forged steel front axle beam for ${b} ${m} (${y}). Includes kingpins, hubs and pre-assembled stub axles.`,
    basePrice: 45000, specs: { type:'I-Beam', material:'Forged Steel', loadRating:'7.0T' } },

  { code:'SUS12', catId:12, img:IMG.leafspring,
    name: (b,m,y) => `${b} ${m} Leaf Spring U-Bolt Set (${y})`,
    desc: (b,m,y) => `High-tensile U-bolt set (2 pairs) for front/rear leaf springs on ${b} ${m} (${y}). Grade 10.9.`,
    basePrice: 1200, specs: { grade:'10.9 High Tensile', pcs:'4 bolts + nuts', coating:'Zinc plated' } },

  { code:'SUS13', catId:12, img:IMG.ballJoint,
    name: (b,m,y) => `${b} ${m} Stabiliser Bar + Bushings (${y})`,
    desc: (b,m,y) => `Front anti-roll bar with polyurethane bushings for ${b} ${m} (${y}). Reduces body roll.`,
    basePrice: 9500, specs: { material:'Spring Steel', bushings:'Polyurethane', includes:'Brackets+Links' } },

  { code:'SUS14', catId:12, img:IMG.steering,
    name: (b,m,y) => `${b} ${m} Steering Column Assembly (${y})`,
    desc: (b,m,y) => `Collapsible safety steering column for ${b} ${m} (${y}). With adjustable tilt mechanism.`,
    basePrice: 12000, specs: { type:'Collapsible Safety', tilt:'Adjustable', telescopic:'Optional' } },

  { code:'SUS15', catId:12, img:IMG.shockabs,
    name: (b,m,y) => `${b} ${m} Cabin Suspension Bush Set (${y})`,
    desc: (b,m,y) => `Front and rear cabin suspension rubber bush kit for ${b} ${m} (${y}). Reduces NVH. Set of 8.`,
    basePrice: 3200, specs: { material:'Natural Rubber', pcs:8, NVH:'Improved', positions:'Cab mounts' } },

  // ═══ ELECTRICAL & LIGHTING (catId=13) — 15 parts ═════════════════════════
  { code:'ELC01', catId:13, img:IMG.alternator,
    name: (b,m,y) => `${b} ${m} Alternator 80A / 24V (${y})`,
    desc: (b,m,y) => `Valeo/Bosch-equivalent 80A, 24V alternator for ${b} ${m} (${y}). Internal regulator, self-exciting.`,
    basePrice: 8500, specs: { output:'80A', voltage:'24V', regulator:'Internal', rotation:'CW' } },

  { code:'ELC02', catId:13, img:IMG.alternator,
    name: (b,m,y) => `${b} ${m} Alternator 100A / 24V (${y})`,
    desc: (b,m,y) => `High-output 100A, 24V alternator for ${b} ${m} (${y}). Suits trucks with multiple electrical accessories.`,
    basePrice: 11500, specs: { output:'100A', voltage:'24V', features:'High output' } },

  { code:'ELC03', catId:13, img:IMG.starter,
    name: (b,m,y) => `${b} ${m} Starter Motor 24V (${y})`,
    desc: (b,m,y) => `Heavy-duty 24V starter motor for ${b} ${m} (${y}). Pre-engaged drive, 4.5kW or 6kW depending on engine.`,
    basePrice: 7500, specs: { voltage:'24V', power:'4.5–6kW', type:'Pre-engaged' } },

  { code:'ELC04', catId:13, img:IMG.battery,
    name: (b,m,y) => `${b} ${m} 24V 150Ah Maintenance-Free Battery (${y})`,
    desc: (b,m,y) => `AGM 24V 150Ah truck battery for ${b} ${m} (${y}). Vibration-proof. 2-year warranty.`,
    basePrice: 14500, specs: { type:'AGM', voltage:'24V', capacity:'150Ah', warranty:'2 years' } },

  { code:'ELC05', catId:13, img:IMG.battery,
    name: (b,m,y) => `${b} ${m} 12V 100Ah Truck Battery (${y})`,
    desc: (b,m,y) => `Heavy-duty 12V 100Ah SMF battery for ${b} ${m} (${y}). 750 CCA, vibration resistant.`,
    basePrice: 6500, specs: { type:'SMF', voltage:'12V', capacity:'100Ah', CCA:'750A' } },

  { code:'ELC06', catId:13, img:IMG.headlight,
    name: (b,m,y) => `${b} ${m} LED Headlight Assembly Pair (${y})`,
    desc: (b,m,y) => `Full LED headlight assembly pair for ${b} ${m} BS6 (${y}). High/Low beam + DRL. IP67 sealed.`,
    basePrice: 9500, specs: { type:'Full LED', lumens:'6000lm', DRL:true, IP:'IP67' } },

  { code:'ELC07', catId:13, img:IMG.headlight,
    name: (b,m,y) => `${b} ${m} Halogen Headlight Set (${y})`,
    desc: (b,m,y) => `OEM headlight lens and reflector assembly pair for ${b} ${m} (${y}). H4 halogen bulb socket.`,
    basePrice: 4500, specs: { bulb:'H4 Halogen', type:'Reflector', pcs:2 } },

  { code:'ELC08', catId:13, img:IMG.wiring,
    name: (b,m,y) => `${b} ${m} Complete Wiring Harness (${y})`,
    desc: (b,m,y) => `OEM-equivalent main wiring harness for ${b} ${m} (${y}). All connectors pre-fitted.`,
    basePrice: 18500, specs: { wires:'CXL grade', connectors:'Pre-fitted', includes:'Cabin + Engine' } },

  { code:'ELC09', catId:13, img:IMG.sensor,
    name: (b,m,y) => `${b} ${m} Engine Coolant Temperature Sensor (${y})`,
    desc: (b,m,y) => `NTC engine coolant temperature sensor for ${b} ${m} (${y}). Feeds ECU for fuelling correction.`,
    basePrice: 850, specs: { type:'NTC Thermistor', range:'-40 to 130°C', thread:'M12' } },

  { code:'ELC10', catId:13, img:IMG.sensor,
    name: (b,m,y) => `${b} ${m} MAP / Boost Pressure Sensor (${y})`,
    desc: (b,m,y) => `Manifold absolute pressure sensor for ${b} ${m} turbocharged engine (${y}). 0-5V output.`,
    basePrice: 2500, specs: { type:'Manifold Absolute Pressure', output:'0-5V', maxPressure:'4 bar' } },

  { code:'ELC11', catId:13, img:IMG.sensor,
    name: (b,m,y) => `${b} ${m} Crankshaft Position Sensor (${y})`,
    desc: (b,m,y) => `Hall-effect crank position sensor for ${b} ${m} (${y}). Inputs RPM signal to ECU and injection timing.`,
    basePrice: 1800, specs: { type:'Hall Effect', output:'Digital', function:'RPM + Timing' } },

  { code:'ELC12', catId:13, img:IMG.wiring,
    name: (b,m,y) => `${b} ${m} Fuse Box + Relay Panel Assembly (${y})`,
    desc: (b,m,y) => `Complete 24V fuse and relay box for ${b} ${m} (${y}). 32 circuits with ATC blade fuses.`,
    basePrice: 5500, specs: { circuits:32, type:'ATC Blade Fuse', voltage:'24V' } },

  { code:'ELC13', catId:13, img:IMG.headlight,
    name: (b,m,y) => `${b} ${m} LED Tail Light Assembly Pair (${y})`,
    desc: (b,m,y) => `LED rear combination tail light assemblies for ${b} ${m} (${y}). Brake, tail, reverse and indicators combined.`,
    basePrice: 5500, specs: { type:'LED Combination', functions:'Brake+Tail+Reverse+Indicator', IP:'IP67' } },

  { code:'ELC14', catId:13, img:IMG.sensor,
    name: (b,m,y) => `${b} ${m} Exhaust Back-Pressure Sensor (${y})`,
    desc: (b,m,y) => `Differential pressure sensor for BS6 DPF monitoring on ${b} ${m} (${y}). 0-1 bar range.`,
    basePrice: 3500, specs: { type:'Differential Pressure', range:'0-1 bar', BS:'BS6 DPF' } },

  { code:'ELC15', catId:13, img:IMG.alternator,
    name: (b,m,y) => `${b} ${m} Engine ECU / PCM Module (${y})`,
    desc: (b,m,y) => `Engine control module (ECU/PCM) for ${b} ${m} BS6 (${y}). Pre-programmed, plug-and-play.`,
    basePrice: 38000, specs: { standard:'BS6', inputs:32, outputs:16, warranty:'12 months' } },

  // ═══ BODY & CABIN PARTS (catId=14) — 12 parts ════════════════════════════
  { code:'BDY01', catId:14, img:IMG.body,
    name: (b,m,y) => `${b} ${m} Front Bumper Assembly (${y})`,
    desc: (b,m,y) => `Steel front bumper for ${b} ${m} (${y}). Powder-coated. Includes fog lamp brackets.`,
    basePrice: 5500, specs: { material:'MS Steel 3mm', finish:'Powder coat black' } },

  { code:'BDY02', catId:14, img:IMG.cabin,
    name: (b,m,y) => `${b} ${m} Driver-Side Door Assembly (${y})`,
    desc: (b,m,y) => `Complete driver's door for ${b} ${m} (${y}). Includes regulator, handle, lock and tinted glass.`,
    basePrice: 22000, specs: { side:'Driver/Left', glass:'Tinted', regulator:'Manual/Electric' } },

  { code:'BDY03', catId:14, img:IMG.mirror,
    name: (b,m,y) => `${b} ${m} Side View Mirror Set (${y})`,
    desc: (b,m,y) => `Wide-angle external rear-view mirror pair for ${b} ${m} (${y}). Adjustable, vibration-damped bracket.`,
    basePrice: 3200, specs: { pcs:2, type:'Flat + Convex combo', adjustment:'Manual' } },

  { code:'BDY04', catId:14, img:IMG.cabin,
    name: (b,m,y) => `${b} ${m} Windshield Glass Laminated (${y})`,
    desc: (b,m,y) => `Laminated safety windshield for ${b} ${m} (${y}). AS1 rated with UV + acoustic PVB interlayer.`,
    basePrice: 18500, specs: { type:'Laminated AS1', UV:'Protected', PVB:'Acoustic' } },

  { code:'BDY05', catId:14, img:IMG.body,
    name: (b,m,y) => `${b} ${m} Bonnet / Hood Assembly (Fibreglass) (${y})`,
    desc: (b,m,y) => `Fibreglass bonnet for ${b} ${m} (${y}). Lighter than steel. Pre-primed, ready to paint.`,
    basePrice: 12500, specs: { material:'Fibreglass GRP', finish:'Pre-primed', weight:'12 kg' } },

  { code:'BDY06', catId:14, img:IMG.cabin,
    name: (b,m,y) => `${b} ${m} Driver Seat Assembly Suspension (${y})`,
    desc: (b,m,y) => `Pneumatic suspension driver seat for ${b} ${m} (${y}). Adjustable lumbar, armrests, weight setting.`,
    basePrice: 28000, specs: { type:'Pneumatic Suspension', lumbar:'Adjustable', weightRange:'50-120kg' } },

  { code:'BDY07', catId:14, img:IMG.cabin,
    name: (b,m,y) => `${b} ${m} Sleeper Berth / Bunk Mattress (${y})`,
    desc: (b,m,y) => `Replacement foam mattress for ${b} ${m} sleeper cabin bunk (${y}). High-density foam, cover included.`,
    basePrice: 5500, specs: { foam:'High Density 40 kg/m³', cover:'Leatherette', size:'Custom to model' } },

  { code:'BDY08', catId:14, img:IMG.body,
    name: (b,m,y) => `${b} ${m} Cabin Step + Grab Handle Kit (${y})`,
    desc: (b,m,y) => `Steel entry step and anti-slip grab handle kit for ${b} ${m} (${y}). Non-skid tread pattern.`,
    basePrice: 2800, specs: { material:'MS Steel', finish:'Non-skid powder coat', includes:'Step+Handle+Brackets' } },

  { code:'BDY09', catId:14, img:IMG.mirror,
    name: (b,m,y) => `${b} ${m} Rear-View Camera + Monitor Kit (${y})`,
    desc: (b,m,y) => `7-inch reversing camera and monitor kit for ${b} ${m} (${y}). Night vision, 170-degree wide angle.`,
    basePrice: 7500, specs: { screen:'7" TFT', camera:'170° wide', nightVision:true, IP:'IP67' } },

  { code:'BDY10', catId:14, img:IMG.cabin,
    name: (b,m,y) => `${b} ${m} Cabin Air Suspension Bellow (${y})`,
    desc: (b,m,y) => `Cab air suspension bellow (single) for ${b} ${m} (${y}). Contitech quality. Reduces cabin vibration.`,
    basePrice: 11000, specs: { type:'Single Convoluted', maxPressure:'8 bar', brand:'Contitech equiv' } },

  { code:'BDY11', catId:14, img:IMG.body,
    name: (b,m,y) => `${b} ${m} Towing Hook + 5th Wheel Kingpin (${y})`,
    desc: (b,m,y) => `50mm towing ball + coupling pin for ${b} ${m} (${y}). Rated 15T. With locking pin and safety chain.`,
    basePrice: 4500, specs: { diameter:'50mm ball', rating:'15T', pin:'Safety chain included' } },

  { code:'BDY12', catId:14, img:IMG.cabin,
    name: (b,m,y) => `${b} ${m} Dashboard Instrument Cluster (${y})`,
    desc: (b,m,y) => `OEM dashboard instrument cluster for ${b} ${m} (${y}). LCD display with speedometer, tachometer, fuel and temp gauges.`,
    basePrice: 14000, specs: { display:'LCD', functions:'Speed+RPM+Fuel+Temp', voltage:'24V' } },

  // ═══ COOLING SYSTEM (catId=9) — 10 parts ═════════════════════════════════
  { code:'COL01', catId:9, img:IMG.radiator,
    name: (b,m,y) => `${b} ${m} Radiator Assembly All-Aluminium (${y})`,
    desc: (b,m,y) => `All-aluminium core radiator for ${b} ${m} (${y}). Bar-and-plate core, plastic header tanks. OEM dimensions.`,
    basePrice: 15500, specs: { core:'All-aluminium Bar-Plate', tanks:'Nylon-PA66', rows:4 } },

  { code:'COL02', catId:9, img:IMG.waterpump,
    name: (b,m,y) => `${b} ${m} Water Pump Assembly (${y})`,
    desc: (b,m,y) => `Engine water pump for ${b} ${m} (${y}). Cast iron body, brass impeller, sealed bearing.`,
    basePrice: 3200, specs: { material:'Cast Iron', impeller:'Brass', bearing:'Sealed' } },

  { code:'COL03', catId:9, img:IMG.waterpump,
    name: (b,m,y) => `${b} ${m} Thermostat + Housing (${y})`,
    desc: (b,m,y) => `Wax-element thermostat and housing for ${b} ${m} (${y}). Opens at 82°C for optimal operating temperature.`,
    basePrice: 1800, specs: { opens:'82°C', fullOpen:'95°C', includes:'Housing+Gasket' } },

  { code:'COL04', catId:9, img:IMG.radiator,
    name: (b,m,y) => `${b} ${m} Radiator Coolant Hose Set (${y})`,
    desc: (b,m,y) => `EPDM coolant hose set for ${b} ${m} (${y}). Upper + lower + bypass hoses with clamps.`,
    basePrice: 2200, specs: { material:'EPDM+Nylon Braid', maxTemp:'150°C', set:'Upper+Lower+Bypass' } },

  { code:'COL05', catId:9, img:IMG.radiator,
    name: (b,m,y) => `${b} ${m} Radiator Fan Shroud (${y})`,
    desc: (b,m,y) => `Plastic radiator fan shroud for ${b} ${m} (${y}). Maintains directed airflow through radiator core.`,
    basePrice: 3800, specs: { material:'GF-Nylon', function:'Airflow Direction', compatible:'OEM dimensions' } },

  { code:'COL06', catId:9, img:IMG.waterpump,
    name: (b,m,y) => `${b} ${m} Fan Belt / Serpentine Belt Set (${y})`,
    desc: (b,m,y) => `V-belt or multi-rib serpentine belt for ${b} ${m} (${y}). EPDM construction for heat and crack resistance.`,
    basePrice: 1200, specs: { material:'EPDM', type:'V-belt or Poly-V', set:'Full drive set' } },

  { code:'COL07', catId:9, img:IMG.radiator,
    name: (b,m,y) => `${b} ${m} Oil Cooler + Lines (${y})`,
    desc: (b,m,y) => `Engine oil cooler with feed and return lines for ${b} ${m} (${y}). Brazed aluminium plate cooler.`,
    basePrice: 8500, specs: { type:'Plate Oil Cooler', material:'Brazed Aluminium', lines:'Stainless Braided' } },

  { code:'COL08', catId:9, img:IMG.waterpump,
    name: (b,m,y) => `${b} ${m} Radiator Cap 1.1 Bar (${y})`,
    desc: (b,m,y) => `Radiator pressure cap 1.1 bar for ${b} ${m} (${y}). Maintains system pressure for higher boiling point.`,
    basePrice: 350, specs: { pressure:'1.1 bar', material:'Stainless Steel valve', type:'SAE std' } },

  { code:'COL09', catId:9, img:IMG.radiator,
    name: (b,m,y) => `${b} ${m} Intercooler + Installation Kit (${y})`,
    desc: (b,m,y) => `Air-to-air intercooler with hoses and clamps for ${b} ${m} (${y}). Lowers intake air temp by 50°C.`,
    basePrice: 16500, specs: { type:'Air-to-Air', ΔT:'50°C', includes:'Hoses+Clamps+Brackets' } },

  { code:'COL10', catId:9, img:IMG.waterpump,
    name: (b,m,y) => `${b} ${m} Coolant Expansion Tank (${y})`,
    desc: (b,m,y) => `Coolant overflow / expansion reservoir for ${b} ${m} (${y}). Translucent polypropylene with MIN/MAX markings.`,
    basePrice: 1400, specs: { material:'Polypropylene', capacity:'2.5L', marking:'MIN/MAX' } },

  // ═══ FUEL SYSTEM (catId=15) — 10 parts ════════════════════════════════════
  { code:'FUL01', catId:15, img:IMG.fuelPump,
    name: (b,m,y) => `${b} ${m} High-Pressure Fuel Pump (CR) (${y})`,
    desc: (b,m,y) => `Common-rail high-pressure fuel pump for ${b} ${m} (${y}). Bosch CP3 or CP4 equivalent. 1600 bar output.`,
    basePrice: 34000, specs: { type:'CR High-Pressure', brand:'Bosch CP3/CP4 equiv', output:'1600 bar' } },

  { code:'FUL02', catId:15, img:IMG.fuelTank,
    name: (b,m,y) => `${b} ${m} 100L Aluminium Diesel Tank (${y})`,
    desc: (b,m,y) => `100-litre aluminium diesel fuel tank for ${b} ${m} (${y}). With fuel sender, filler neck and straps.`,
    basePrice: 15500, specs: { capacity:'100L', material:'Aluminium 3mm', includes:'Sender+Straps+Cap' } },

  { code:'FUL03', catId:15, img:IMG.fuelTank,
    name: (b,m,y) => `${b} ${m} 150L Aluminium Diesel Tank (${y})`,
    desc: (b,m,y) => `150-litre aluminium diesel fuel tank for ${b} ${m} (${y}). Side-mounted. With baffle plate.`,
    basePrice: 22000, specs: { capacity:'150L', material:'Aluminium', baffle:'Yes', position:'Side mount' } },

  { code:'FUL04', catId:15, img:IMG.fuelPump,
    name: (b,m,y) => `${b} ${m} Fuel Transfer Pump 12V (${y})`,
    desc: (b,m,y) => `Electric low-pressure diesel transfer pump for ${b} ${m} (${y}). 12V, 2 bar. In-tank or inline.`,
    basePrice: 3200, specs: { voltage:'12V', pressure:'2 bar', type:'Electric', flow:'80 L/hr' } },

  { code:'FUL05', catId:15, img:IMG.injector,
    name: (b,m,y) => `${b} ${m} Fuel Pressure Regulator (${y})`,
    desc: (b,m,y) => `Common-rail fuel pressure regulator valve for ${b} ${m} (${y}). Maintains stable rail pressure.`,
    basePrice: 4500, specs: { type:'PWM Solenoid Valve', range:'200-1600 bar', compatibility:'OEM sensor' } },

  { code:'FUL06', catId:15, img:IMG.injector,
    name: (b,m,y) => `${b} ${m} Injector Return Fuel Lines Kit (${y})`,
    desc: (b,m,y) => `Plastic fuel return line kit for all injectors on ${b} ${m} (${y}). Colour-coded, OEM pattern.`,
    basePrice: 2500, specs: { material:'Polyamide PA12', function:'Injector Return', set:'Full engine' } },

  { code:'FUL07', catId:15, img:IMG.oilFilter,
    name: (b,m,y) => `${b} ${m} Diesel Fuel Filter Primary + Secondary (${y})`,
    desc: (b,m,y) => `Pre-filter and main fuel filter set for ${b} ${m} (${y}). Removes particulates and water from diesel.`,
    basePrice: 1400, specs: { primary:'Water Separator 10µm', secondary:'5µm Absolute', set:'Both filters' } },

  { code:'FUL08', catId:15, img:IMG.fuelTank,
    name: (b,m,y) => `${b} ${m} Fuel Gauge Sender Unit (${y})`,
    desc: (b,m,y) => `In-tank fuel level sender unit for ${b} ${m} (${y}). 0-90 ohm resistance range.`,
    basePrice: 1800, specs: { resistance:'0-90Ω', float:'Monel', voltageRange:'12-24V' } },

  { code:'FUL09', catId:15, img:IMG.fuelPump,
    name: (b,m,y) => `${b} ${m} AdBlue / DEF Tank + Pump (30L) (${y})`,
    desc: (b,m,y) => `30-litre AdBlue (DEF) urea solution tank with dosing pump for ${b} ${m} BS6 (${y}).`,
    basePrice: 22000, specs: { capacity:'30L', pump:'Continental/Bosch equiv', standard:'ISO 22241' } },

  { code:'FUL10', catId:15, img:IMG.injector,
    name: (b,m,y) => `${b} ${m} AdBlue Dosing Injector + Nozzle (${y})`,
    desc: (b,m,y) => `SCR system AdBlue dosing injector for ${b} ${m} BS6 (${y}). Atomises urea into exhaust stream.`,
    basePrice: 9500, specs: { type:'Solenoid Dosing', fluid:'DEF 32.5%', BS:'BS6 SCR' } },

  // ═══ EXHAUST SYSTEM (catId=10) — 8 parts ═════════════════════════════════
  { code:'EXH01', catId:10, img:IMG.exhaust,
    name: (b,m,y) => `${b} ${m} Exhaust Manifold (${y})`,
    desc: (b,m,y) => `Cast iron exhaust manifold for ${b} ${m} (${y}). High silicon-molybdenum iron for thermal shock resistance.`,
    basePrice: 8500, specs: { material:'SiMo Cast Iron', coating:'Thermal Barrier', bolts:'Included' } },

  { code:'EXH02', catId:10, img:IMG.muffler,
    name: (b,m,y) => `${b} ${m} Exhaust Muffler / Silencer (${y})`,
    desc: (b,m,y) => `Stainless steel exhaust muffler for ${b} ${m} (${y}). Reduces exhaust noise to <80 dB. Universal inlet.`,
    basePrice: 7500, specs: { material:'SS 409', noise:'<80 dB', inlet:'89mm / 3.5"' } },

  { code:'EXH03', catId:10, img:IMG.exhaust,
    name: (b,m,y) => `${b} ${m} DPF Diesel Particulate Filter (${y})`,
    desc: (b,m,y) => `BS6-certified Diesel Particulate Filter (DPF) for ${b} ${m} (${y}). Cordierite substrate, 99% PM filtration.`,
    basePrice: 95000, specs: { substrate:'Cordierite', efficiency:'99% PM', standard:'BS6', regenTemp:'550-650°C' } },

  { code:'EXH04', catId:10, img:IMG.dpf,
    name: (b,m,y) => `${b} ${m} SCR Catalyst Assembly (${y})`,
    desc: (b,m,y) => `Selective Catalytic Reduction (SCR) catalyst for ${b} ${m} BS6 (${y}). Reduces NOx by 90%+.`,
    basePrice: 85000, specs: { standard:'BS6', NOx:'90%+ reduction', substrate:'Vanadium Titan' } },

  { code:'EXH05', catId:10, img:IMG.exhaust,
    name: (b,m,y) => `${b} ${m} Exhaust Flex Pipe 89mm (${y})`,
    desc: (b,m,y) => `Stainless steel corrugated flex pipe for ${b} ${m} (${y}). Absorbs engine vibration and misalignment.`,
    basePrice: 2800, specs: { material:'SS 304', diameter:'89mm (3.5")', length:'300mm' } },

  { code:'EXH06', catId:10, img:IMG.muffler,
    name: (b,m,y) => `${b} ${m} Exhaust Clamp Set (${y})`,
    desc: (b,m,y) => `Heavy-duty exhaust clamp and flange set for ${b} ${m} (${y}). V-band and U-bolt clamps. Stainless steel.`,
    basePrice: 1200, specs: { material:'SS 304', types:'V-band + U-bolt', set:'Full system' } },

  { code:'EXH07', catId:10, img:IMG.exhaust,
    name: (b,m,y) => `${b} ${m} Exhaust DOC Oxidation Catalyst (${y})`,
    desc: (b,m,y) => `Diesel Oxidation Catalyst (DOC) for ${b} ${m} BS4/BS6 (${y}). Oxidises CO and unburnt HC.`,
    basePrice: 45000, specs: { standard:'BS4/BS6', function:'CO+HC Oxidation', washcoat:'Platinum-Palladium' } },

  { code:'EXH08', catId:10, img:IMG.muffler,
    name: (b,m,y) => `${b} ${m} Exhaust Stack Pipe Vertical (${y})`,
    desc: (b,m,y) => `Vertical chrome exhaust stack for ${b} ${m} (${y}). With rain cap. Stainless steel 101mm OD.`,
    basePrice: 4500, specs: { material:'SS + Chrome', diameter:'101mm OD', includes:'Rain cap + bracket' } },

  // ═══ WHEELS & TYRES (catId=16) — 8 parts ════════════════════════════════
  { code:'WHL01', catId:16, img:IMG.tyre,
    name: (b,m,y) => `${b} ${m} 7.50R16 10PR Radial Tyre (${y})`,
    desc: (b,m,y) => `MRF / CEAT 7.50R16 10PR tubeless radial tyre for ${b} ${m} (${y}). All-terrain highway pattern.`,
    basePrice: 7800, specs: { size:'7.50R16', ply:'10PR', type:'Tubeless', brand:'MRF/CEAT equiv' } },

  { code:'WHL02', catId:16, img:IMG.tyre,
    name: (b,m,y) => `${b} ${m} 10.00R20 14PR Radial Tyre (${y})`,
    desc: (b,m,y) => `Apollo / Bridgestone 10.00R20 14PR long-haul tyre for ${b} ${m} (${y}). Low rolling resistance.`,
    basePrice: 14500, specs: { size:'10.00R20', ply:'14PR', type:'Tubeless Radial', rolling:'Low resistance' } },

  { code:'WHL03', catId:16, img:IMG.tyre,
    name: (b,m,y) => `${b} ${m} 295/80R22.5 Drive Axle Tyre (${y})`,
    desc: (b,m,y) => `Bridgestone / Apollo 295/80R22.5 drive axle tyre for ${b} ${m} (${y}). Deep tread 20/32" for long mileage.`,
    basePrice: 21500, specs: { size:'295/80R22.5', loadIndex:152, axle:'Drive', tread:'20/32"' } },

  { code:'WHL04', catId:16, img:IMG.tyre,
    name: (b,m,y) => `${b} ${m} 315/80R22.5 Steer Axle Tyre (${y})`,
    desc: (b,m,y) => `Premium 315/80R22.5 all-season steer axle tyre for ${b} ${m} (${y}). Rib pattern for directional stability.`,
    basePrice: 24500, specs: { size:'315/80R22.5', axle:'Steer', pattern:'Rib', season:'All season' } },

  { code:'WHL05', catId:16, img:IMG.wheel,
    name: (b,m,y) => `${b} ${m} Steel Wheel Rim 22.5" (${y})`,
    desc: (b,m,y) => `Heavy-duty steel wheel rim 22.5×8.25 for ${b} ${m} (${y}). 10-stud. Powder-coated white.`,
    basePrice: 5800, specs: { size:'22.5×8.25"', studs:10, finish:'White powder coat', PCD:'335mm' } },

  { code:'WHL06', catId:16, img:IMG.wheel,
    name: (b,m,y) => `${b} ${m} Aluminium Alloy Wheel Rim 22.5" (${y})`,
    desc: (b,m,y) => `Forged aluminium alloy wheel rim 22.5×8.25 for ${b} ${m} (${y}). 30% lighter than steel. 10-stud.`,
    basePrice: 14500, specs: { size:'22.5×8.25"', material:'Forged Al 6061-T6', weight:'-30% vs steel', studs:10 } },

  { code:'WHL07', catId:16, img:IMG.wheel,
    name: (b,m,y) => `${b} ${m} Wheel Hub + Bearing Assembly (${y})`,
    desc: (b,m,y) => `Front or rear wheel hub with tapered roller bearing set for ${b} ${m} (${y}). Pre-adjusted, ready to install.`,
    basePrice: 8500, specs: { bearingType:'Tapered Roller', seal:'Triple lip', condition:'New pre-adjusted' } },

  { code:'WHL08', catId:16, img:IMG.tyre,
    name: (b,m,y) => `${b} ${m} Spare Wheel Carrier + Lock (${y})`,
    desc: (b,m,y) => `Under-chassis spare wheel carrier with security lock for ${b} ${m} (${y}). Worm-gear lowering mechanism.`,
    basePrice: 4500, specs: { type:'Under-chassis Worm Gear', lock:'Key operated', rating:'Max 1000kg tyre' } },

  // ═══ FILTERS & LUBRICATION (catId=17) — 8 parts ══════════════════════════
  { code:'FLT01', catId:17, img:IMG.oilFilter,
    name: (b,m,y) => `${b} ${m} Engine Oil Filter Spin-on (${y})`,
    desc: (b,m,y) => `Full-flow spin-on engine oil filter for ${b} ${m} (${y}). Mahle / Mann equivalent. 25µm bypass. 20,000 km interval.`,
    basePrice: 420, specs: { micron:'25µm', type:'Spin-on Full-flow', interval:'20,000 km', brand:'Mahle/Mann equiv' } },

  { code:'FLT02', catId:17, img:IMG.airFilter,
    name: (b,m,y) => `${b} ${m} Air Filter Primary Element (${y})`,
    desc: (b,m,y) => `Dry-type primary air filter element for ${b} ${m} (${y}). Donaldson radial seal design. 30,000 km interval.`,
    basePrice: 780, specs: { type:'Dry Radial Seal', media:'Nano-fibre', interval:'30,000 km' } },

  { code:'FLT03', catId:17, img:IMG.airFilter,
    name: (b,m,y) => `${b} ${m} Air Filter Safety Element (${y})`,
    desc: (b,m,y) => `Inner safety/secondary air filter element for ${b} ${m} (${y}). Changed every 2nd primary filter replacement.`,
    basePrice: 580, specs: { type:'Safety/Inner', role:'Secondary protection', interval:'60,000 km' } },

  { code:'FLT04', catId:17, img:IMG.oilFilter,
    name: (b,m,y) => `${b} ${m} Fuel Filter (Diesel) (${y})`,
    desc: (b,m,y) => `Diesel fuel filter for ${b} ${m} (${y}). 10µm filtration. Spin-on with water separator bowl.`,
    basePrice: 580, specs: { micron:'10µm', type:'Spin-on Water Sep', change:'15,000 km' } },

  { code:'FLT05', catId:17, img:IMG.oilFilter,
    name: (b,m,y) => `${b} ${m} Hydraulic Oil Filter (Power Steering) (${y})`,
    desc: (b,m,y) => `Hydraulic power steering oil filter for ${b} ${m} (${y}). 10µm spin-on type.`,
    basePrice: 480, specs: { micron:'10µm', type:'Spin-on', system:'Power Steering' } },

  { code:'FLT06', catId:17, img:IMG.oilFilter,
    name: (b,m,y) => `${b} ${m} Cabin Air / Pollen Filter (${y})`,
    desc: (b,m,y) => `Activated carbon cabin air filter for ${b} ${m} (${y}). Removes dust, pollen and odours.`,
    basePrice: 650, specs: { type:'Activated Carbon Combo', filtration:'PM2.5', change:'20,000 km' } },

  { code:'FLT07', catId:17, img:IMG.oilFilter,
    name: (b,m,y) => `${b} ${m} 5L SAE 15W-40 CI-4 Engine Oil (${y})`,
    desc: (b,m,y) => `SAE 15W-40 CI-4+ diesel engine oil for ${b} ${m} (${y}). Compatible with BS4 and BS6 engines. 5L can.`,
    basePrice: 1250, specs: { grade:'SAE 15W-40', standard:'API CI-4+', volume:'5L', BS:'BS4+BS6' } },

  { code:'FLT08', catId:17, img:IMG.oilFilter,
    name: (b,m,y) => `${b} ${m} 5L SAE 90 Gear Oil GL-5 (${y})`,
    desc: (b,m,y) => `SAE 90 GL-5+ gear oil for gearbox and differential on ${b} ${m} (${y}). 5L can. Extreme pressure additive.`,
    basePrice: 980, specs: { grade:'SAE 90 GL-5', EP:'Yes', volume:'5L', change:'50,000 km' } },

  // ═══ SAFETY & ACCESSORIES (catId=18) — 4 parts ═══════════════════════════
  { code:'SAF01', catId:18, img:IMG.safety,
    name: (b,m,y) => `${b} ${m} 3-Point Inertia Seat Belt Driver (${y})`,
    desc: (b,m,y) => `3-point inertia reel seat belt for driver of ${b} ${m} (${y}). Meets AIS-005 standard.`,
    basePrice: 3200, specs: { type:'3-Point Inertia Reel (ELR)', standard:'AIS-005', webbing:'48mm Polyester' } },

  { code:'SAF02', catId:18, img:IMG.safety,
    name: (b,m,y) => `${b} ${m} 6kg ABC Fire Extinguisher + Bracket (${y})`,
    desc: (b,m,y) => `ISI-marked 6kg ABC fire extinguisher for ${b} ${m} (${y}). Meets AIS-139. With steel bracket.`,
    basePrice: 1950, specs: { type:'ABC Dry Powder', weight:'6kg', std:'AIS-139 / IS 2171', bracket:'Included' } },

  { code:'SAF03', catId:18, img:IMG.dashcam,
    name: (b,m,y) => `${b} ${m} 4G GPS Fleet Tracker OBD (${y})`,
    desc: (b,m,y) => `4G GPS/GLONASS fleet management tracker for ${b} ${m} (${y}). Real-time tracking, driver scoring, fuel monitoring.`,
    basePrice: 5500, specs: { network:'4G LTE', GPS:'GPS+GLONASS', functions:'Tracking+Scoring+Fuel', update:'30s' } },

  { code:'SAF04', catId:18, img:IMG.dashcam,
    name: (b,m,y) => `${b} ${m} Dual-Lens Dash Camera 4K + GPS (${y})`,
    desc: (b,m,y) => `4K front + 1080P rear dash camera for ${b} ${m} (${y}). G-sensor, GPS overlay, 128GB loop storage.`,
    basePrice: 9500, specs: { front:'4K 8MP', rear:'1080P', GPS:'Overlay', storage:'128GB loop' } },
];

// ─── Generator ────────────────────────────────────────────────────────────────
function buildAllProducts() {
  const all = [];
  let idx = 0;

  for (const truck of TRUCKS) {
    for (const part of PARTS) {
      idx++;
      const price = Math.max(100, jitter(part.basePrice * truck.priceX));
      const stock = rnd(5, 120);

      // Unique part number: e.g. TAT-407E-ENG01-0042
      const pn = `${truck.abbr}-${truck.code}-${part.code}-${String(idx).padStart(5,'0')}`;

      all.push({
        name:           part.name(truck.brand, truck.model, truck.years),
        description:    part.desc(truck.brand, truck.model, truck.years),
        price:          price,
        stock_quantity: stock,
        category_id:    part.catId,
        seller_id:      1,
        brand:          truck.brand,
        part_number:    pn,
        image_url:      part.img,
        specifications: { ...part.specs, compatibleModel: truck.model, years: truck.years },
        approval_status:'approved',
        is_approved:    true,
        rejection_reason: null,
      });
    }
  }
  return all;
}

// ─── Seed ─────────────────────────────────────────────────────────────────────
async function seed() {
  console.log('\n🌱 10,000 Products Seed Starting…\n');
  const startTime = Date.now();

  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    const all = buildAllProducts();
    console.log(`📦 Generated ${all.length} products (${TRUCKS.length} trucks × ${PARTS.length} parts)`);

    // Batch insert — 500 rows per batch
    const BATCH = 500;
    const batches = Math.ceil(all.length / BATCH);
    let totalInserted = 0;

    console.log(`\n⚡ Inserting in ${batches} batches of ${BATCH}…\n`);

    for (let i = 0; i < all.length; i += BATCH) {
      const batch = all.slice(i, i + BATCH);
      const result = await Product.bulkCreate(batch, {
        ignoreDuplicates: true,                    // safe to re-run
        // returning: false speeds up inserts
      });
      totalInserted += result.length;
      const done = Math.round((i + batch.length) / all.length * 100);
      process.stdout.write(`\r   Batch ${Math.ceil((i + 1) / BATCH)}/${batches} — ${done}% done (${totalInserted} new)   `);
    }

    // Count total products now in DB
    const { Sequelize: S2, DataTypes: DT2 } = require('sequelize');
    const totalInDB = await Product.count({ where: { approval_status: 'approved' } });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log(`\n\n📊 Results:`);
    console.log(`   ✅ ${totalInserted} new products inserted`);
    console.log(`   📦 ${all.length} products generated in this run`);
    console.log(`   🏭 ${TRUCKS.length} truck models`);
    console.log(`   🔧 ${PARTS.length} part templates`);
    console.log(`   📂 12 categories`);
    console.log(`   🗃️  ${totalInDB} TOTAL approved products now in database`);
    console.log(`   ⏱️  Completed in ${elapsed}s`);
    console.log('\n🚀 Seed complete!\n');

  } catch (err) {
    console.error('\n❌ Seed failed:', err.message);
    if (err.stack) console.error(err.stack);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

seed();
