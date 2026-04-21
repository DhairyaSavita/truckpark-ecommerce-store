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
  approval_status: {
    type: DataTypes.STRING,
    defaultValue: 'pending',
    validate: { isIn: [['pending', 'approved', 'rejected', 'suspended']] }
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0
  },
  total_jobs: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  total_reviews: {
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
  },
  certifications: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: 'Array of {name, issuer, year, image_url}'
  },
  portfolio: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: 'Array of {title, description, image_url, year}'
  },
  service_areas: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  availability_schedule: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'e.g. {monday: ["09:00","18:00"], tuesday: ...}'
  },
  appointed_vendor_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Set when a vendor exclusively appoints this technician'
  },
  rejection_reason: {
    type: DataTypes.TEXT
  },
  admin_notes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'technician_profiles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = TechnicianProfile;
