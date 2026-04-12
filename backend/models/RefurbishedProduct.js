const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RefurbishedProduct = sequelize.define('RefurbishedProduct', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  seller_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  original_product_id: {
    type: DataTypes.INTEGER
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  condition: {
    type: DataTypes.STRING,
    defaultValue: 'refurbished'
  },
  refurbishment_details: {
    type: DataTypes.TEXT
  },
  original_price: {
    type: DataTypes.DECIMAL(10, 2)
  },
  selling_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  discount_percentage: {
    type: DataTypes.DECIMAL(5, 2)
  },
  stock_quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  warranty_months: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  certification: {
    type: DataTypes.STRING
  },
  images: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'active'
  }
}, {
  tableName: 'refurbished_products',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = RefurbishedProduct;
