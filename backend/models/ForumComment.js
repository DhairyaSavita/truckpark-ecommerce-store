const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ForumComment = sequelize.define('ForumComment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  post_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'forum_comments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = ForumComment;
