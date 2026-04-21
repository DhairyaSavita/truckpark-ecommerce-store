const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DriverHireRequest = sequelize.define('DriverHireRequest', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  // Who is hiring
  requester_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'User (vendor/customer/admin) who sent the hire request'
  },
  requester_type: {
    type: DataTypes.STRING,
    defaultValue: 'vendor',
    validate: { isIn: [['vendor', 'customer', 'admin']] }
  },

  // Who is being hired
  driver_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Driver user being hired'
  },

  // Trip / Job details
  trip_type: {
    type: DataTypes.STRING,
    defaultValue: 'one_way',
    validate: { isIn: [['one_way', 'round_trip', 'multi_stop', 'dedicated', 'daily']] }
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  pickup_location: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  dropoff_location: {
    type: DataTypes.TEXT
  },
  pickup_lat: {
    type: DataTypes.DECIMAL(10, 8)
  },
  pickup_lng: {
    type: DataTypes.DECIMAL(11, 8)
  },
  dropoff_lat: {
    type: DataTypes.DECIMAL(10, 8)
  },
  dropoff_lng: {
    type: DataTypes.DECIMAL(11, 8)
  },

  // Scheduling
  trip_date: {
    type: DataTypes.DATE
  },
  trip_time: {
    type: DataTypes.STRING
  },
  estimated_days: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 1
  },
  estimated_distance_km: {
    type: DataTypes.DECIMAL(10, 2)
  },

  // Load / vehicle info
  cargo_type: {
    type: DataTypes.STRING
  },
  cargo_weight_tons: {
    type: DataTypes.DECIMAL(8, 2)
  },
  vehicle_type_required: {
    type: DataTypes.STRING
  },

  // Financials
  agreed_daily_rate: {
    type: DataTypes.DECIMAL(10, 2)
  },
  agreed_hourly_rate: {
    type: DataTypes.DECIMAL(10, 2)
  },
  estimated_cost: {
    type: DataTypes.DECIMAL(10, 2)
  },
  final_cost: {
    type: DataTypes.DECIMAL(10, 2)
  },
  payment_status: {
    type: DataTypes.STRING,
    defaultValue: 'pending',
    validate: { isIn: [['pending', 'paid', 'refunded', 'disputed']] }
  },

  // Approval / Status lifecycle
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending',
    validate: {
      isIn: [['pending', 'driver_accepted', 'driver_rejected',
               'admin_approved', 'admin_rejected',
               'in_progress', 'completed', 'cancelled', 'disputed']]
    }
  },
  driver_acceptance: {
    type: DataTypes.BOOLEAN,
    defaultValue: null,
    comment: 'null = not responded, true = accepted, false = rejected'
  },
  admin_approval: {
    type: DataTypes.BOOLEAN,
    defaultValue: null,
    comment: 'null = not reviewed, true = approved, false = rejected'
  },
  requester_completion_approval: {
    type: DataTypes.BOOLEAN,
    defaultValue: null,
    comment: 'Vendor/customer confirms trip is done'
  },

  // Notes
  driver_notes: {
    type: DataTypes.TEXT
  },
  requester_notes: {
    type: DataTypes.TEXT
  },
  admin_notes: {
    type: DataTypes.TEXT
  },
  rejection_reason: {
    type: DataTypes.TEXT
  },

  // Priority
  priority: {
    type: DataTypes.STRING,
    defaultValue: 'normal',
    validate: { isIn: [['low', 'normal', 'high', 'urgent']] }
  },

  // Lifecycle timestamps
  driver_responded_at: {
    type: DataTypes.DATE
  },
  admin_reviewed_at: {
    type: DataTypes.DATE
  },
  trip_started_at: {
    type: DataTypes.DATE
  },
  trip_completed_at: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'driver_hire_requests',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = DriverHireRequest;
