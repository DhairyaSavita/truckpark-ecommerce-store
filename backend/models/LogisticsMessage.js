const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * LogisticsMessage
 *
 * Stores messages between logistics partners and vendors.
 * This is a SEPARATE table from the general Message table so that
 * the logistics communication channel is fully isolated and cannot
 * be accessed by sellers via any existing generic messaging endpoint.
 */
const LogisticsMessage = sequelize.define('LogisticsMessage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  sender_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'User who sent this message (logistics partner or admin)',
  },
  receiver_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'User who receives this message (vendor or logistics partner for replies)',
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  subject: {
    type: DataTypes.STRING,
    defaultValue: 'Transport Coordination',
  },
  shipment_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Optional reference to a ShipmentRequest for context',
  },
  is_read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'logistics_messages',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = LogisticsMessage;
