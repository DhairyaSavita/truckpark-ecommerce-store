const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DriverProfile = sequelize.define('DriverProfile', {
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
  license_number: {
    type: DataTypes.STRING
  },
  license_expiry: {
    type: DataTypes.DATE
  },
  experience_years: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0
  },
  completed_trips: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  hourly_rate: {
    type: DataTypes.DECIMAL(10, 2)
  },
  daily_rate: {
    type: DataTypes.DECIMAL(10, 2)
  },
  is_available: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  current_location_lat: {
    type: DataTypes.DECIMAL(10, 8)
  },
  current_location_lng: {
    type: DataTypes.DECIMAL(11, 8)
  },
  home_city: {
    type: DataTypes.STRING
  },
  preferred_routes: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  vehicle_type: {
    type: DataTypes.STRING
  },
  license_classes: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  bio: {
    type: DataTypes.TEXT
  },
  documents: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  approval_status: {
    type: DataTypes.STRING,
    defaultValue: 'pending',
    validate: { isIn: [['pending', 'approved', 'rejected', 'suspended']] }
  },
  total_reviews: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  service_areas: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  appointed_vendor_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Set when a vendor exclusively appoints this driver'
  },
  rejection_reason: {
    type: DataTypes.TEXT
  },
  admin_notes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'driver_profiles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = DriverProfile;
