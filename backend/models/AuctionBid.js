const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuctionBid = sequelize.define('AuctionBid', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  auction_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  bidder_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  bid_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  is_auto_bid: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  max_auto_bid: {
    type: DataTypes.DECIMAL(10, 2)
  }
}, {
  tableName: 'auction_bids',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = AuctionBid;
