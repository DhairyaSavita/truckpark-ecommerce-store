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
    type: DataTypes.TEXT,
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  stock_quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  seller_id: {
    type: DataTypes.INTEGER,
    allowNull: true,  // Make optional for admin-added products
    defaultValue: 1   // Default to admin user
  },
  brand: {
    type: DataTypes.STRING
  },
  part_number: {
    type: DataTypes.STRING
  },
  image_url: {
    type: DataTypes.STRING
  },
  specifications: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  approval_status: {
    type: DataTypes.STRING,
    defaultValue: 'approved',  // Auto-approve for admin products
    validate: {
      isIn: [['pending', 'approved', 'rejected']]
    }
  },
  is_approved: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
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
