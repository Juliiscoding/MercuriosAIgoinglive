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

async function fetchLastWeekSales() {
    try {
        const token = await authenticate();
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);

        const response = await axios.get(`${API_URL}/sale`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            params: {
                pagesize: 100,
                fromDate: lastWeek.toISOString()
            }
        });

        console.log('📊 Sales Data Analysis (Last 7 Days)\n');
        console.log('====================================\n');

        const sales = response.data;
        if (sales && sales.length > 0) {
            // Calculate total revenue and other metrics
            const totalRevenue = sales.reduce((sum, sale) => sum + sale.salePrice, 0);
            const averageTransaction = totalRevenue / sales.length;
            const uniqueBranches = new Set(sales.map(sale => sale.branchNumber));
            const uniqueCustomers = new Set(sales.map(sale => sale.customerNumber));

            // Summary Statistics
            console.log('📈 Summary Statistics:');
            console.log(`• Total Transactions: ${sales.length}`);
            console.log(`• Total Revenue: €${totalRevenue.toFixed(2)}`);
            console.log(`• Average Transaction: €${averageTransaction.toFixed(2)}`);
            console.log(`• Active Branches: ${uniqueBranches.size}`);
            console.log(`• Unique Customers: ${uniqueCustomers.size}\n`);

            // Daily Breakdown
            console.log('📅 Daily Sales Breakdown:');
            const dailySales = sales.reduce((acc, sale) => {
                const date = sale.date.split('T')[0];
                if (!acc[date]) {
                    acc[date] = {
                        count: 0,
                        revenue: 0
                    };
                }
                acc[date].count++;
                acc[date].revenue += sale.salePrice;
                return acc;
            }, {});

            Object.entries(dailySales)
                .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
                .forEach(([date, data]) => {
                    console.log(`• ${date}:`);
                    console.log(`  - Transactions: ${data.count}`);
                    console.log(`  - Revenue: €${data.revenue.toFixed(2)}\n`);
                });

            // Top 10 Most Recent Sales
            console.log('🕒 10 Most Recent Sales:');
            const recentSales = [...sales]
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 10);

            recentSales.forEach((sale, index) => {
                console.log(`\n${index + 1}. Transaction Details:`);
                console.log(`   • Date: ${new Date(sale.date).toLocaleString()}`);
                console.log(`   • Amount: €${sale.salePrice.toFixed(2)}`);
                console.log(`   • Branch: ${sale.branchNumber}`);
                console.log(`   • Receipt #: ${sale.receiptNumber}`);
                if (sale.discount > 0) {
                    console.log(`   • Discount Applied: €${sale.discount.toFixed(2)}`);
                }
            });

            // Branch Performance
            console.log('\n🏪 Branch Performance:');
            const branchStats = sales.reduce((acc, sale) => {
                if (!acc[sale.branchNumber]) {
                    acc[sale.branchNumber] = {
                        sales: 0,
                        revenue: 0
                    };
                }
                acc[sale.branchNumber].sales++;
                acc[sale.branchNumber].revenue += sale.salePrice;
                return acc;
            }, {});

            Object.entries(branchStats)
                .sort(([, a], [, b]) => b.revenue - a.revenue)
                .forEach(([branch, stats]) => {
                    console.log(`\nBranch #${branch}:`);
                    console.log(`• Total Sales: ${stats.sales}`);
                    console.log(`• Total Revenue: €${stats.revenue.toFixed(2)}`);
                    console.log(`• Average Sale: €${(stats.revenue / stats.sales).toFixed(2)}`);
                });

        } else {
            console.log('No sales data found for the last week.');
        }

    } catch (error) {
        console.error('Error fetching sales data:', error.message);
    }
}

fetchLastWeekSales();
