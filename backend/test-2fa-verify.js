const speakeasy = require('speakeasy');

// Your secret from the setup response
const secret = "LNTCC6TFMFBTSR3CIRAGI3JPHFBHSJKY";

// Generate current OTP
const otp = speakeasy.totp({
  secret: secret,
  encoding: 'base32'
});

console.log('Current OTP:', otp);
console.log('\nUse this OTP for verification');
