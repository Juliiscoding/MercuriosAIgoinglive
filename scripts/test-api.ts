import axios from 'axios';

const BASE_URL = 'https://linde.prohandel.de/v1';
const API_KEY = '7e7c639358434c4fa215d4e3978739d0';

async function testApiConnection() {
  const api = axios.create({
    baseURL: BASE_URL,
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      'X-API-Password': '1cjnuux79d'
    },
  });

  console.log('🔍 Testing ProHandel API Connection...\n');

  try {
    // Test endpoints one by one
    const endpoints = [
      { name: 'Sales', path: '/sales' },
      { name: 'Branches', path: '/branches' },
      { name: 'Articles', path: '/articles' },
      { name: 'Customers', path: '/customers' }
    ];

    for (const endpoint of endpoints) {
      console.log(`Testing ${endpoint.name} endpoint...`);
      try {
        const response = await api.get(endpoint.path);
        console.log(`✅ ${endpoint.name}: Success`);
        console.log(`   Records found: ${response.data.length || 0}`);
        console.log(`   Sample data: `, response.data[0] || 'No data');
        console.log();
      } catch (error: any) {
        console.log(`❌ ${endpoint.name}: Failed`);
        console.log(`   Error: ${error.response?.data?.message || error.message}`);
        console.log();
      }
    }

    // Test WebSocket connection
    console.log('Testing WebSocket connection...');
    const ws = new WebSocket('wss://linde.prohandel.de/v1/ws');
    
    ws.onopen = () => {
      console.log('✅ WebSocket: Connected successfully');
      ws.close();
    };

    ws.onerror = (error) => {
      console.log('❌ WebSocket: Connection failed');
      console.log(`   Error: ${error}`);
    };

  } catch (error: any) {
    console.error('❌ API Connection Failed');
    console.error(`Error: ${error.response?.data?.message || error.message}`);
  }
}

testApiConnection();
