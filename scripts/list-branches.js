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

async function listBranches() {
    try {
        console.log('🏪 Fetching All Branches...\n');
        const token = await authenticate();

        const response = await axios.get(`${API_URL}/branch`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            params: {
                pagesize: 100
            }
        });

        const branches = response.data;
        if (branches && branches.length > 0) {
            console.log(`Found ${branches.length} branches:\n`);
            
            branches.forEach(branch => {
                console.log(`Branch #${branch.number}:`);
                console.log(`• Name: ${branch.name1}${branch.name2 ? ' ' + branch.name2 : ''}`);
                console.log(`• Address: ${branch.street}, ${branch.zipCode} ${branch.city}`);
                console.log(`• Phone: ${branch.telephoneNumber}`);
                console.log(`• Status: ${branch.isActive ? '🟢 Active' : '🔴 Inactive'}`);
                if (branch.email) console.log(`• Email: ${branch.email}`);
                console.log('----------------------------------------\n');
            });
        } else {
            console.log('No branches found');
        }

    } catch (error) {
        console.error('Error fetching branches:', error.message);
    }
}

listBranches();
