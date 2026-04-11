const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Mechanic = sequelize.define('Mechanic', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  specialization: {
    type: DataTypes.STRING,
    allowNull: false
  },
  experience_years: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  hourly_rate: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0
  },
  total_bookings: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  available_days: {
    type: DataTypes.STRING
  },
  available_hours: {
    type: DataTypes.STRING
  }
}, {
  tableName: 'mechanics',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Mechanic;
