const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

class TwoFactorService {
  // Generate 2FA secret
  generateSecret(email) {
    const secret = speakeasy.generateSecret({
      name: `TruckPartsMarketplace:${email}`,
      length: 20,
    });
    return secret;
  }

  // Generate QR Code for Google Authenticator
  async generateQRCode(secret) {
    try {
      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
      return qrCodeUrl;
    } catch (error) {
      console.error('Error generating QR code:', error);
      return null;
    }
  }

  // Verify 2FA token
  verifyToken(secret, token) {
    return speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 2,
    });
  }

  // Generate backup codes
  generateBackupCodes() {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  // Verify backup code
  verifyBackupCode(backupCodes, inputCode) {
    return backupCodes.includes(inputCode);
  }

  // Remove used backup code
  removeUsedBackupCode(backupCodes, usedCode) {
    return backupCodes.filter(code => code !== usedCode);
  }
}

module.exports = new TwoFactorService();
