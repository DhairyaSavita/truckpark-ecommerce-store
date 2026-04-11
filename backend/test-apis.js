const axios = require('axios');

async function testAPIs() {
  try {
    // Login
    console.log('1. Logging in...');
    const loginRes = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'admin@truckparts.com',
      password: 'admin123'
    });
    const token = loginRes.data.token;
    console.log('✅ Login successful');
    
    // Test orders
    console.log('\n2. Testing orders...');
    const ordersRes = await axios.get('http://localhost:5001/api/orders/my-orders', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Found ${ordersRes.data.length} orders`);
    
    if (ordersRes.data.length > 0) {
      const orderId = ordersRes.data[0].id;
      console.log(`\n3. Testing order status update for order ${orderId}...`);
      try {
        const updateRes = await axios.put(`http://localhost:5001/api/orders/${orderId}/status`,
          { status: 'processing' },
          { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
        );
        console.log('✅ Order status updated:', updateRes.data.message);
      } catch (err) {
        console.log('❌ Order update error:', err.response?.data || err.message);
      }
    }
    
    // Test support tickets
    console.log('\n4. Testing support tickets...');
    const ticketsRes = await axios.get('http://localhost:5001/api/support/tickets/my-tickets', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Found ${ticketsRes.data.length} tickets`);
    
    // Test create ticket
    console.log('\n5. Creating new ticket...');
    const newTicket = await axios.post('http://localhost:5001/api/support/tickets',
      { subject: 'Test Ticket', message: 'This is a test', priority: 'high' },
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );
    console.log('✅ Ticket created:', newTicket.data.message);
    
    // Test bookings
    console.log('\n6. Testing bookings...');
    const bookingsRes = await axios.get('http://localhost:5001/api/installations/my-bookings', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Found ${bookingsRes.data.length} bookings`);
    
    console.log('\n✅ All API tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAPIs();
