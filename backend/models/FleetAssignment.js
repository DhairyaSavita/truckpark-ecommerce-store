const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FleetAssignment = sequelize.define('FleetAssignment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

  // The logistics partner managing this fleet
  logistics_id: { type: DataTypes.INTEGER, allowNull: false },

  // The driver being assigned
  driver_id: { type: DataTypes.INTEGER, allowNull: false },

  // Linked shipment request (optional — can pre-assign without shipment)
  shipment_id: { type: DataTypes.INTEGER, allowNull: true },

  // Route details (JSON: pickup, dropoff, waypoints, distance_km)
  route_details: { type: DataTypes.JSON },

  // Estimated arrival date/time
  eta: { type: DataTypes.DATE },

  // Actual start/end
  started_at: { type: DataTypes.DATE },
  completed_at: { type: DataTypes.DATE },

  // Assignment status
  status: {
    type: DataTypes.STRING,
    defaultValue: 'assigned',
    validate: { isIn: [['assigned', 'en_route', 'completed', 'cancelled', 'reassigned']] },
  },

  // Internal logistics notes
  notes: { type: DataTypes.TEXT },

  // Priority level
  priority: {
    type: DataTypes.STRING,
    defaultValue: 'normal',
    validate: { isIn: [['low', 'normal', 'high', 'emergency']] },
  },

  // Whether auto-scheduler created this
  is_auto_assigned: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  tableName: 'fleet_assignments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = FleetAssignment;
