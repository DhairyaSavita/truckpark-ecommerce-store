const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TechnicianHireRequest = sequelize.define('TechnicianHireRequest', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  // Who is hiring
  requester_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'User (vendor/customer) who sent the hire request'
  },
  requester_type: {
    type: DataTypes.STRING,
    defaultValue: 'vendor',
    validate: { isIn: [['vendor', 'customer', 'admin']] },
    comment: 'Role type of requester'
  },

  // Who is being hired
  technician_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Technician user being hired'
  },

  // Job details
  service_type: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'e.g. Engine Repair, Brake System, Emergency Repair'
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  service_location: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  service_lat: {
    type: DataTypes.DECIMAL(10, 8)
  },
  service_lng: {
    type: DataTypes.DECIMAL(11, 8)
  },

  // Scheduling
  scheduled_date: {
    type: DataTypes.DATE
  },
  scheduled_time: {
    type: DataTypes.STRING
  },
  estimated_hours: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 1
  },

  // Financials
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
      isIn: [['pending', 'technician_accepted', 'technician_rejected',
               'admin_approved', 'admin_rejected',
               'in_progress', 'completed', 'cancelled', 'disputed']]
    }
  },
  technician_acceptance: {
    type: DataTypes.BOOLEAN,
    defaultValue: null,
    comment: 'null = not responded, true = accepted, false = rejected'
  },
  admin_approval: {
    type: DataTypes.BOOLEAN,
    defaultValue: null,
    comment: 'null = not reviewed, true = approved, false = rejected by admin'
  },
  requester_completion_approval: {
    type: DataTypes.BOOLEAN,
    defaultValue: null,
    comment: 'Vendor/customer confirms work is done'
  },

  // Notes / metadata
  technician_notes: {
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
    validate: { isIn: [['low', 'normal', 'high', 'emergency']] }
  },

  // Timestamps for lifecycle events
  technician_responded_at: {
    type: DataTypes.DATE
  },
  admin_reviewed_at: {
    type: DataTypes.DATE
  },
  work_started_at: {
    type: DataTypes.DATE
  },
  work_completed_at: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'technician_hire_requests',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = TechnicianHireRequest;
