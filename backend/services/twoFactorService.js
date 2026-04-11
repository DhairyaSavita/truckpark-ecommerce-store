const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

class TwoFactorService {
  generateSecret(email) {
    const secret = speakeasy.generateSecret({
      name: `TruckPartsMarketplace:${email}`,
      length: 20,
    });
    return secret;
  }

  async generateQRCode(secret) {
    try {
      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
      return qrCodeUrl;
    } catch (error) {
      console.error('Error generating QR code:', error);
      return null;
    }
  }

  verifyToken(secret, token) {
    return speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 2,
    });
  }

  generateBackupCodes() {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  verifyBackupCode(backupCodes, inputCode) {
    return backupCodes.includes(inputCode);
  }

  removeUsedBackupCode(backupCodes, usedCode) {
    return backupCodes.filter(code => code !== usedCode);
  }
}

module.exports = new TwoFactorService();
