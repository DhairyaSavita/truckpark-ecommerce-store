const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Auction = sequelize.define('Auction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  seller_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  starting_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  current_price: {
    type: DataTypes.DECIMAL(10, 2)
  },
  reserve_price: {
    type: DataTypes.DECIMAL(10, 2)
  },
  bid_increment: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 100
  },
  start_time: {
    type: DataTypes.DATE,
    allowNull: false
  },
  end_time: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'scheduled'
  },
  winner_id: {
    type: DataTypes.INTEGER
  },
  winning_bid: {
    type: DataTypes.DECIMAL(10, 2)
  },
  total_bids: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'auctions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Auction;
