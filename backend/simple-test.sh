#!/bin/bash

echo "=== Testing APIs ==="

# Login
echo "1. Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@truckparts.com","password":"admin123"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed"
  exit 1
fi
echo "✅ Login successful"

# Test order status update
echo -e "\n2. Testing order status update..."
curl -s -X PUT http://localhost:5001/api/orders/1/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"processing"}'
echo ""

# Test create ticket
echo -e "\n3. Testing create ticket..."
curl -s -X POST http://localhost:5001/api/support/tickets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"subject":"Test","message":"Test message","priority":"high"}'
echo ""

# Test get tickets
echo -e "\n4. Testing get tickets..."
curl -s -X GET http://localhost:5001/api/support/tickets/my-tickets \
  -H "Authorization: Bearer $TOKEN"
echo ""

# Test create booking
echo -e "\n5. Testing create booking..."
curl -s -X POST http://localhost:5001/api/installations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"product_id":1,"booking_date":"2024-12-25","booking_time":"10:00 AM","service_address":"123 Test St"}'
echo ""

# Test get bookings
echo -e "\n6. Testing get bookings..."
curl -s -X GET http://localhost:5001/api/installations/my-bookings \
  -H "Authorization: Bearer $TOKEN"
echo ""

echo -e "\n✅ All tests completed!"
