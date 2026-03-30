const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProductReview = sequelize.define('ProductReview', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  user_id: {
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
  }
}, {
  tableName: 'product_reviews',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = ProductReview;
