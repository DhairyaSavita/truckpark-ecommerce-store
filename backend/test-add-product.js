const axios = require('axios');

async function testAddProduct() {
  try {
    // First login as seller
    console.log('Logging in as seller...');
    const loginRes = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'seller@test.com', // Replace with your seller email
      password: 'seller123'
    });
    
    const token = loginRes.data.token;
    console.log('Login successful, token obtained');
    
    // Add a product
    console.log('\nAdding product...');
    const productData = {
      name: 'Test Product',
      description: 'This is a test product',
      price: 99.99,
      stock_quantity: 10,
      category_id: 1,
      brand: 'Test Brand',
      part_number: 'TEST-001',
      image_url: 'https://via.placeholder.com/300',
      specifications: { test: 'value' }
    };
    
    const addRes = await axios.post('http://localhost:5001/api/seller/products', productData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Product added successfully:', addRes.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testAddProduct();
