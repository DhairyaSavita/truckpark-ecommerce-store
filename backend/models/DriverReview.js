const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DriverReview = sequelize.define('DriverReview', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  trip_request_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  customer_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  driver_id: {
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
  punctuality_rating: {
    type: DataTypes.INTEGER,
    validate: { min: 1, max: 5 }
  },
  driving_skill_rating: {
    type: DataTypes.INTEGER,
    validate: { min: 1, max: 5 }
  },
  communication_rating: {
    type: DataTypes.INTEGER,
    validate: { min: 1, max: 5 }
  }
}, {
  tableName: 'driver_reviews',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = DriverReview;
