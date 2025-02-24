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
        });
        return response.data.token.token.value;
    } catch (error) {
        console.error('Authentication failed:', error.message);
        throw error;
    }
}

async function fetchWithParams(token, endpoint, params = {}) {
    try {
        const response = await axios.get(`${API_URL}/${endpoint}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            params: {
                pagesize: 100,
                ...params
            }
        });
        return response.data;
    } catch (error) {
        console.log(`Error fetching ${endpoint}:`, error.message);
        return null;
    }
}

async function exploreCustomerData() {
    try {
        console.log('🔍 Exploring Customer Data with Different Parameters...\n');
        const token = await authenticate();

        // Try different endpoints
        const endpoints = [
            'customer',
            'customer/active',
            'customer/group',
            'customer/type',
            'customer/status',
            'customer/category',
            'customergroup'
        ];

        // Try different parameter combinations
        const paramSets = [
            { isActive: true },
            { isActive: true, sort: '-lastChange' },
            { isDeleted: false },
            { isActive: true, isDeleted: false },
            { customerGroupNumber: 1 },
            { customerGroupNumber: 2 }
        ];

        // Check available API versions
        console.log('📚 Checking API Versions...');
        const apiInfo = await fetchWithParams(token, '');
        if (apiInfo) {
            console.log('Available API versions:', apiInfo);
        }

        // Try each endpoint
        for (const endpoint of endpoints) {
            console.log(`\n🔍 Trying endpoint: /${endpoint}`);
            console.log('='.repeat(50));

            const data = await fetchWithParams(token, endpoint);
            if (data) {
                console.log(`✅ Endpoint available`);
                console.log(`Records found: ${Array.isArray(data) ? data.length : 'N/A'}`);
                
                if (Array.isArray(data) && data.length > 0) {
                    const sample = data[0];
                    console.log('\nSample data fields:', Object.keys(sample).join(', '));
                }
            } else {
                console.log('❌ Endpoint not available');
            }
        }

        // Try each parameter combination on the main customer endpoint
        console.log('\n🔍 Testing Different Parameters on /customer endpoint');
        console.log('='.repeat(50));

        for (const params of paramSets) {
            console.log(`\nTrying parameters:`, params);
            const data = await fetchWithParams(token, 'customer', params);
            
            if (data && Array.isArray(data)) {
                console.log(`Found ${data.length} records`);
                
                if (data.length > 0) {
                    // Count active customers
                    const activeCount = data.filter(c => c.isActive).length;
                    console.log(`Active customers: ${activeCount}`);
                    
                    // Show sample of first active customer if exists
                    const firstActive = data.find(c => c.isActive);
                    if (firstActive) {
                        console.log('\nSample Active Customer:');
                        console.log(`Name: ${firstActive.salutation || ''} ${firstActive.firstName || ''} ${firstActive.lastName || ''}`);
                        console.log(`Customer #: ${firstActive.number}`);
                        console.log(`Status: ${firstActive.isActive ? '🟢 Active' : '🔴 Inactive'}`);
                        console.log(`Last Modified: ${new Date(firstActive.lastChange).toLocaleString()}`);
                    }
                }
            }
        }

        // Try pagination to get more records
        console.log('\n📑 Testing Pagination...');
        console.log('='.repeat(50));

        let allCustomers = [];
        let page = 1;
        let hasMore = true;

        while (hasMore && page <= 5) { // Limit to 5 pages for safety
            const data = await fetchWithParams(token, 'customer', { 
                page,
                pagesize: 100,
                isDeleted: false
            });

            if (data && Array.isArray(data) && data.length > 0) {
                allCustomers = allCustomers.concat(data);
                console.log(`Page ${page}: Found ${data.length} records`);
                page++;
            } else {
                hasMore = false;
            }
        }

        console.log(`\nTotal customers found across pages: ${allCustomers.length}`);
        const totalActive = allCustomers.filter(c => c.isActive).length;
        console.log(`Total active customers: ${totalActive}`);

        // Summary
        console.log('\n📋 Summary of Findings:');
        console.log('='.repeat(50));
        console.log(`• Total endpoints tested: ${endpoints.length}`);
        console.log(`• Working endpoints: ${endpoints.filter(e => fetchWithParams(token, e)).length}`);
        console.log(`• Total parameter combinations tested: ${paramSets.length}`);
        console.log(`• Total records found: ${allCustomers.length}`);
        console.log(`• Active customers found: ${totalActive}`);

    } catch (error) {
        console.error('Error in customer data exploration:', error.message);
    }
}

exploreCustomerData();
