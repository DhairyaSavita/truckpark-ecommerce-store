const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LogisticsProfile = sequelize.define('LogisticsProfile', {
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
  company_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  gst_number: {
    type: DataTypes.STRING
  },
  registration_number: {
    type: DataTypes.STRING
  },
  year_established: {
    type: DataTypes.INTEGER
  },
  vehicle_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  service_pincodes: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  insurance_available: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  tracking_available: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  website: {
    type: DataTypes.STRING
  },
  description: {
    type: DataTypes.TEXT
  },
  logo_url: {
    type: DataTypes.STRING
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0
  },
  total_shipments: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'logistics_profiles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = LogisticsProfile;
