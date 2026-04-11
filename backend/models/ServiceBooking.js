const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ServiceBooking = sequelize.define('ServiceBooking', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  mechanic_id: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  booking_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  booking_time: {
    type: DataTypes.STRING
  },
  service_address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending'
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  payment_status: {
    type: DataTypes.STRING,
    defaultValue: 'pending'
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'service_bookings',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = ServiceBooking;
