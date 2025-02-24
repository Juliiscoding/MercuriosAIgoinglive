const axios = require('axios');

const AUTH_URL = 'https://auth.prohandel.cloud/api/v4';
const API_URL = 'https://linde.prohandel.de/api/v2';
const API_KEY = '7e7c639358434c4fa215d4e3978739d0';
const API_SECRET = '1cjnuux79d';

async function authenticate() {
    try {
        const response = await axios.post(`${AUTH_URL}/token`, {
            apiKey: API_KEY,
            secret: API_SECRET
        }, {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data.token.token.value;
    } catch (error) {
        console.error('Authentication failed:', error.message);
        throw error;
    }
}

async function makeRequest(endpoint, params = {}) {
    try {
        const token = await authenticate();
        const queryString = new URLSearchParams(params).toString();
        const url = `${API_URL}/${endpoint}${queryString ? '?' + queryString : ''}`;
        
        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        return response.data;
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error.message);
        return null;
    }
}

async function testEndpoints() {
    console.log('🔍 Testing ProHandel API Endpoints\n');

    // 1. Articles
    console.log('📦 Testing Articles endpoint...');
    const articles = await makeRequest('article', { pagesize: 5 });
    if (articles) {
        console.log('✅ Articles retrieved successfully');
        console.log('Sample article:', articles[0]);
    }
    console.log('\n-------------------\n');

    // 2. Customers
    console.log('👥 Testing Customers endpoint...');
    const customers = await makeRequest('customer', { pagesize: 5 });
    if (customers) {
        console.log('✅ Customers retrieved successfully');
        console.log('Sample customer:', customers[0]);
    }
    console.log('\n-------------------\n');

    // 3. Branches
    console.log('🏪 Testing Branches endpoint...');
    const branches = await makeRequest('branch', { pagesize: 5 });
    if (branches) {
        console.log('✅ Branches retrieved successfully');
        console.log('Sample branch:', branches[0]);
    }
    console.log('\n-------------------\n');

    // 4. Recent Sales
    console.log('💰 Testing Sales endpoint...');
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 7); // Last 7 days
    const sales = await makeRequest('sale', { 
        pagesize: 5,
        fromDate: fromDate.toISOString()
    });
    if (sales) {
        console.log('✅ Sales retrieved successfully');
        console.log('Sample sale:', sales[0]);
    }
    console.log('\n-------------------\n');

    // 5. Categories
    console.log('📑 Testing Categories endpoint...');
    const categories = await makeRequest('category', { pagesize: 5 });
    if (categories) {
        console.log('✅ Categories retrieved successfully');
        console.log('Sample category:', categories[0]);
    }
    console.log('\n-------------------\n');

    // 6. Staff
    console.log('👤 Testing Staff endpoint...');
    const staff = await makeRequest('staff', { pagesize: 5 });
    if (staff) {
        console.log('✅ Staff retrieved successfully');
        console.log('Sample staff member:', staff[0]);
    }
    console.log('\n-------------------\n');

    // 7. Suppliers
    console.log('🏭 Testing Suppliers endpoint...');
    const suppliers = await makeRequest('supplier', { pagesize: 5 });
    if (suppliers) {
        console.log('✅ Suppliers retrieved successfully');
        console.log('Sample supplier:', suppliers[0]);
    }
}

testEndpoints().catch(console.error);
