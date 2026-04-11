const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authService = require('./authService');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, status: user.status },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const verifyToken = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided', code: 'NO_TOKEN' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if user exists and is not blocked
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User not found', code: 'USER_NOT_FOUND' });
    }
    
    if (user.status === 'blocked') {
      return res.status(403).json({ error: 'Your account has been blocked. Please contact admin.', code: 'ACCOUNT_BLOCKED' });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ error: 'Invalid token', code: 'INVALID_TOKEN' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required', code: 'ADMIN_REQUIRED' });
  }
  next();
};

const isSeller = (req, res, next) => {
  if (req.user.role !== 'seller' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Seller access required', code: 'SELLER_REQUIRED' });
  }
  next();
};

const requireEmailVerification = (req, res, next) => {
  if (!req.user.is_email_verified) {
    return res.status(403).json({ error: 'Please verify your email first', code: 'EMAIL_NOT_VERIFIED' });
  }
  next();
};

module.exports = { 
  generateToken, 
  verifyToken, 
  isAdmin, 
  isSeller, 
  requireEmailVerification 
};
