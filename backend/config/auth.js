const jwt = require('jsonwebtoken');
const User = require('../models/User');

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
      return res.status(403).json({ error: 'Your account has been blocked', code: 'ACCOUNT_BLOCKED' });
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
  console.log('Checking admin access - User role:', req.user?.role);
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required', code: 'ADMIN_REQUIRED' });
  }
  next();
};

const isSeller = (req, res, next) => {
  if (req.user?.role !== 'seller' && req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Seller access required', code: 'SELLER_REQUIRED' });
  }
  next();
};

/**
 * isLogistics — only verified logistics partners and admins pass.
 */
const isLogistics = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(401).json({ error: 'User not found' });
    if (req.user?.role === 'admin' || user.is_logistics) return next();
    return res.status(403).json({
      error: 'Logistics partner access required',
      code: 'LOGISTICS_REQUIRED',
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

/**
 * canContactLogistics
 *
 * Access rules for the logistics communication channel:
 *  ✅  Logistics partners  (is_logistics = true)  — full access, can initiate
 *  ✅  Admins              (role = 'admin')         — full access
 *  ✅  Drivers             (is_driver = true)       — coordination access
 *  ✅  Sellers/Vendors     (role = 'seller')        — CAN READ & REPLY to threads
 *                                                     where a logistics partner has
 *                                                     already contacted them, but
 *                                                     CANNOT initiate new conversations.
 *                                                     (enforced at route level)
 *  ❌  Plain customers     (role = 'user', no flags) — blocked entirely
 */
const canContactLogistics = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(401).json({ error: 'User not found' });

    // Admins always pass
    if (req.user?.role === 'admin') return next();

    // Logistics partners always pass
    if (user.is_logistics) return next();

    // Drivers always pass (they coordinate with logistics)
    if (user.is_driver) return next();

    // Sellers/Vendors: allowed to READ and REPLY to existing threads.
    // They cannot INITIATE — that restriction is enforced at POST / route level.
    if (req.user?.role === 'seller') return next();

    // Everyone else (plain 'user' with no special flags) is blocked
    return res.status(403).json({
      error: 'You do not have permission to access the logistics communication channel.',
      code: 'LOGISTICS_ACCESS_DENIED',
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

module.exports = { generateToken, verifyToken, isAdmin, isSeller, isLogistics, canContactLogistics };
