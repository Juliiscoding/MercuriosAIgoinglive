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

async function testDateFormats() {
    try {
        const token = await authenticate();
        
        // Try different date formats
        const dateFormats = [
            new Date().toISOString(),
            new Date().toJSON(),
            new Date().toUTCString(),
            new Date().toLocaleDateString('de-DE'),
            '2025-02-24',
            '2025-02-24T00:00:00Z'
        ];

        console.log('🔍 Testing different date formats...\n');

        for (const dateFormat of dateFormats) {
            console.log(`\nTrying date format: ${dateFormat}`);
            try {
                const response = await axios.get(`${API_URL}/sale`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    params: {
                        pagesize: 1,
                        fromDate: dateFormat
                    }
                });

                console.log(`✅ Response received`);
                if (response.data && response.data.length > 0) {
                    const sale = response.data[0];
                    console.log(`Found sale from: ${sale.date}`);
                }
            } catch (error) {
                console.log(`❌ Error: ${error.message}`);
            }
        }

    } catch (error) {
        console.error('Error in test:', error.message);
    }
}

testDateFormats();
