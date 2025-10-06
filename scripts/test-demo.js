#!/usr/bin/env node

const axios = require('axios');

const API_BASE = process.env.API_URL || 'http://localhost:3000/api/v1';

async function testDemo() {
  console.log('🧪 Testing Card Management System Demo Scenarios\n');
  
  try {
    // Test 1: Login
    console.log('1️⃣ Testing login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      username: 'john.doe',
      password: 'demo123'
    });
    
    if (loginResponse.data.success) {
      console.log('✅ Login successful');
      const token = loginResponse.data.data.token;
      const headers = { Authorization: `Bearer ${token}` };
      
      // Test 2: Get cards
      console.log('\n2️⃣ Testing card retrieval...');
      const cardsResponse = await axios.get(`${API_BASE}/cards`, { headers });
      console.log(`✅ Found ${cardsResponse.data.data.length} cards`);
      
      // Test 3: Get transactions
      console.log('\n3️⃣ Testing transaction retrieval...');
      const transactionsResponse = await axios.get(`${API_BASE}/transactions`, { headers });
      console.log(`✅ Found ${transactionsResponse.data.data.length} transactions`);
      
      // Test 4: Get alerts
      console.log('\n4️⃣ Testing alerts retrieval...');
      const alertsResponse = await axios.get(`${API_BASE}/notifications/alerts`, { headers });
      console.log(`✅ Found ${alertsResponse.data.data.length} alerts`);
      
      // Test 5: Health check
      console.log('\n5️⃣ Testing health check...');
      const healthResponse = await axios.get('http://localhost:3000/health');
      console.log('✅ Health check passed');
      
      console.log('\n🎉 All demo scenarios passed!');
      console.log('\n📱 You can now access:');
      console.log('   Frontend: http://localhost:5173');
      console.log('   API Docs: http://localhost:3000/api-docs');
      console.log('   Health: http://localhost:3000/health');
      
    } else {
      console.log('❌ Login failed');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

// Run tests
testDemo();
