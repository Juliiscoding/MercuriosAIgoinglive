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

async function fetchCustomers() {
    try {
        const token = await authenticate();
        console.log('👥 Fetching Customer Data...\n');

        const response = await axios.get(`${API_URL}/customer`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            params: {
                pagesize: 100,
                sort: '-lastChange' // Sort by most recently changed
            }
        });

        const customers = response.data;
        
        // Basic statistics
        console.log('📊 Customer Data Overview:');
        console.log('='.repeat(50));
        console.log(`Total Customers Retrieved: ${customers.length}`);
        
        // Count active vs inactive customers
        const activeCustomers = customers.filter(c => c.isActive).length;
        console.log(`Active Customers: ${activeCustomers}`);
        console.log(`Inactive Customers: ${customers.length - activeCustomers}`);

        // Analyze date ranges
        const dates = customers
            .filter(c => c.lastChange)
            .map(c => new Date(c.lastChange));
        
        if (dates.length > 0) {
            const oldestDate = new Date(Math.min(...dates));
            const newestDate = new Date(Math.max(...dates));
            console.log(`\n📅 Date Range:`);
            console.log(`Oldest Record: ${oldestDate.toLocaleString()}`);
            console.log(`Newest Record: ${newestDate.toLocaleString()}`);
        }

        // Gender distribution
        const genderDist = customers.reduce((acc, c) => {
            const gender = c.gender === 1 ? 'Female' : c.gender === 2 ? 'Male' : 'Other/Unknown';
            acc[gender] = (acc[gender] || 0) + 1;
            return acc;
        }, {});

        console.log('\n👤 Gender Distribution:');
        Object.entries(genderDist).forEach(([gender, count]) => {
            console.log(`${gender}: ${count}`);
        });

        // City distribution
        const cities = customers.reduce((acc, c) => {
            if (c.city) {
                acc[c.city] = (acc[c.city] || 0) + 1;
            }
            return acc;
        }, {});

        console.log('\n🏙️ Top Cities:');
        Object.entries(cities)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .forEach(([city, count]) => {
                console.log(`${city}: ${count} customers`);
            });

        // Show 10 most recent customers
        console.log('\n🆕 10 Most Recent Customer Records:');
        console.log('='.repeat(50));
        
        const recentCustomers = [...customers]
            .sort((a, b) => new Date(b.lastChange) - new Date(a.lastChange))
            .slice(0, 10);

        recentCustomers.forEach((customer, index) => {
            console.log(`\n👤 Customer ${index + 1}:`);
            console.log(`Name: ${customer.salutation || ''} ${customer.firstName || ''} ${customer.lastName || ''}`);
            console.log(`Customer #: ${customer.number}`);
            if (customer.city) console.log(`Location: ${customer.zipCode || ''} ${customer.city}`);
            if (customer.email) console.log(`Email: ${customer.email}`);
            if (customer.telephone) console.log(`Phone: ${customer.telephone}`);
            console.log(`Last Modified: ${new Date(customer.lastChange).toLocaleString()}`);
            console.log(`Status: ${customer.isActive ? '🟢 Active' : '🔴 Inactive'}`);
            if (customer.customerGroupNumber) console.log(`Group: ${customer.customerGroupNumber}`);
            console.log('-'.repeat(30));
        });

        // Check for data authenticity indicators
        console.log('\n🔍 Data Authenticity Analysis:');
        console.log('='.repeat(50));

        // Check for email patterns
        const emailPattern = customers.filter(c => c.email).length;
        console.log(`• Customers with email addresses: ${emailPattern}`);

        // Check for phone number patterns
        const phonePattern = customers.filter(c => c.telephone).length;
        console.log(`• Customers with phone numbers: ${phonePattern}`);

        // Check for address completeness
        const addressComplete = customers.filter(c => c.street && c.city && c.zipCode).length;
        console.log(`• Customers with complete addresses: ${addressComplete}`);

        // Check for recent modifications
        const recentModifications = customers.filter(c => {
            const lastChange = new Date(c.lastChange);
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
            return lastChange > threeMonthsAgo;
        }).length;
        console.log(`• Records modified in last 3 months: ${recentModifications}`);

        console.log('\n📋 Conclusion:');
        const isLikelyReal = recentModifications > 0 && 
                            emailPattern > 0 && 
                            phonePattern > 0 && 
                            addressComplete > 0;

        if (isLikelyReal) {
            console.log('✅ Data appears to be REAL based on:');
            console.log('- Recent modifications');
            console.log('- Presence of valid contact information');
            console.log('- Complete address records');
            console.log('- Natural distribution of data');
        } else {
            console.log('❌ Data appears to be DEMO based on lack of:');
            console.log('- Recent modifications');
            console.log('- Valid contact information');
            console.log('- Complete address records');
        }

    } catch (error) {
        console.error('Error fetching customer data:', error.message);
        if (error.response) {
            console.error('Response:', error.response.data);
        }
    }
}

fetchCustomers();
