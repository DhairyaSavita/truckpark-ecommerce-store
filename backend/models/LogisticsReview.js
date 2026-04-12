const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LogisticsReview = sequelize.define('LogisticsReview', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  shipment_request_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  customer_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  logistics_id: {
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
  packaging_rating: {
    type: DataTypes.INTEGER,
    validate: { min: 1, max: 5 }
  },
  communication_rating: {
    type: DataTypes.INTEGER,
    validate: { min: 1, max: 5 }
  },
  value_rating: {
    type: DataTypes.INTEGER,
    validate: { min: 1, max: 5 }
  }
}, {
  tableName: 'logistics_reviews',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = LogisticsReview;
