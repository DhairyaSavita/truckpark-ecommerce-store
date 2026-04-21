const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AppointmentSlot = sequelize.define('AppointmentSlot', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

  // Provider who owns this availability slot
  provider_id: { type: DataTypes.INTEGER, allowNull: false },

  // Role of the provider
  provider_role: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { isIn: [['technician', 'driver', 'refurbisher', 'logistics']] },
  },

  // Date and time of slot
  slot_date: { type: DataTypes.DATEONLY, allowNull: false },
  slot_time: { type: DataTypes.TIME, allowNull: false },

  // Duration in minutes
  duration_mins: { type: DataTypes.INTEGER, defaultValue: 60 },

  // Service offered in this slot
  service_type: { type: DataTypes.STRING }, // e.g. "Engine Repair", "Refurbishment", "Delivery"

  // Booking info
  is_booked: { type: DataTypes.BOOLEAN, defaultValue: false },
  booked_by:  { type: DataTypes.INTEGER, allowNull: true },  // user_id of booker

  // Status
  status: {
    type: DataTypes.STRING,
    defaultValue: 'available',
    validate: { isIn: [['available', 'booked', 'cancelled', 'completed', 'rescheduled']] },
  },

  // Booking details
  booking_notes:   { type: DataTypes.TEXT },
  location:        { type: DataTypes.STRING },
  booking_type:    { type: DataTypes.STRING }, // 'onsite', 'remote', 'pickup'

  // Pricing
  estimated_cost: { type: DataTypes.DECIMAL(10, 2) },

  // Cancellation / reschedule
  cancelled_at:   { type: DataTypes.DATE },
  cancel_reason:  { type: DataTypes.TEXT },
  rescheduled_to: { type: DataTypes.INTEGER }, // points to new AppointmentSlot id
}, {
  tableName: 'appointment_slots',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = AppointmentSlot;
