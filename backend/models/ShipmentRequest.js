const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ShipmentRequest = sequelize.define('ShipmentRequest', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  customer_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  logistics_id: {
    type: DataTypes.INTEGER
  },
  pickup_address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  delivery_address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  pickup_city: {
    type: DataTypes.STRING
  },
  delivery_city: {
    type: DataTypes.STRING
  },
  pickup_pincode: {
    type: DataTypes.STRING
  },
  delivery_pincode: {
    type: DataTypes.STRING
  },
  weight_kg: {
    type: DataTypes.DECIMAL(10, 2)
  },
  goods_type: {
    type: DataTypes.STRING
  },
  is_fragile: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_hazardous: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  special_instructions: {
    type: DataTypes.TEXT
  },
  pickup_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  estimated_cost: {
    type: DataTypes.DECIMAL(10, 2)
  },
  final_cost: {
    type: DataTypes.DECIMAL(10, 2)
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending'
  },
  payment_status: {
    type: DataTypes.STRING,
    defaultValue: 'pending'
  },
  tracking_number: {
    type: DataTypes.STRING
  }
}, {
  tableName: 'shipment_requests',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = ShipmentRequest;
