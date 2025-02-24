const axios = require('axios');

const AUTH_URL = 'https://auth.prohandel.cloud/api/v4';
const API_URL = 'https://linde.prohandel.de/api/v2';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '7e7c639358434c4fa215d4e3978739d0';
const API_SECRET = process.env.NEXT_PUBLIC_API_SECRET || '1cjnuux79d';

async function authenticate() {
    try {
        const response = await axios.post(`${AUTH_URL}/token`, {
            apiKey: API_KEY,
            secret: API_SECRET
        });
        return response.data.token.token.value;
    } catch (error) {
        console.error('Authentication failed:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        throw error;
    }
}

async function fetchBranchData() {
    try {
        console.log('Authenticating...');
        const token = await authenticate();
        console.log('Authentication successful\n');
        
        console.log('Fetching branch data...');
        const response = await axios.get(`${API_URL}/branch?pagesize=100`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const branches = response.data;
        
        if (!Array.isArray(branches)) {
            console.error('Unexpected API response format:', response.data);
            return;
        }

        console.log('\n=== Branch Overview ===\n');
        console.log(`Total Branches: ${branches.length}`);
        console.log(`Active Branches: ${branches.filter(b => b.isActive).length}`);
        console.log(`Physical Stores: ${branches.filter(b => !b.isWebshop).length}`);
        console.log(`Online Shops: ${branches.filter(b => b.isWebshop).length}`);
        
        console.log('\n=== Detailed Branch Information ===\n');
        
        branches.forEach((branch, index) => {
            console.log(`Branch #${index + 1}`);
            console.log(`Name: ${branch.name1}${branch.name2 ? ' ' + branch.name2 : ''}${branch.name3 ? ' ' + branch.name3 : ''}`);
            console.log(`Branch Number: ${branch.number}`);
            console.log(`Type: ${branch.isWebshop ? 'Online Shop' : 'Physical Store'}`);
            console.log(`Location: ${branch.street}, ${branch.zipCode} ${branch.city}, ${branch.countryNumber}`);
            console.log(`Status: ${branch.isActive ? 'Active' : 'Inactive'}`);
            console.log(`Contact:`);
            console.log(`  - Phone: ${branch.telephoneNumber || 'N/A'}`);
            console.log(`  - Email: ${branch.email || 'N/A'}`);
            console.log(`  - Fax: ${branch.fax || 'N/A'}`);
            if (branch.openMonday || branch.openTuesday || branch.openWednesday || 
                branch.openThursday || branch.openFriday || branch.openSaturday || branch.openSunday) {
                console.log('Opening Hours:');
                if (branch.openMonday) console.log(`  - Monday: ${branch.openMonday}`);
                if (branch.openTuesday) console.log(`  - Tuesday: ${branch.openTuesday}`);
                if (branch.openWednesday) console.log(`  - Wednesday: ${branch.openWednesday}`);
                if (branch.openThursday) console.log(`  - Thursday: ${branch.openThursday}`);
                if (branch.openFriday) console.log(`  - Friday: ${branch.openFriday}`);
                if (branch.openSaturday) console.log(`  - Saturday: ${branch.openSaturday}`);
                if (branch.openSunday) console.log(`  - Sunday: ${branch.openSunday}`);
            }
            console.log(`Last Updated: ${new Date(branch.lastChange).toLocaleString()}`);
            console.log('-'.repeat(50));
        });

    } catch (error) {
        console.error('Error fetching branch data:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

fetchBranchData();
