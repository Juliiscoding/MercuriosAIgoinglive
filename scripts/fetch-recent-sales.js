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

async function fetchSalesForDateRange(token, fromDate, description) {
    try {
        const response = await axios.get(`${API_URL}/sale`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            params: {
                pagesize: 100,
                fromDate: fromDate.toISOString()
            }
        });

        const sales = response.data;
        if (sales && sales.length > 0) {
            console.log(`\n📊 ${description} (${fromDate.toLocaleDateString()} - Now)`);
            console.log('='.repeat(50));

            // Calculate metrics
            const totalRevenue = sales.reduce((sum, sale) => sum + sale.salePrice, 0);
            const averageTransaction = totalRevenue / sales.length;
            const uniqueBranches = new Set(sales.map(sale => sale.branchNumber));
            const uniqueCustomers = new Set(sales.map(sale => sale.customerNumber));

            // Print summary
            console.log('\n📈 Summary:');
            console.log(`• Total Transactions: ${sales.length}`);
            console.log(`• Total Revenue: €${totalRevenue.toFixed(2)}`);
            console.log(`• Average Transaction: €${averageTransaction.toFixed(2)}`);
            console.log(`• Active Branches: ${uniqueBranches.size}`);
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

            console.log('\n📅 Daily Breakdown:');
            Object.entries(dailySales)
                .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
                .forEach(([date, data]) => {
                    console.log(`• ${date}:`);
                    console.log(`  - Transactions: ${data.count}`);
                    console.log(`  - Revenue: €${data.revenue.toFixed(2)}`);
                });

            // Recent transactions
            console.log('\n🕒 5 Most Recent Transactions:');
            const recentSales = [...sales]
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 5);

            recentSales.forEach((sale, index) => {
                console.log(`\n${index + 1}. Transaction Details:`);
                console.log(`   • Date: ${new Date(sale.date).toLocaleString()}`);
                console.log(`   • Amount: €${sale.salePrice.toFixed(2)}`);
                console.log(`   • Branch: ${sale.branchNumber}`);
                console.log(`   • Receipt #: ${sale.receiptNumber}`);
                console.log(`   • Article #: ${sale.articleNumber}`);
                if (sale.discount > 0) {
                    console.log(`   • Discount Applied: €${sale.discount.toFixed(2)}`);
                }
            });

            return sales.length;
        } else {
            console.log(`\n❌ No sales found for ${description}`);
            return 0;
        }
    } catch (error) {
        console.error(`Error fetching ${description}:`, error.message);
        return 0;
    }
}

async function fetchRecentSales() {
    try {
        console.log('🔍 Fetching Recent Sales Data...\n');
        const token = await authenticate();

        // Try different date ranges to find recent data
        const now = new Date();
        
        // Last 24 hours
        const last24Hours = new Date(now);
        last24Hours.setHours(now.getHours() - 24);
        
        // Last 7 days
        const lastWeek = new Date(now);
        lastWeek.setDate(now.getDate() - 7);
        
        // Last 30 days
        const lastMonth = new Date(now);
        lastMonth.setDate(now.getDate() - 30);
        
        // Last 90 days
        const last3Months = new Date(now);
        last3Months.setDate(now.getDate() - 90);

        // Try each date range
        const ranges = [
            { date: last24Hours, desc: 'Last 24 Hours' },
            { date: lastWeek, desc: 'Last 7 Days' },
            { date: lastMonth, desc: 'Last 30 Days' },
            { date: last3Months, desc: 'Last 90 Days' }
        ];

        for (const range of ranges) {
            const count = await fetchSalesForDateRange(token, range.date, range.desc);
            if (count > 0) {
                // If we found data, no need to check older ranges
                break;
            }
        }

    } catch (error) {
        console.error('Error in fetchRecentSales:', error.message);
    }
}

fetchRecentSales();
