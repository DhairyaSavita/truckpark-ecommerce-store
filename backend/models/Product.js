const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  stock_quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  category_id: {
    type: DataTypes.INTEGER
  },
  seller_id: {
    type: DataTypes.INTEGER,
    allowNull: true,  // Temporarily allow NULL
    defaultValue: 1
  },
  image_url: {
    type: DataTypes.TEXT
  },
  brand: {
    type: DataTypes.STRING
  },
  part_number: {
    type: DataTypes.STRING,
    unique: true
  },
  specifications: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  is_approved: {
    type: DataTypes.BOOLEAN,
    defaultValue: true  // Auto-approve for now
  },
  approval_status: {
    type: DataTypes.STRING,
    defaultValue: 'approved'
  },
  rejection_reason: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'products',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Product;
