const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const B2BQuote = sequelize.define('B2BQuote', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  proposed_price: {
    type: DataTypes.DECIMAL(10, 2)
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending'
  },
  message: {
    type: DataTypes.TEXT
  },
  seller_response: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'b2b_quotes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = B2BQuote;
