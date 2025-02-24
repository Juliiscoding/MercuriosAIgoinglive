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
        console.log('🔍 Fetching Sales Data for Branch #1...\n');
        const token = await authenticate();

        // First, verify the branch exists
        const branchResponse = await axios.get(`${API_URL}/branch/1`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (branchResponse.data) {
            const branch = branchResponse.data;
            console.log('📍 Branch Information:');
            console.log(`Name: ${branch.name1}`);
            console.log(`Address: ${branch.street}, ${branch.zipCode} ${branch.city}`);
            console.log(`Phone: ${branch.telephoneNumber}`);
            console.log('----------------------------------------\n');
        }

        // Fetch sales for branch 1
        const response = await axios.get(`${API_URL}/sale`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            params: {
                pagesize: 100,
                branchNumber: 1
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

            // Payment methods breakdown
            const paymentMethods = sales.reduce((acc, sale) => {
                const method = sale.paymentOptionNumber || 'Unknown';
                if (!acc[method]) {
                    acc[method] = { count: 0, total: 0 };
                }
                acc[method].count++;
                acc[method].total += sale.salePrice;
                return acc;
            }, {});

            console.log('\n💳 Payment Methods:');
            Object.entries(paymentMethods).forEach(([method, data]) => {
                console.log(`• Method ${method}:`);
                console.log(`  - Transactions: ${data.count}`);
                console.log(`  - Total: €${data.total.toFixed(2)}`);
            });

        } else {
            console.log('❌ No sales data found for Branch #1');
        }

    } catch (error) {
        if (error.response && error.response.status === 404) {
            console.error('Branch #1 not found or no sales data available');
        } else {
            console.error('Error fetching sales data:', error.message);
        }
    }
}

fetchBranch1Sales();
