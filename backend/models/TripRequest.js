const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TripRequest = sequelize.define('TripRequest', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  customer_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  driver_id: {
    type: DataTypes.INTEGER
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  pickup_location: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  dropoff_location: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  pickup_lat: {
    type: DataTypes.DECIMAL(10, 8)
  },
  pickup_lng: {
    type: DataTypes.DECIMAL(11, 8)
  },
  dropoff_lat: {
    type: DataTypes.DECIMAL(10, 8)
  },
  dropoff_lng: {
    type: DataTypes.DECIMAL(11, 8)
  },
  trip_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  trip_time: {
    type: DataTypes.TIME
  },
  distance_km: {
    type: DataTypes.DECIMAL(10, 2)
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
  vehicle_type: {
    type: DataTypes.STRING
  },
  load_type: {
    type: DataTypes.STRING
  },
  load_weight: {
    type: DataTypes.DECIMAL(10, 2)
  },
  special_requirements: {
    type: DataTypes.TEXT
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending',
    validate: {
      isIn: [['pending', 'accepted', 'in_progress', 'completed', 'cancelled']]
    }
  },
  payment_status: {
    type: DataTypes.STRING,
    defaultValue: 'pending'
  }
}, {
  tableName: 'trip_requests',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = TripRequest;
