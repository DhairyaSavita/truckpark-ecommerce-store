const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const VehicleCompatibility = sequelize.define('VehicleCompatibility', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  make: {
    type: DataTypes.STRING,
    allowNull: false
  },
  model: {
    type: DataTypes.STRING,
    allowNull: false
  },
  year_start: {
    type: DataTypes.INTEGER
  },
  year_end: {
    type: DataTypes.INTEGER
  },
  engine_type: {
    type: DataTypes.STRING
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'vehicle_compatibility',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = VehicleCompatibility;
