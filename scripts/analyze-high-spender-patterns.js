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

async function fetchAllSales(token) {
    let allSales = [];
    let page = 1;
    let hasMore = true;

    while (hasMore && page <= 10) {
        try {
            const response = await axios.get(`${API_URL}/sale`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                params: {
                    pagesize: 100,
                    page: page
                }
            });
            
            if (response.data && response.data.length > 0) {
                allSales = allSales.concat(response.data);
                console.log(`Fetched sales page ${page}: ${response.data.length} records`);
                page++;
            } else {
                hasMore = false;
            }
        } catch (error) {
            console.error(`Error fetching sales page ${page}:`, error.message);
            hasMore = false;
        }
    }

    return allSales;
}

async function analyzeHighSpenderPatterns() {
    try {
        console.log('🔍 Analyzing High Spender Purchase Patterns...\n');
        const token = await authenticate();

        // Fetch sales data
        console.log('Fetching sales data...');
        const sales = await fetchAllSales(token);
        console.log(`\nTotal sales records: ${sales.length}`);

        // Identify high-value customers (spending over €100)
        const customerTransactions = {};
        sales.forEach(sale => {
            const customerId = sale.customerNumber;
            if (String(customerId).startsWith('2') && String(customerId).length > 6) {
                if (!customerTransactions[customerId]) {
                    customerTransactions[customerId] = {
                        totalSpent: 0,
                        transactions: [],
                        articleFrequency: {},
                        priceRanges: {
                            'Budget (€0-10)': 0,
                            'Mid-range (€10-30)': 0,
                            'Premium (€30+)': 0
                        },
                        purchaseTimes: []
                    };
                }
                
                const customer = customerTransactions[customerId];
                customer.totalSpent += sale.salePrice;
                customer.transactions.push(sale);
                
                // Track article frequency
                if (!customer.articleFrequency[sale.articleNumber]) {
                    customer.articleFrequency[sale.articleNumber] = {
                        count: 0,
                        totalSpent: 0,
                        prices: []
                    };
                }
                customer.articleFrequency[sale.articleNumber].count++;
                customer.articleFrequency[sale.articleNumber].totalSpent += sale.salePrice;
                customer.articleFrequency[sale.articleNumber].prices.push(sale.salePrice);
                
                // Track price ranges
                const price = sale.salePrice;
                if (price <= 10) customer.priceRanges['Budget (€0-10)']++;
                else if (price <= 30) customer.priceRanges['Mid-range (€10-30)']++;
                else customer.priceRanges['Premium (€30+)']++;
                
                // Track purchase times
                customer.purchaseTimes.push(new Date(sale.date));
            }
        });

        const highSpenders = Object.entries(customerTransactions)
            .filter(([_, data]) => data.totalSpent >= 100)
            .sort((a, b) => b[1].totalSpent - a[1].totalSpent);

        console.log(`\nFound ${highSpenders.length} high-value customers (spending >€100)`);

        // Analyze patterns for each high spender
        console.log('\n🛍️ High Spender Purchase Patterns:');
        console.log('='.repeat(50));

        highSpenders.forEach(([customerId, data]) => {
            console.log(`\n👤 Customer ${customerId} (Total Spent: €${data.totalSpent.toFixed(2)})`);
            
            // Favorite products (most frequently purchased)
            const favoriteProducts = Object.entries(data.articleFrequency)
                .sort((a, b) => b[1].count - a[1].count)
                .slice(0, 3);
            
            console.log('\nMost Purchased Products:');
            favoriteProducts.forEach(([articleNumber, stats]) => {
                const avgPrice = stats.totalSpent / stats.count;
                console.log(`• Article #${articleNumber}:`);
                console.log(`  - Purchased ${stats.count} times`);
                console.log(`  - Total spent: €${stats.totalSpent.toFixed(2)}`);
                console.log(`  - Average price: €${avgPrice.toFixed(2)}`);
            });

            // Price range distribution
            console.log('\nPrice Range Distribution:');
            Object.entries(data.priceRanges).forEach(([range, count]) => {
                const percentage = (count / data.transactions.length * 100).toFixed(1);
                console.log(`• ${range}: ${count} items (${percentage}%)`);
            });

            // Purchase timing
            const purchaseDates = data.purchaseTimes.sort((a, b) => a - b);
            const firstPurchase = purchaseDates[0];
            const lastPurchase = purchaseDates[purchaseDates.length - 1];
            const daysBetween = (lastPurchase - firstPurchase) / (1000 * 60 * 60 * 24);
            
            console.log('\nPurchase Timing:');
            console.log(`• First purchase: ${firstPurchase.toLocaleString()}`);
            console.log(`• Last purchase: ${lastPurchase.toLocaleString()}`);
            console.log(`• Shopping frequency: ${(data.transactions.length / (daysBetween || 1)).toFixed(1)} items per day`);
        });

        // Overall patterns across all high spenders
        console.log('\n📊 Overall High Spender Patterns:');
        console.log('='.repeat(50));

        // Most popular products among high spenders
        const overallArticleFrequency = {};
        highSpenders.forEach(([_, data]) => {
            Object.entries(data.articleFrequency).forEach(([articleNumber, stats]) => {
                if (!overallArticleFrequency[articleNumber]) {
                    overallArticleFrequency[articleNumber] = {
                        count: 0,
                        totalSpent: 0,
                        customers: new Set()
                    };
                }
                overallArticleFrequency[articleNumber].count += stats.count;
                overallArticleFrequency[articleNumber].totalSpent += stats.totalSpent;
                overallArticleFrequency[articleNumber].customers.add(_);
            });
        });

        console.log('\nMost Popular Products Among High Spenders:');
        Object.entries(overallArticleFrequency)
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 5)
            .forEach(([articleNumber, stats]) => {
                console.log(`\n• Article #${articleNumber}:`);
                console.log(`  - Total purchases: ${stats.count}`);
                console.log(`  - Total revenue: €${stats.totalSpent.toFixed(2)}`);
                console.log(`  - Average price: €${(stats.totalSpent / stats.count).toFixed(2)}`);
                console.log(`  - Purchased by ${stats.customers.size} different customers`);
            });

        // Price range distribution across all high spenders
        const overallPriceRanges = {
            'Budget (€0-10)': 0,
            'Mid-range (€10-30)': 0,
            'Premium (€30+)': 0
        };

        highSpenders.forEach(([_, data]) => {
            Object.entries(data.priceRanges).forEach(([range, count]) => {
                overallPriceRanges[range] += count;
            });
        });

        console.log('\nOverall Price Range Distribution:');
        const totalItems = Object.values(overallPriceRanges).reduce((a, b) => a + b, 0);
        Object.entries(overallPriceRanges).forEach(([range, count]) => {
            const percentage = (count / totalItems * 100).toFixed(1);
            console.log(`• ${range}: ${count} items (${percentage}%)`);
        });

    } catch (error) {
        console.error('Error analyzing high spender patterns:', error.message);
    }
}

analyzeHighSpenderPatterns();
