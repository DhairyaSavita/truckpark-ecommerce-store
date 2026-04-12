const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TechnicianEarning = sequelize.define('TechnicianEarning', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  technician_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  service_request_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  commission: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  net_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending'
  },
  paid_at: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'technician_earnings',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = TechnicianEarning;
