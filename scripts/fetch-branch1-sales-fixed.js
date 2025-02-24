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

async function fetchBranch1Sales() {
    try {
        const token = await authenticate();
        
        // First get branch info
        const branchInfo = {
            name: 'I. G.von der Linde GmbH & CoKG',
            address: 'An der Christuskirche 17, 30167 Hannover',
            phone: '0511/36 606 0',
            email: 'neu00511323278'
        };

        console.log('📍 Branch Information:');
        console.log(`Name: ${branchInfo.name}`);
        console.log(`Address: ${branchInfo.address}`);
        console.log(`Phone: ${branchInfo.phone}`);
        console.log(`Email: ${branchInfo.email}`);
        console.log('----------------------------------------\n');

        // Fetch sales with branch filter
        const response = await axios.get(`${API_URL}/sale`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            params: {
                pagesize: 100,
                branch: 1  // Using 'branch' instead of 'branchNumber'
            }
        });

        const sales = response.data;
        if (sales && sales.length > 0) {
            // Calculate metrics
            const totalRevenue = sales.reduce((sum, sale) => sum + sale.salePrice, 0);
            const averageTransaction = totalRevenue / sales.length;
            const uniqueCustomers = new Set(sales.map(sale => sale.customerNumber));

            // Print summary
            console.log('📊 Sales Summary:');
            console.log(`• Total Transactions: ${sales.length}`);
            console.log(`• Total Revenue: €${totalRevenue.toFixed(2)}`);
            console.log(`• Average Transaction: €${averageTransaction.toFixed(2)}`);
            console.log(`• Unique Customers: ${uniqueCustomers.size}`);

            // Daily breakdown
            const dailySales = sales.reduce((acc, sale) => {
                const date = new Date(sale.date).toLocaleDateString();
                if (!acc[date]) {
                    acc[date] = { count: 0, revenue: 0 };
                }
                acc[date].count++;
                acc[date].revenue += sale.salePrice;
                return acc;
            }, {});

            console.log('\n📅 Daily Sales:');
            Object.entries(dailySales)
                .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
                .forEach(([date, data]) => {
                    console.log(`• ${date}:`);
                    console.log(`  - Transactions: ${data.count}`);
                    console.log(`  - Revenue: €${data.revenue.toFixed(2)}`);
                });

            // Recent transactions
            console.log('\n🕒 10 Most Recent Transactions:');
            const recentSales = [...sales]
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 10);

            recentSales.forEach((sale, index) => {
                console.log(`\n${index + 1}. Transaction Details:`);
                console.log(`   • Date: ${new Date(sale.date).toLocaleString()}`);
                console.log(`   • Amount: €${sale.salePrice.toFixed(2)}`);
                console.log(`   • Receipt #: ${sale.receiptNumber}`);
                console.log(`   • Article #: ${sale.articleNumber}`);
                if (sale.discount > 0) {
                    console.log(`   • Discount Applied: €${sale.discount.toFixed(2)}`);
                }
            });

        } else {
            console.log('❌ No sales data found for Branch #1');
            console.log('\nNote: This could be because:');
            console.log('1. There are no recent transactions');
            console.log('2. The data is filtered by date');
            console.log('3. The branch filter needs different parameters');
        }

    } catch (error) {
        console.error('Error fetching sales data:', error.message);
        console.log('\nAPI Response:', error.response?.data);
    }
}

fetchBranch1Sales();
