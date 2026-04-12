const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ServiceReview = sequelize.define('ServiceReview', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  service_request_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  customer_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  technician_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  review: {
    type: DataTypes.TEXT
  },
  timeliness_rating: {
    type: DataTypes.INTEGER,
    validate: { min: 1, max: 5 }
  },
  quality_rating: {
    type: DataTypes.INTEGER,
    validate: { min: 1, max: 5 }
  },
  communication_rating: {
    type: DataTypes.INTEGER,
    validate: { min: 1, max: 5 }
  }
}, {
  tableName: 'service_reviews',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = ServiceReview;
