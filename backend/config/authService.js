const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

class AuthService {
  constructor() {
    this.JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-this';
    this.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
    this.JWT_EXPIRY = '7d';
    this.JWT_REFRESH_EXPIRY = '30d';
  }

  // Generate JWT tokens
  generateTokens(user) {
    const accessToken = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        status: user.status 
      },
      this.JWT_SECRET,
      { expiresIn: this.JWT_EXPIRY }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      this.JWT_REFRESH_SECRET,
      { expiresIn: this.JWT_REFRESH_EXPIRY }
    );

    return { accessToken, refreshToken };
  }

  // Verify access token
  verifyAccessToken(token) {
    try {
      return jwt.verify(token, this.JWT_SECRET);
    } catch (error) {
      return null;
    }
  }

  // Verify refresh token
  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, this.JWT_REFRESH_SECRET);
    } catch (error) {
      return null;
    }
  }

  // Generate password reset token
  generatePasswordResetToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Generate email verification token
  generateEmailVerificationToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Generate 2FA secret
  generate2FASecret(email) {
    const secret = speakeasy.generateSecret({
      name: `TruckPartsMarketplace:${email}`,
      length: 20,
    });
    return secret;
  }

  // Verify 2FA token
  verify2FAToken(secret, token) {
    return speakeasy.totp.verify({
      secret: secret.base32,
      encoding: 'base32',
      token: token,
      window: 2,
    });
  }

  // Generate 2FA QR Code
  async generate2FAQRCode(secret) {
    try {
      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
      return qrCodeUrl;
    } catch (error) {
      console.error('Error generating QR code:', error);
      return null;
    }
  }

  // Hash IP address for session tracking
  hashIP(ip) {
    return crypto.createHash('sha256').update(ip + this.JWT_SECRET).digest('hex');
  }

  // Generate CSRF token
  generateCSRFToken() {
    return crypto.randomBytes(32).toString('hex');
  }
}

module.exports = new AuthService();
