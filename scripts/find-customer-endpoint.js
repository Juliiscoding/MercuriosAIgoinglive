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

async function testEndpoint(token, endpoint) {
    try {
        const response = await axios.get(`${API_URL}/${endpoint}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            params: {
                pagesize: 100
            }
        });
        return response.data;
    } catch (error) {
        return null;
    }
}

async function findCustomerEndpoint() {
    try {
        console.log('🔍 Searching for Customer Data Endpoints...\n');
        const token = await authenticate();

        // List of potential endpoints to try
        const potentialEndpoints = [
            // Standard variations
            'customers',
            'client',
            'clients',
            'buyer',
            'buyers',
            'consumer',
            'consumers',
            'retail-customer',
            'retail-customers',
            'shop-customer',
            'shop-customers',
            
            // German variations (since it's a German system)
            'kunde',
            'kunden',
            'einzelkunde',
            'einzelkunden',
            'privatkunde',
            'privatkunden',
            
            // Business/specific customer types
            'b2c-customer',
            'b2c-customers',
            'retail-client',
            'retail-clients',
            'end-customer',
            'end-customers',
            
            // Related endpoints that might contain customer info
            'loyalty',
            'loyalty-customer',
            'loyalty-customers',
            'membership',
            'members',
            'bonus-card',
            'bonus-cards',
            'customer-card',
            'customer-cards',
            
            // Sales related
            'sales-customer',
            'sales-customers',
            'pos-customer',
            'pos-customers',
            
            // Nested endpoints
            'customer/retail',
            'customer/private',
            'customer/shop',
            'customer/card',
            'customer/loyalty',
            'customer/bonus'
        ];

        console.log('Testing potential endpoints...\n');

        for (const endpoint of potentialEndpoints) {
            process.stdout.write(`Testing /${endpoint}... `);
            const data = await testEndpoint(token, endpoint);
            
            if (data) {
                console.log('✅ FOUND!');
                console.log('='.repeat(50));
                
                if (Array.isArray(data)) {
                    console.log(`Records found: ${data.length}`);
                    
                    if (data.length > 0) {
                        // Analyze first record to see if it looks like customer data
                        const sample = data[0];
                        console.log('\nSample record fields:', Object.keys(sample).join(', '));
                        
                        // Check if this looks like actual customer data
                        const isLikelyCustomer = !sample.hasOwnProperty('isStaff') && 
                                               !sample.hasOwnProperty('jobTitle') &&
                                               !sample.hasOwnProperty('branchNumber');
                        
                        if (isLikelyCustomer) {
                            console.log('\n🎯 This looks like real customer data!');
                            
                            // Show sample of data
                            console.log('\nSample Customer Record:');
                            Object.entries(sample).forEach(([key, value]) => {
                                if (value && typeof value !== 'object') {
                                    console.log(`${key}: ${value}`);
                                }
                            });
                            
                            // If there are multiple records, show some statistics
                            if (data.length > 1) {
                                console.log('\nQuick Statistics:');
                                // Count records with actual purchases
                                const withPurchases = data.filter(r => r.lastPurchase || r.totalPurchases || r.revenue).length;
                                console.log(`Records with purchase history: ${withPurchases}`);
                                
                                // Check for recent activity
                                const recentRecords = data.filter(r => {
                                    const lastActivity = new Date(r.lastChange || r.lastPurchase || r.lastVisit);
                                    const threeMonthsAgo = new Date();
                                    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
                                    return lastActivity > threeMonthsAgo;
                                }).length;
                                console.log(`Records with recent activity: ${recentRecords}`);
                            }
                        } else {
                            console.log('❌ This appears to be different type of data');
                        }
                    }
                } else {
                    console.log('Endpoint returned non-array data:', typeof data);
                }
                console.log('='.repeat(50) + '\n');
            } else {
                console.log('❌');
            }
        }

        // Try to discover any other endpoints
        console.log('\n🔍 Checking for API documentation or endpoint discovery...');
        const discoveryEndpoints = [
            '',  // Root endpoint
            'api',
            'docs',
            'swagger',
            'openapi',
            'endpoints',
            'resources'
        ];

        for (const endpoint of discoveryEndpoints) {
            const data = await testEndpoint(token, endpoint);
            if (data) {
                console.log(`\nFound API information at /${endpoint}:`);
                console.log(JSON.stringify(data, null, 2));
            }
        }

    } catch (error) {
        console.error('Error in endpoint search:', error.message);
    }
}

findCustomerEndpoint();
