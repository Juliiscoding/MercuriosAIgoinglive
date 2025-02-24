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

async function discoverApiDocs() {
    try {
        console.log('🔍 Attempting to discover API documentation...\n');
        const token = await authenticate();

        // Common documentation endpoints
        const docEndpoints = [
            '',              // Root endpoint
            'swagger',       // Swagger documentation
            'swagger.json',
            'openapi',       // OpenAPI documentation
            'openapi.json',
            'docs',          // General documentation
            'api-docs',
            'documentation',
            'help',
            'schema',        // API schema
            'metadata',      // API metadata
            'info',          // API information
            'version',       // Version information
            'endpoints',     // List of endpoints
            'resources'      // Available resources
        ];

        // Try different HTTP methods
        const methods = ['GET', 'OPTIONS', 'HEAD'];

        console.log('Testing documentation endpoints...\n');

        for (const endpoint of docEndpoints) {
            console.log(`\nChecking /${endpoint}`);
            console.log('='.repeat(50));

            for (const method of methods) {
                try {
                    const response = await axios({
                        method: method,
                        url: `${API_URL}/${endpoint}`,
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                            'Accept': 'application/json, application/xml, text/plain, */*'
                        }
                    });

                    console.log(`${method}: ✅ (${response.status})`);
                    
                    // Check response headers for useful information
                    const relevantHeaders = [
                        'content-type',
                        'api-version',
                        'api-supported-versions',
                        'x-powered-by',
                        'server'
                    ];

                    const headers = response.headers;
                    const usefulHeaders = {};
                    relevantHeaders.forEach(header => {
                        if (headers[header]) {
                            usefulHeaders[header] = headers[header];
                        }
                    });

                    if (Object.keys(usefulHeaders).length > 0) {
                        console.log('Useful Headers:', usefulHeaders);
                    }

                    // If we got a response body, analyze it
                    if (response.data) {
                        if (typeof response.data === 'object') {
                            console.log('Response Data Structure:');
                            console.log(JSON.stringify(response.data, null, 2));
                        } else {
                            console.log('Response received but not JSON');
                        }
                    }

                } catch (error) {
                    if (error.response) {
                        console.log(`${method}: ❌ (${error.response.status})`);
                    } else {
                        console.log(`${method}: ❌ (Network error)`);
                    }
                }
            }
        }

        // Try to discover available endpoints through OPTIONS request
        console.log('\n🔍 Checking for API capabilities...');
        try {
            const optionsResponse = await axios({
                method: 'OPTIONS',
                url: API_URL,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (optionsResponse.headers['allow']) {
                console.log('\nAllowed Methods:', optionsResponse.headers['allow']);
            }
            
            if (optionsResponse.data) {
                console.log('OPTIONS Response:', optionsResponse.data);
            }
        } catch (error) {
            console.log('OPTIONS request failed');
        }

        // Try to get API version information
        console.log('\n📚 Checking API versions...');
        try {
            const response = await axios.get(`${API_URL}/version`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.data) {
                console.log('Version Information:', response.data);
            }
        } catch (error) {
            console.log('Version endpoint not available');
        }

    } catch (error) {
        console.error('Error in API discovery:', error.message);
    }
}

discoverApiDocs();
