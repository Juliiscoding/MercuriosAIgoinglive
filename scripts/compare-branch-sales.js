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

async function fetchBranchSales(token, branchNumber, branchName) {
    try {
        console.log(`\n🏪 Branch #${branchNumber}: ${branchName}`);
        console.log('='.repeat(50));

        const response = await axios.get(`${API_URL}/sale`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            params: {
                pagesize: 100,
                branch: branchNumber
            }
        });

        const sales = response.data;
        if (sales && sales.length > 0) {
            // Calculate metrics
            const totalRevenue = sales.reduce((sum, sale) => sum + sale.salePrice, 0);
            const averageTransaction = totalRevenue / sales.length;
            const uniqueCustomers = new Set(sales.map(sale => sale.customerNumber));
            const uniqueArticles = new Set(sales.map(sale => sale.articleNumber));

            // Summary
            console.log('\n📊 Summary:');
            console.log(`• Total Transactions: ${sales.length}`);
            console.log(`• Total Revenue: €${totalRevenue.toFixed(2)}`);
            console.log(`• Average Transaction: €${averageTransaction.toFixed(2)}`);
            console.log(`• Unique Customers: ${uniqueCustomers.size}`);
            console.log(`• Unique Articles Sold: ${uniqueArticles.size}`);

            // Date range
            const dates = sales.map(sale => new Date(sale.date));
            const minDate = new Date(Math.min(...dates));
            const maxDate = new Date(Math.max(...dates));
            console.log(`• Date Range: ${minDate.toLocaleDateString()} - ${maxDate.toLocaleDateString()}`);

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

            console.log('\n📅 Top 3 Sales Days:');
            Object.entries(dailySales)
                .sort(([, a], [, b]) => b.revenue - a.revenue)
                .slice(0, 3)
                .forEach(([date, data]) => {
                    console.log(`• ${date}:`);
                    console.log(`  - Transactions: ${data.count}`);
                    console.log(`  - Revenue: €${data.revenue.toFixed(2)}`);
                });

            // Recent transactions
            console.log('\n🕒 3 Most Recent Transactions:');
            const recentSales = [...sales]
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 3);

            recentSales.forEach((sale, index) => {
                console.log(`\n${index + 1}. Transaction Details:`);
                console.log(`   • Date: ${new Date(sale.date).toLocaleString()}`);
                console.log(`   • Amount: €${sale.salePrice.toFixed(2)}`);
                console.log(`   • Article #: ${sale.articleNumber}`);
                if (sale.discount > 0) {
                    console.log(`   • Discount Applied: €${sale.discount.toFixed(2)}`);
                }
            });

            // Transaction size distribution
            const transactions = {
                small: sales.filter(s => s.salePrice <= 10).length,
                medium: sales.filter(s => s.salePrice > 10 && s.salePrice <= 50).length,
                large: sales.filter(s => s.salePrice > 50).length
            };

            console.log('\n💶 Transaction Size Distribution:');
            console.log(`• Small (≤€10): ${transactions.small}`);
            console.log(`• Medium (€10-€50): ${transactions.medium}`);
            console.log(`• Large (>€50): ${transactions.large}`);

            return {
                totalTransactions: sales.length,
                totalRevenue: totalRevenue,
                averageTransaction: averageTransaction,
                uniqueCustomers: uniqueCustomers.size,
                dateRange: `${minDate.toLocaleDateString()} - ${maxDate.toLocaleDateString()}`
            };
        } else {
            console.log('❌ No sales data found');
            return null;
        }

    } catch (error) {
        console.error(`Error fetching data for Branch #${branchNumber}:`, error.message);
        return null;
    }
}

async function compareBranchSales() {
    try {
        const token = await authenticate();
        
        // Branch information from previous listing
        const branches = [
            { number: 2, name: 'Calida- Shop Osterstr.' },
            { number: 4, name: 'I. G.von der Linde GmbH & CoKG (Osterstr)' },
            { number: 5, name: 'Onlineshop' }
        ];

        console.log('🔄 Comparing Sales Data Across Branches...\n');

        const results = [];
        for (const branch of branches) {
            const data = await fetchBranchSales(token, branch.number, branch.name);
            if (data) {
                results.push({ branch: branch.number, ...data });
            }
        }

        if (results.length > 0) {
            console.log('\n📊 Branch Comparison Summary:');
            console.log('='.repeat(50));
            results.forEach(result => {
                console.log(`\nBranch #${result.branch}:`);
                console.log(`• Total Transactions: ${result.totalTransactions}`);
                console.log(`• Total Revenue: €${result.totalRevenue.toFixed(2)}`);
                console.log(`• Average Transaction: €${result.averageTransaction.toFixed(2)}`);
                console.log(`• Unique Customers: ${result.uniqueCustomers}`);
                console.log(`• Date Range: ${result.dateRange}`);
            });
        }

    } catch (error) {
        console.error('Error in comparison:', error.message);
    }
}

compareBranchSales();
