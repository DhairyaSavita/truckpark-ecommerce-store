const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const VendorAnalytics = sequelize.define('VendorAnalytics', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  seller_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
  },
  total_sales: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  total_revenue: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  total_orders: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  average_rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0
  },
  response_rate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0
  },
  on_time_delivery: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0
  },
  monthly_data: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'vendor_analytics',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = VendorAnalytics;
