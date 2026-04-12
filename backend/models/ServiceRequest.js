const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ServiceRequest = sequelize.define('ServiceRequest', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  customer_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  technician_id: {
    type: DataTypes.INTEGER
  },
  product_id: {
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
  service_type: {
    type: DataTypes.STRING,
    defaultValue: 'installation'
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending',
    validate: {
      isIn: [['pending', 'accepted', 'in_progress', 'completed', 'cancelled']]
    }
  },
  priority: {
    type: DataTypes.STRING,
    defaultValue: 'normal'
  },
  scheduled_date: {
    type: DataTypes.DATE
  },
  scheduled_time: {
    type: DataTypes.TIME
  },
  service_address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  customer_lat: {
    type: DataTypes.DECIMAL(10, 8)
  },
  customer_lng: {
    type: DataTypes.DECIMAL(11, 8)
  },
  estimated_duration: {
    type: DataTypes.INTEGER
  },
  estimated_cost: {
    type: DataTypes.DECIMAL(10, 2)
  },
  final_cost: {
    type: DataTypes.DECIMAL(10, 2)
  },
  payment_status: {
    type: DataTypes.STRING,
    defaultValue: 'pending'
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'service_requests',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = ServiceRequest;
