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

async function fetchArticleDetails(token, articleNumbers) {
    const uniqueArticles = [...new Set(articleNumbers)];
    const articles = {};
    
    console.log(`\nFetching details for ${uniqueArticles.length} unique articles...`);
    
    for (const articleNumber of uniqueArticles) {
        try {
            const response = await axios.get(`${API_URL}/article/${articleNumber}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.data) {
                articles[articleNumber] = response.data;
            }
        } catch (error) {
            console.log(`Could not fetch details for article ${articleNumber}`);
        }
    }
    
    return articles;
}

async function analyzeHighSpenderCategories() {
    try {
        console.log('🔍 Analyzing High Spender Product Preferences...\n');
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
                        transactions: []
                    };
                }
                customerTransactions[customerId].totalSpent += sale.salePrice;
                customerTransactions[customerId].transactions.push(sale);
            }
        });

        const highSpenders = Object.entries(customerTransactions)
            .filter(([_, data]) => data.totalSpent >= 100)
            .sort((a, b) => b[1].totalSpent - a[1].totalSpent);

        console.log(`\nFound ${highSpenders.length} high-value customers (spending >€100)`);

        // Collect all article numbers from high spender purchases
        const articleNumbers = highSpenders.flatMap(([_, data]) => 
            data.transactions.map(t => t.articleNumber)
        );

        // Fetch article details
        const articleDetails = await fetchArticleDetails(token, articleNumbers);

        // Analyze product categories for each high spender
        console.log('\n🛍️ High Spender Product Analysis:');
        console.log('='.repeat(50));

        highSpenders.forEach(([customerId, data]) => {
            console.log(`\n👤 Customer ${customerId} (Total Spent: €${data.totalSpent.toFixed(2)})`);
            
            // Analyze categories
            const categoryAnalysis = {};
            const brandAnalysis = {};
            const priceRanges = {
                'Budget (€0-10)': 0,
                'Mid-range (€10-30)': 0,
                'Premium (€30+)': 0
            };

            data.transactions.forEach(transaction => {
                const article = articleDetails[transaction.articleNumber];
                if (article) {
                    // Category analysis
                    const category = article.category || 'Unknown';
                    if (!categoryAnalysis[category]) {
                        categoryAnalysis[category] = {
                            count: 0,
                            totalSpent: 0,
                            items: new Set()
                        };
                    }
                    categoryAnalysis[category].count++;
                    categoryAnalysis[category].totalSpent += transaction.salePrice;
                    categoryAnalysis[category].items.add(article.name || article.articleNumber);

                    // Brand analysis
                    const brand = article.brand || 'Unknown';
                    if (!brandAnalysis[brand]) {
                        brandAnalysis[brand] = {
                            count: 0,
                            totalSpent: 0
                        };
                    }
                    brandAnalysis[brand].count++;
                    brandAnalysis[brand].totalSpent += transaction.salePrice;

                    // Price range analysis
                    const price = transaction.salePrice;
                    if (price <= 10) priceRanges['Budget (€0-10)']++;
                    else if (price <= 30) priceRanges['Mid-range (€10-30)']++;
                    else priceRanges['Premium (€30+)']++;
                }
            });

            // Display category preferences
            console.log('\nCategory Preferences:');
            Object.entries(categoryAnalysis)
                .sort((a, b) => b[1].totalSpent - a[1].totalSpent)
                .forEach(([category, stats]) => {
                    console.log(`• ${category}:`);
                    console.log(`  - Items: ${stats.count}`);
                    console.log(`  - Total Spent: €${stats.totalSpent.toFixed(2)}`);
                    console.log(`  - Average per Item: €${(stats.totalSpent / stats.count).toFixed(2)}`);
                    console.log(`  - Products: ${Array.from(stats.items).join(', ')}`);
                });

            // Display brand preferences
            console.log('\nTop Brands:');
            Object.entries(brandAnalysis)
                .sort((a, b) => b[1].totalSpent - a[1].totalSpent)
                .slice(0, 3)
                .forEach(([brand, stats]) => {
                    console.log(`• ${brand}: ${stats.count} items, €${stats.totalSpent.toFixed(2)}`);
                });

            // Display price range distribution
            console.log('\nPrice Range Distribution:');
            Object.entries(priceRanges)
                .forEach(([range, count]) => {
                    console.log(`• ${range}: ${count} items`);
                });
        });

        // Overall category analysis across all high spenders
        console.log('\n📊 Overall Category Analysis for High Spenders:');
        console.log('='.repeat(50));

        const overallCategories = {};
        highSpenders.forEach(([_, data]) => {
            data.transactions.forEach(transaction => {
                const article = articleDetails[transaction.articleNumber];
                if (article) {
                    const category = article.category || 'Unknown';
                    if (!overallCategories[category]) {
                        overallCategories[category] = {
                            totalSpent: 0,
                            count: 0,
                            customers: new Set()
                        };
                    }
                    overallCategories[category].totalSpent += transaction.salePrice;
                    overallCategories[category].count++;
                    overallCategories[category].customers.add(transaction.customerNumber);
                }
            });
        });

        console.log('\nPopular Categories:');
        Object.entries(overallCategories)
            .sort((a, b) => b[1].totalSpent - a[1].totalSpent)
            .forEach(([category, stats]) => {
                console.log(`\n• ${category}:`);
                console.log(`  - Total Revenue: €${stats.totalSpent.toFixed(2)}`);
                console.log(`  - Number of Purchases: ${stats.count}`);
                console.log(`  - Number of Unique Customers: ${stats.customers.size}`);
                console.log(`  - Average Spend per Purchase: €${(stats.totalSpent / stats.count).toFixed(2)}`);
            });

    } catch (error) {
        console.error('Error analyzing high spender categories:', error.message);
    }
}

analyzeHighSpenderCategories();
