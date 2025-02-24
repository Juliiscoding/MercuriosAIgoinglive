const axios = require('axios');

const AUTH_URL = 'https://auth.prohandel.cloud/api/v4';
const API_URL = 'https://linde.prohandel.de/api/v2';
const API_KEY = '7e7c639358434c4fa215d4e3978739d0';
const API_SECRET = '1cjnuux79d';

// Top customer IDs we want to look up
const TARGET_CUSTOMERS = [
    '2011132', '2009456', '2008746', '2012022', '2003015',
    '2009157', '2015293', '2000147', '2017382', '2000635'
];

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

async function tryEndpoint(token, endpoint, customerId = null) {
    try {
        const url = `${API_URL}/${endpoint}${customerId ? `/${customerId}` : ''}`;
        console.log(`Trying: ${url}`);
        
        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        return {
            success: true,
            endpoint,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            endpoint,
            error: error.response?.status || error.message
        };
    }
}

async function exploreCustomerEndpoints() {
    try {
        console.log('🔍 Exploring Customer API Endpoints...\n');
        const token = await authenticate();

        // List of endpoint patterns to try
        const baseEndpoints = [
            'customer',
            'customers',
            'kunde',
            'kunden',
            'retail-customer',
            'retail-customers',
            'shop-customer',
            'shop-customers',
            'user',
            'users',
            'profile',
            'profiles',
            'member',
            'members',
            'account',
            'accounts'
        ];

        // Additional language variations
        const languageVariations = [
            '', // default
            '/de',
            '/en',
            '/de-DE',
            '/en-US'
        ];

        // API version variations
        const versionVariations = [
            '', // current path
            'v1',
            'v2',
            'v3',
            'api/v1',
            'api/v2',
            'api/v3'
        ];

        console.log('1. Trying to list all customers...');
        console.log('='.repeat(50));

        for (const version of versionVariations) {
            for (const base of baseEndpoints) {
                for (const lang of languageVariations) {
                    const endpoint = [version, base, lang].filter(Boolean).join('/');
                    const result = await tryEndpoint(token, endpoint);
                    
                    if (result.success) {
                        console.log(`\n✅ Success with endpoint: ${endpoint}`);
                        console.log('Sample data:', JSON.stringify(result.data).slice(0, 200) + '...');
                    }
                }
            }
        }

        console.log('\n2. Trying to fetch specific customer details...');
        console.log('='.repeat(50));

        // Try different endpoint patterns for each customer
        for (const customerId of TARGET_CUSTOMERS) {
            console.log(`\nLooking up Customer #${customerId}:`);
            
            for (const version of versionVariations) {
                for (const base of baseEndpoints) {
                    for (const lang of languageVariations) {
                        const endpoint = [version, base, lang].filter(Boolean).join('/');
                        const result = await tryEndpoint(token, endpoint, customerId);
                        
                        if (result.success) {
                            console.log(`\n✅ Success with endpoint: ${endpoint}`);
                            console.log('Customer data found:');
                            const data = result.data;
                            
                            // Try to extract relevant fields, handling different possible structures
                            const possibleFields = [
                                'name', 'fullName', 'firstName', 'lastName',
                                'email', 'phone', 'address',
                                'Name', 'FullName', 'FirstName', 'LastName',
                                'customerName', 'CustomerName',
                                'vorname', 'nachname', 'kunde_name'
                            ];
                            
                            for (const field of possibleFields) {
                                if (data[field]) {
                                    console.log(`• ${field}: ${data[field]}`);
                                }
                            }
                            
                            // Try to handle nested structures
                            const nestedFields = ['profile', 'details', 'contact', 'info', 'data'];
                            for (const nested of nestedFields) {
                                if (data[nested]) {
                                    for (const field of possibleFields) {
                                        if (data[nested][field]) {
                                            console.log(`• ${nested}.${field}: ${data[nested][field]}`);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        console.log('\n3. Trying alternative approaches...');
        console.log('='.repeat(50));

        // Try to find customer info in related endpoints
        const relatedEndpoints = [
            'orders',
            'invoices',
            'transactions',
            'sales',
            'bookings'
        ];

        for (const endpoint of relatedEndpoints) {
            console.log(`\nChecking ${endpoint} for customer details...`);
            const result = await tryEndpoint(token, endpoint);
            
            if (result.success && Array.isArray(result.data)) {
                const relevantData = result.data.filter(item => 
                    TARGET_CUSTOMERS.includes(String(item.customerNumber)) ||
                    TARGET_CUSTOMERS.includes(String(item.customerId))
                );
                
                if (relevantData.length > 0) {
                    console.log(`Found ${relevantData.length} relevant records in ${endpoint}`);
                    relevantData.forEach(item => {
                        const customerId = item.customerNumber || item.customerId;
                        console.log(`\nCustomer #${customerId}:`);
                        Object.entries(item).forEach(([key, value]) => {
                            if (typeof value === 'string' || typeof value === 'number') {
                                console.log(`• ${key}: ${value}`);
                            }
                        });
                    });
                }
            }
        }

    } catch (error) {
        console.error('Error exploring endpoints:', error.message);
    }
}

exploreCustomerEndpoints();
