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
  // Seller-specific fields
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

// Generate backup codes for 2FA
User.prototype.generateBackupCodes = function() {
  const codes = [];
  for (let i = 0; i < 10; i++) {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    codes.push(code);
  }
  this.two_factor_backup_codes = codes;
  return codes;
};

module.exports = User;
