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

async function fetchOnlineShopData() {
    try {
        const token = await authenticate();
        console.log('🛍️  Analyzing Online Shop (Branch #5) Data\n');
        
        // Try different date ranges and parameters
        const dateRanges = [
            {
                name: 'Today',
                fromDate: new Date().toISOString()
            },
            {
                name: 'Last 24 Hours',
                fromDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
            },
            {
                name: 'Last 7 Days',
                fromDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];

        for (const range of dateRanges) {
            console.log(`\n📅 Checking ${range.name}...`);
            console.log('='.repeat(40));

            try {
                const response = await axios.get(`${API_URL}/sale`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    params: {
                        pagesize: 100,
                        branch: 5,
                        fromDate: range.fromDate,
                        sort: '-date' // Try to sort by most recent
                    }
                });

                const sales = response.data;
                if (sales && sales.length > 0) {
                    // Calculate metrics
                    const totalRevenue = sales.reduce((sum, sale) => sum + sale.salePrice, 0);
                    const averageTransaction = totalRevenue / sales.length;
                    const uniqueCustomers = new Set(sales.map(sale => sale.customerNumber));
                    const uniqueArticles = new Set(sales.map(sale => sale.articleNumber));

                    console.log('\n📊 Summary:');
                    console.log(`• Transactions Found: ${sales.length}`);
                    console.log(`• Total Revenue: €${totalRevenue.toFixed(2)}`);
                    console.log(`• Average Transaction: €${averageTransaction.toFixed(2)}`);
                    console.log(`• Unique Customers: ${uniqueCustomers.size}`);
                    console.log(`• Unique Products: ${uniqueArticles.size}`);

                    // Show the actual dates of transactions
                    const dates = sales.map(sale => new Date(sale.date));
                    const minDate = new Date(Math.min(...dates));
                    const maxDate = new Date(Math.max(...dates));
                    console.log(`• Actual Date Range: ${minDate.toLocaleString()} - ${maxDate.toLocaleString()}`);

                    // Recent transactions
                    console.log('\n🕒 Most Recent Transactions:');
                    const recentSales = [...sales]
                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                        .slice(0, 3);

                    recentSales.forEach((sale, index) => {
                        console.log(`\n${index + 1}. Transaction:`);
                        console.log(`   • Date: ${new Date(sale.date).toLocaleString()}`);
                        console.log(`   • Amount: €${sale.salePrice.toFixed(2)}`);
                        console.log(`   • Article #: ${sale.articleNumber}`);
                        console.log(`   • Receipt #: ${sale.receiptNumber}`);
                        if (sale.discount > 0) {
                            console.log(`   • Discount: €${sale.discount.toFixed(2)}`);
                        }
                    });

                    // Check response headers for API version and other metadata
                    console.log('\n🔍 API Response Metadata:');
                    if (response.headers) {
                        console.log('Headers:', response.headers);
                    }
                } else {
                    console.log('❌ No transactions found for this period');
                }
            } catch (error) {
                console.log(`❌ Error for ${range.name}:`, error.message);
                if (error.response) {
                    console.log('Response:', error.response.data);
                }
            }
        }

        // Try to get real-time updates
        console.log('\n📡 Checking WebSocket availability...');
        try {
            const wsResponse = await axios.get(`${API_URL}/ws/info`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('WebSocket Info:', wsResponse.data);
        } catch (error) {
            console.log('WebSocket info not available:', error.message);
        }

    } catch (error) {
        console.error('Error analyzing online shop data:', error.message);
    }
}

fetchOnlineShopData();
