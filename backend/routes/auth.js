const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken, verifyToken } = require('../config/auth');
const twoFactorService = require('../services/twoFactorService');
const { validationRules, loginLimiter, registerLimiter } = require('../config/security');

// Register
router.post('/register', registerLimiter, async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    
    if (!validationRules.email(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    if (!validationRules.password(password)) {
      return res.status(400).json({ 
        error: 'Password must be at least 8 characters with uppercase, lowercase, number and special character' 
      });
    }
    
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    const user = await User.create({
      name,
      email,
      password,
      phone,
      address,
      role: 'user',
      is_email_verified: true // Auto-verify for now
    });
    
    const token = generateToken(user);
    res.status(201).json({ 
      success: true,
      message: 'Registration successful',
      token, 
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password, twoFactorCode, backupCode } = req.body;
    const ip = req.ip;
    
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check if account is locked
    if (user.isLocked && user.isLocked()) {
      const minutesLeft = Math.ceil((user.lock_until - new Date()) / 60000);
      return res.status(403).json({ 
        error: `Account locked. Please try again after ${minutesLeft} minutes`,
        code: 'ACCOUNT_LOCKED'
      });
    }
    
    const isValid = await user.comparePassword(password);
    if (!isValid) {
      if (user.incrementLoginAttempts) await user.incrementLoginAttempts();
      const attemptsLeft = 5 - (user.login_attempts || 0);
      return res.status(401).json({ 
        error: `Invalid credentials. ${attemptsLeft} attempts remaining`,
        code: 'INVALID_CREDENTIALS'
      });
    }
    
    // Reset login attempts
    if (user.resetLoginAttempts) await user.resetLoginAttempts();
    
    // Check if 2FA is enabled
    if (user.two_factor_enabled) {
      if (!twoFactorCode && !backupCode) {
        return res.status(202).json({ 
          requiresTwoFactor: true,
          message: '2FA verification required',
          userId: user.id
        });
      }
      
      let is2FAValid = false;
      
      if (twoFactorCode) {
        is2FAValid = twoFactorService.verifyToken(user.two_factor_secret, twoFactorCode);
      } else if (backupCode) {
        is2FAValid = twoFactorService.verifyBackupCode(user.two_factor_backup_codes || [], backupCode);
        if (is2FAValid) {
          const updatedCodes = twoFactorService.removeUsedBackupCode(user.two_factor_backup_codes || [], backupCode);
          user.two_factor_backup_codes = updatedCodes;
          await user.save();
        }
      }
      
      if (!is2FAValid) {
        return res.status(401).json({ error: 'Invalid 2FA code', code: 'INVALID_2FA' });
      }
    }
    
    // Update last login info
    user.last_login = new Date();
    user.last_login_ip = ip;
    await user.save();
    
    const token = generateToken(user);
    
    res.json({ 
      success: true,
      token, 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        two_factor_enabled: user.two_factor_enabled
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Become Seller
router.post('/become-seller', verifyToken, async (req, res) => {
  try {
    const { store_name, store_description, bank_account, bank_name, tax_id } = req.body;
    
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.role === 'seller') {
      return res.status(400).json({ error: 'You are already a seller' });
    }
    
    if (!store_name || store_name.length < 3) {
      return res.status(400).json({ error: 'Store name must be at least 3 characters' });
    }
    
    user.store_name = store_name;
    user.store_description = store_description;
    user.bank_account = bank_account;
    user.bank_name = bank_name;
    user.tax_id = tax_id;
    user.role = 'seller';
    user.is_approved = false;
    await user.save();
    
    res.json({ 
      success: true,
      message: 'Seller application submitted successfully. Awaiting admin approval.',
      status: 'pending'
    });
  } catch (error) {
    console.error('Error in become seller:', error);
    res.status(500).json({ error: error.message });
  }
});

// Setup 2FA
router.post('/setup-2fa', verifyToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const secret = twoFactorService.generateSecret(user.email);
    const qrCode = await twoFactorService.generateQRCode(secret);
    const backupCodes = twoFactorService.generateBackupCodes();
    
    user.two_factor_secret = secret.base32;
    user.two_factor_backup_codes = backupCodes;
    await user.save();
    
    res.json({ 
      success: true,
      secret: secret.base32,
      qrCode,
      backupCodes,
      message: 'Scan QR code with Google Authenticator app'
    });
  } catch (error) {
    console.error('Error setting up 2FA:', error);
    res.status(500).json({ error: error.message });
  }
});

// Verify and enable 2FA
router.post('/verify-2fa', verifyToken, async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findByPk(req.user.id);
    
    if (!user || !user.two_factor_secret) {
      return res.status(400).json({ error: '2FA not set up' });
    }
    
    const isValid = twoFactorService.verifyToken(user.two_factor_secret, token);
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }
    
    user.two_factor_enabled = true;
    await user.save();
    
    res.json({ 
      success: true, 
      message: '2FA enabled successfully',
      backupCodes: user.two_factor_backup_codes
    });
  } catch (error) {
    console.error('Error verifying 2FA:', error);
    res.status(500).json({ error: error.message });
  }
});

// Disable 2FA
router.post('/disable-2fa', verifyToken, async (req, res) => {
  try {
    const { password, twoFactorCode } = req.body;
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    
    if (user.two_factor_enabled) {
      const is2FAValid = twoFactorService.verifyToken(user.two_factor_secret, twoFactorCode);
      if (!is2FAValid) {
        return res.status(401).json({ error: 'Invalid 2FA code' });
      }
    }
    
    user.two_factor_enabled = false;
    user.two_factor_secret = null;
    user.two_factor_backup_codes = [];
    await user.save();
    
    res.json({ success: true, message: '2FA disabled successfully' });
  } catch (error) {
    console.error('Error disabling 2FA:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get 2FA status
router.get('/2fa-status', verifyToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    res.json({ 
      enabled: user?.two_factor_enabled || false,
      hasBackupCodes: user?.two_factor_backup_codes && user.two_factor_backup_codes.length > 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify 2FA during login
router.post('/verify-2fa-login', async (req, res) => {
  try {
    const { userId, code, isBackupCode } = req.body;
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    let isValid = false;
    
    if (isBackupCode) {
      isValid = twoFactorService.verifyBackupCode(user.two_factor_backup_codes || [], code);
      if (isValid) {
        const updatedCodes = twoFactorService.removeUsedBackupCode(user.two_factor_backup_codes || [], code);
        user.two_factor_backup_codes = updatedCodes;
        await user.save();
      }
    } else {
      isValid = twoFactorService.verifyToken(user.two_factor_secret, code);
    }
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid verification code' });
    }
    
    const token = generateToken(user);
    res.json({ 
      success: true, 
      token,
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      } 
    });
  } catch (error) {
    console.error('2FA verification error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get current user
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password', 'two_factor_secret', 'email_verification_token', 'password_reset_token'] }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Logout
router.post('/logout', verifyToken, async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;
