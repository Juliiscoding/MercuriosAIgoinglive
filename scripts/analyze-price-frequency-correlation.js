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

function calculateCorrelation(x, y) {
    const n = x.length;
    const sum1 = x.reduce((a, b) => a + b, 0);
    const sum2 = y.reduce((a, b) => a + b, 0);
    const sum1Sq = x.reduce((a, b) => a + b * b, 0);
    const sum2Sq = y.reduce((a, b) => a + b * b, 0);
    const pSum = x.map((x, i) => x * y[i]).reduce((a, b) => a + b, 0);
    const num = pSum - (sum1 * sum2 / n);
    const den = Math.sqrt((sum1Sq - sum1 * sum1 / n) * (sum2Sq - sum2 * sum2 / n));
    return num / den;
}

async function analyzePriceFrequencyCorrelation() {
    try {
        console.log('🔍 Analyzing Price-Frequency Correlation...\n');
        const token = await authenticate();

        // Fetch sales data
        console.log('Fetching sales data...');
        const sales = await fetchAllSales(token);
        console.log(`\nTotal sales records: ${sales.length}`);

        // Filter for customer transactions (not staff)
        const customerSales = sales.filter(s => 
            String(s.customerNumber).startsWith('2') && 
            String(s.customerNumber).length > 6
        );

        console.log(`Customer transactions: ${customerSales.length}`);

        // Analyze product purchase patterns
        const productAnalysis = {};
        customerSales.forEach(sale => {
            if (!productAnalysis[sale.articleNumber]) {
                productAnalysis[sale.articleNumber] = {
                    price: sale.salePrice,
                    purchases: 0,
                    totalRevenue: 0,
                    uniqueCustomers: new Set(),
                    purchaseDates: [],
                    averagePurchaseInterval: 0
                };
            }
            
            const product = productAnalysis[sale.articleNumber];
            product.purchases++;
            product.totalRevenue += sale.salePrice;
            product.uniqueCustomers.add(sale.customerNumber);
            product.purchaseDates.push(new Date(sale.date));
        });

        // Calculate purchase intervals and sort by frequency
        Object.entries(productAnalysis).forEach(([_, data]) => {
            data.purchaseDates.sort((a, b) => a - b);
            if (data.purchaseDates.length > 1) {
                const intervals = [];
                for (let i = 1; i < data.purchaseDates.length; i++) {
                    intervals.push((data.purchaseDates[i] - data.purchaseDates[i-1]) / (1000 * 60 * 60 * 24));
                }
                data.averagePurchaseInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
            }
        });

        // Group products by price ranges
        const priceRanges = {
            'Budget (€0-10)': [],
            'Low-Mid (€10-20)': [],
            'High-Mid (€20-30)': [],
            'Premium (€30+)': []
        };

        Object.entries(productAnalysis).forEach(([articleNumber, data]) => {
            const price = data.price;
            if (price <= 10) priceRanges['Budget (€0-10)'].push({articleNumber, ...data});
            else if (price <= 20) priceRanges['Low-Mid (€10-20)'].push({articleNumber, ...data});
            else if (price <= 30) priceRanges['High-Mid (€20-30)'].push({articleNumber, ...data});
            else priceRanges['Premium (€30+)'].push({articleNumber, ...data});
        });

        // Analyze each price range
        console.log('\n📊 Price Range Analysis:');
        console.log('='.repeat(50));

        Object.entries(priceRanges).forEach(([range, products]) => {
            const totalPurchases = products.reduce((sum, p) => sum + p.purchases, 0);
            const averagePurchases = totalPurchases / (products.length || 1);
            const totalRevenue = products.reduce((sum, p) => sum + p.totalRevenue, 0);
            const uniqueCustomers = new Set(products.flatMap(p => Array.from(p.uniqueCustomers)));

            console.log(`\n${range}:`);
            console.log(`• Products in range: ${products.length}`);
            console.log(`• Total purchases: ${totalPurchases}`);
            console.log(`• Average purchases per product: ${averagePurchases.toFixed(2)}`);
            console.log(`• Total revenue: €${totalRevenue.toFixed(2)}`);
            console.log(`• Unique customers: ${uniqueCustomers.size}`);

            if (products.length > 0) {
                console.log('\nTop products by purchase frequency:');
                products
                    .sort((a, b) => b.purchases - a.purchases)
                    .slice(0, 3)
                    .forEach(product => {
                        console.log(`• Article #${product.articleNumber}:`);
                        console.log(`  - Price: €${product.price.toFixed(2)}`);
                        console.log(`  - Purchases: ${product.purchases}`);
                        console.log(`  - Unique customers: ${product.uniqueCustomers.size}`);
                        console.log(`  - Total revenue: €${product.totalRevenue.toFixed(2)}`);
                    });
            }
        });

        // Calculate correlation between price and purchase frequency
        const prices = Object.values(productAnalysis).map(p => p.price);
        const frequencies = Object.values(productAnalysis).map(p => p.purchases);
        const correlation = calculateCorrelation(prices, frequencies);

        console.log('\n📈 Price-Frequency Correlation Analysis:');
        console.log('='.repeat(50));
        console.log(`Correlation coefficient: ${correlation.toFixed(3)}`);
        console.log(`Interpretation: ${
            correlation < -0.5 ? 'Strong negative correlation (lower prices = more purchases)' :
            correlation < -0.2 ? 'Moderate negative correlation' :
            correlation < 0.2 ? 'No significant correlation' :
            correlation < 0.5 ? 'Moderate positive correlation' :
            'Strong positive correlation (higher prices = more purchases)'
        }`);

        // Analyze purchase patterns
        console.log('\n🔄 Purchase Pattern Analysis:');
        console.log('='.repeat(50));

        // Group products by purchase frequency
        const frequencyGroups = {
            'High frequency (5+ purchases)': [],
            'Medium frequency (3-4 purchases)': [],
            'Low frequency (1-2 purchases)': []
        };

        Object.entries(productAnalysis).forEach(([articleNumber, data]) => {
            if (data.purchases >= 5) 
                frequencyGroups['High frequency (5+ purchases)'].push({articleNumber, ...data});
            else if (data.purchases >= 3) 
                frequencyGroups['Medium frequency (3-4 purchases)'].push({articleNumber, ...data});
            else 
                frequencyGroups['Low frequency (1-2 purchases)'].push({articleNumber, ...data});
        });

        Object.entries(frequencyGroups).forEach(([group, products]) => {
            if (products.length === 0) return;

            const avgPrice = products.reduce((sum, p) => sum + p.price, 0) / products.length;
            const avgCustomers = products.reduce((sum, p) => sum + p.uniqueCustomers.size, 0) / products.length;

            console.log(`\n${group}:`);
            console.log(`• Number of products: ${products.length}`);
            console.log(`• Average price: €${avgPrice.toFixed(2)}`);
            console.log(`• Average unique customers: ${avgCustomers.toFixed(1)}`);

            if (products.length > 0) {
                console.log('\nPrice distribution:');
                console.log(`• Lowest price: €${Math.min(...products.map(p => p.price)).toFixed(2)}`);
                console.log(`• Highest price: €${Math.max(...products.map(p => p.price)).toFixed(2)}`);
                console.log(`• Median price: €${products.map(p => p.price).sort((a,b) => a-b)[Math.floor(products.length/2)].toFixed(2)}`);
            }
        });

    } catch (error) {
        console.error('Error analyzing price-frequency correlation:', error.message);
    }
}

analyzePriceFrequencyCorrelation();
