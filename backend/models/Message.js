const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  seller_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  product_name: {
    type: DataTypes.STRING
  },
  product_id: {
    type: DataTypes.INTEGER
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'unread',
    validate: {
      isIn: [['unread', 'read']]
    }
  }
}, {
  tableName: 'messages',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = Message;
