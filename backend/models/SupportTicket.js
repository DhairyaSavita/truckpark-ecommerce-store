const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SupportTicket = sequelize.define('SupportTicket', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  order_id: {
    type: DataTypes.INTEGER
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  priority: {
    type: DataTypes.STRING,
    defaultValue: 'medium',
    validate: {
      isIn: [['low', 'medium', 'high', 'urgent']]
    }
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'open',
    validate: {
      isIn: [['open', 'in_progress', 'resolved', 'closed']]
    }
  },
  location: {
    type: DataTypes.JSONB,
    defaultValue: null
  },
  assigned_to: {
    type: DataTypes.INTEGER
  },
  resolution: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'support_tickets',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = SupportTicket;
