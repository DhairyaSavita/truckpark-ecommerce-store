const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SellerEarning = sequelize.define('SellerEarning', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  seller_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  commission: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  net_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending',
    validate: {
      isIn: [['pending', 'paid', 'failed']]
    }
  },
  paid_at: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'seller_earnings',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = SellerEarning;
