#!/bin/bash

echo "=== Complete 2FA Test ==="
echo ""

# Step 1: Login to get token (for setup)
echo "1. Getting initial token..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@truckparts.com","password":"admin123"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
  echo "✅ Got token"
else
  echo "❌ Failed to get token"
  exit 1
fi

# Step 2: Check if 2FA is enabled
echo ""
echo "2. Checking 2FA status..."
STATUS_RESPONSE=$(curl -s -X GET http://localhost:5001/api/auth/2fa-status \
  -H "Authorization: Bearer $TOKEN")

echo $STATUS_RESPONSE | python3 -m json.tool

# Step 3: Test login without 2FA
echo ""
echo "3. Testing login without 2FA (should require 2FA)..."
LOGIN_TEST=$(curl -s -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@truckparts.com","password":"admin123"}')

if echo $LOGIN_TEST | grep -q "requiresTwoFactor"; then
  echo "✅ 2FA is required - Working correctly!"
  USER_ID=$(echo $LOGIN_TEST | grep -o '"userId":[0-9]*' | cut -d':' -f2)
  echo "User ID: $USER_ID"
else
  echo "❌ 2FA not required"
fi

# Step 4: Generate OTP using Node.js
echo ""
echo "4. Generating OTP from secret..."
OTP=$(node -e "
const speakeasy = require('speakeasy');
const secret = 'LNTCC6TFMFBTSR3CIRAGI3JPHFBHSJKY';
const otp = speakeasy.totp({ secret: secret, encoding: 'base32' });
console.log(otp);
")

echo "Generated OTP: $OTP"

# Step 5: Verify with OTP
echo ""
echo "5. Verifying with OTP..."
VERIFY_RESPONSE=$(curl -s -X POST http://localhost:5001/api/auth/verify-2fa-login \
  -H "Content-Type: application/json" \
  -d "{\"userId\":$USER_ID,\"code\":\"$OTP\",\"isBackupCode\":false}")

if echo $VERIFY_RESPONSE | grep -q "success"; then
  echo "✅ 2FA verification successful!"
  NEW_TOKEN=$(echo $VERIFY_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
  echo "New token received: ${NEW_TOKEN:0:50}..."
else
  echo "❌ 2FA verification failed"
  echo $VERIFY_RESPONSE
fi

echo ""
echo "=== Test Complete ==="
