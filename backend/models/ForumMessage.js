const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ForumMessage = sequelize.define('ForumMessage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sender_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  receiver_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  is_read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  parent_id: {
    type: DataTypes.INTEGER,
    defaultValue: null
  }
}, {
  tableName: 'forum_messages',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = ForumMessage;
