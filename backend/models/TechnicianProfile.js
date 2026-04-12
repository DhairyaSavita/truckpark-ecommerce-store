const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TechnicianProfile = sequelize.define('TechnicianProfile', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
  },
  specialization: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  experience_years: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  license_number: {
    type: DataTypes.STRING
  },
  hourly_rate: {
    type: DataTypes.DECIMAL(10, 2)
  },
  service_radius: {
    type: DataTypes.INTEGER,
    defaultValue: 50
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_available: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0
  },
  total_jobs: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  location_lat: {
    type: DataTypes.DECIMAL(10, 8)
  },
  location_lng: {
    type: DataTypes.DECIMAL(11, 8)
  },
  address: {
    type: DataTypes.TEXT
  },
  bio: {
    type: DataTypes.TEXT
  },
  documents: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  }
}, {
  tableName: 'technician_profiles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = TechnicianProfile;
