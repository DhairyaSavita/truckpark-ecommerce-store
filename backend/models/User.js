const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'user',
    validate: {
      isIn: [['user', 'seller', 'admin']]
    }
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'active',
    validate: {
      isIn: [['active', 'blocked', 'suspended']]
    }
  },
  phone: {
    type: DataTypes.STRING
  },
  address: {
    type: DataTypes.TEXT
  },
  
  // Security fields
  is_email_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  email_verification_token: {
    type: DataTypes.STRING
  },
  password_reset_token: {
    type: DataTypes.STRING
  },
  password_reset_expires: {
    type: DataTypes.DATE
  },
  last_login: {
    type: DataTypes.DATE
  },
  last_login_ip: {
    type: DataTypes.STRING
  },
  login_attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lock_until: {
    type: DataTypes.DATE
  },
  
  // 2FA Fields
  two_factor_secret: {
    type: DataTypes.STRING,
    allowNull: true
  },
  two_factor_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  two_factor_backup_codes: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  
  // Seller fields
  store_name: {
    type: DataTypes.STRING
  },
  store_description: {
    type: DataTypes.TEXT
  },
  store_logo: {
    type: DataTypes.STRING
  },
  store_banner: {
    type: DataTypes.STRING
  },
  store_rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0
  },
  total_sales: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  is_approved: {
    type: DataTypes.BOOLEAN,
    defaultValue: null
  },
  rejection_reason: {
    type: DataTypes.TEXT
  },
  bank_account: {
    type: DataTypes.STRING
  },
  bank_name: {
    type: DataTypes.STRING
  },
  tax_id: {
    type: DataTypes.STRING
  },
  commission_rate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 10.00
  },
  
  // Technician fields
  is_technician: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  technician_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  technician_experience: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  technician_specialization: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  technician_license_number: {
    type: DataTypes.STRING
  },
  technician_rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0
  },
  technician_completed_jobs: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  technician_hourly_rate: {
    type: DataTypes.DECIMAL(10, 2)
  },
  technician_service_radius: {
    type: DataTypes.INTEGER,
    defaultValue: 50
  },
  technician_available: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  technician_location_lat: {
    type: DataTypes.DECIMAL(10, 8)
  },
  technician_location_lng: {
    type: DataTypes.DECIMAL(11, 8)
  },
  technician_address: {
    type: DataTypes.TEXT
  },
  
  // Driver fields
  is_driver: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  driver_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  driver_license_number: {
    type: DataTypes.STRING
  },
  driver_license_expiry: {
    type: DataTypes.DATE
  },
  driver_experience_years: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  driver_rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0
  },
  driver_completed_trips: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  driver_hourly_rate: {
    type: DataTypes.DECIMAL(10, 2)
  },
  driver_daily_rate: {
    type: DataTypes.DECIMAL(10, 2)
  },
  driver_available: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  driver_current_location_lat: {
    type: DataTypes.DECIMAL(10, 8)
  },
  driver_current_location_lng: {
    type: DataTypes.DECIMAL(11, 8)
  },
  driver_home_city: {
    type: DataTypes.STRING
  },
  driver_preferred_routes: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  driver_vehicle_type: {
    type: DataTypes.STRING
  },
  driver_license_classes: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  driver_bio: {
    type: DataTypes.TEXT
  },
  driver_documents: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  
  // Logistics fields
  is_logistics: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  logistics_company_name: {
    type: DataTypes.STRING
  },
  logistics_gst_number: {
    type: DataTypes.STRING
  },
  logistics_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  logistics_rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0
  },
  logistics_total_shipments: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  logistics_vehicle_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  logistics_service_pincodes: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  logistics_insurance_available: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  logistics_tracking_available: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  logistics_website: {
    type: DataTypes.STRING
  },
  logistics_description: {
    type: DataTypes.TEXT
  },
  
  // Refurbisher fields
  is_refurbisher: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  refurbisher_company_name: {
    type: DataTypes.STRING
  },
  refurbisher_gst: {
    type: DataTypes.STRING
  },
  refurbisher_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  refurbisher_rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0
  },
  refurbisher_total_sales: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  refurbisher_warehouse_address: {
    type: DataTypes.TEXT
  },
  refurbisher_license_number: {
    type: DataTypes.STRING
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

User.prototype.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

User.prototype.incrementLoginAttempts = async function() {
  this.login_attempts += 1;
  if (this.login_attempts >= 5) {
    this.lock_until = new Date(Date.now() + 30 * 60 * 1000);
  }
  await this.save();
};

User.prototype.resetLoginAttempts = async function() {
  this.login_attempts = 0;
  this.lock_until = null;
  await this.save();
};

User.prototype.isLocked = function() {
  return this.lock_until && this.lock_until > new Date();
};

module.exports = User;
