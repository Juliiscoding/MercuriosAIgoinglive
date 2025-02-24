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

function isLikelyDemoData(data, endpoint) {
    // Patterns that suggest demo data
    const indicators = {
        oldDates: false,
        repeatingPatterns: false,
        roundNumbers: false,
        limitedVariety: false,
        staticData: false
    };

    if (!Array.isArray(data) || data.length === 0) return false;

    // Check for old dates
    const dates = data
        .filter(item => item.date || item.lastChange)
        .map(item => new Date(item.date || item.lastChange));
    if (dates.length > 0) {
        const mostRecent = new Date(Math.max(...dates));
        const monthsOld = (new Date() - mostRecent) / (1000 * 60 * 60 * 24 * 30);
        indicators.oldDates = monthsOld > 6;
    }

    // Check for repeating patterns
    const stringifiedItems = data.map(item => JSON.stringify(item));
    const uniqueItems = new Set(stringifiedItems);
    indicators.repeatingPatterns = uniqueItems.size < data.length * 0.5;

    // Check for round numbers in monetary values
    if (endpoint === 'sale') {
        const prices = data.map(item => item.salePrice);
        indicators.roundNumbers = prices.some(price => price % 1 === 0 && price % 5 === 0);
    }

    // Check for limited variety in IDs or numbers
    const ids = new Set(data.map(item => item.id));
    indicators.limitedVariety = ids.size < data.length * 0.8;

    // Count true indicators
    const indicatorCount = Object.values(indicators).filter(Boolean).length;
    return {
        isDemoData: indicatorCount >= 2,
        indicators
    };
}

async function analyzeEndpoint(token, endpoint) {
    try {
        console.log(`\n🔍 Analyzing /${endpoint} endpoint`);
        console.log('='.repeat(50));

        const response = await axios.get(`${API_URL}/${endpoint}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            params: {
                pagesize: 100
            }
        });

        const data = response.data;
        if (!data || (Array.isArray(data) && data.length === 0)) {
            console.log('❌ No data returned');
            return;
        }

        // Basic data analysis
        console.log(`• Records found: ${data.length}`);
        
        // Check date ranges if available
        const dates = data
            .filter(item => item.date || item.lastChange)
            .map(item => new Date(item.date || item.lastChange));
        
        if (dates.length > 0) {
            const oldestDate = new Date(Math.min(...dates));
            const newestDate = new Date(Math.max(...dates));
            console.log(`• Date range: ${oldestDate.toLocaleDateString()} - ${newestDate.toLocaleDateString()}`);
        }

        // Analyze unique values
        const uniqueIds = new Set(data.map(item => item.id)).size;
        console.log(`• Unique IDs: ${uniqueIds}`);

        // Check for demo data indicators
        const demoAnalysis = isLikelyDemoData(data, endpoint);
        console.log('\n📊 Data Analysis:');
        console.log(`• Old dates detected: ${demoAnalysis.indicators.oldDates ? '⚠️ Yes' : '✅ No'}`);
        console.log(`• Repeating patterns: ${demoAnalysis.indicators.repeatingPatterns ? '⚠️ Yes' : '✅ No'}`);
        console.log(`• Round numbers: ${demoAnalysis.indicators.roundNumbers ? '⚠️ Yes' : '✅ No'}`);
        console.log(`• Limited variety: ${demoAnalysis.indicators.limitedVariety ? '⚠️ Yes' : '✅ No'}`);

        // Sample of recent data
        if (dates.length > 0) {
            const recentItems = [...data]
                .sort((a, b) => new Date(b.date || b.lastChange) - new Date(a.date || a.lastChange))
                .slice(0, 2);

            console.log('\n📝 Recent Data Sample:');
            recentItems.forEach((item, index) => {
                console.log(`\nItem ${index + 1}:`);
                Object.entries(item)
                    .filter(([key, value]) => value !== null && value !== '')
                    .forEach(([key, value]) => {
                        if (typeof value !== 'object') {
                            console.log(`   ${key}: ${value}`);
                        }
                    });
            });
        }

        // Conclusion
        console.log('\n📋 Conclusion:');
        if (demoAnalysis.isDemoData) {
            console.log('❌ Likely DEMO/MOCK data');
            console.log('Reasons:');
            if (demoAnalysis.indicators.oldDates) console.log('- Contains old dates');
            if (demoAnalysis.indicators.repeatingPatterns) console.log('- Contains repeating patterns');
            if (demoAnalysis.indicators.roundNumbers) console.log('- Contains suspicious round numbers');
            if (demoAnalysis.indicators.limitedVariety) console.log('- Limited data variety');
        } else {
            console.log('✅ Likely REAL data');
        }

        return {
            endpoint,
            isDemoData: demoAnalysis.isDemoData,
            recordCount: data.length,
            dateRange: dates.length > 0 ? {
                oldest: Math.min(...dates),
                newest: Math.max(...dates)
            } : null
        };

    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
        if (error.response?.status === 404) {
            console.log('Endpoint not found');
        }
        return null;
    }
}

async function analyzeAllEndpoints() {
    try {
        console.log('🔍 Analyzing All Available Endpoints\n');
        const token = await authenticate();

        const endpoints = [
            'sale',
            'article',
            'customer',
            'branch',
            'category',
            'staff',
            'supplier',
            'order',
            'stock',
            'price',
            'payment',
            'invoice',
            'delivery'
        ];

        const results = [];
        for (const endpoint of endpoints) {
            const result = await analyzeEndpoint(token, endpoint);
            if (result) {
                results.push(result);
            }
        }

        console.log('\n📊 SUMMARY OF ALL ENDPOINTS');
        console.log('='.repeat(50));
        
        console.log('\n🟢 Likely Real Data:');
        results
            .filter(r => !r.isDemoData)
            .forEach(r => console.log(`• /${r.endpoint}`));

        console.log('\n🔴 Likely Demo/Mock Data:');
        results
            .filter(r => r.isDemoData)
            .forEach(r => console.log(`• /${r.endpoint}`));

    } catch (error) {
        console.error('Error in analysis:', error.message);
    }
}

analyzeAllEndpoints();
