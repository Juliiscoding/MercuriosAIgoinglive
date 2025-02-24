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
                    page: page,
                    sort: '-date'
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

function formatCurrency(amount) {
    return `€${amount.toFixed(2)}`;
}

function formatDate(date) {
    return new Date(date).toLocaleString();
}

async function analyzeSalesData() {
    try {
        console.log('🔍 Analyzing Sales Data...\n');
        const token = await authenticate();

        // Fetch sales data
        console.log('Fetching sales data...');
        const sales = await fetchAllSales(token);
        console.log(`\nTotal sales records: ${sales.length}`);

        // 1. Overall Sales Statistics
        console.log('\n📊 Overall Sales Statistics:');
        console.log('='.repeat(50));
        
        const totalRevenue = sales.reduce((sum, sale) => sum + sale.salePrice, 0);
        const averageTransactionValue = totalRevenue / sales.length;
        const dates = sales.map(s => new Date(s.date));
        const dateRange = {
            start: new Date(Math.min(...dates)),
            end: new Date(Math.max(...dates))
        };

        console.log(`• Date Range: ${dateRange.start.toLocaleDateString()} to ${dateRange.end.toLocaleDateString()}`);
        console.log(`• Total Revenue: ${formatCurrency(totalRevenue)}`);
        console.log(`• Total Transactions: ${sales.length}`);
        console.log(`• Average Transaction Value: ${formatCurrency(averageTransactionValue)}`);

        // 2. Customer Type Analysis
        console.log('\n👥 Customer Type Analysis:');
        console.log('='.repeat(50));

        const customerSales = sales.filter(s => 
            String(s.customerNumber).startsWith('2') && 
            String(s.customerNumber).length > 6
        );
        const staffSales = sales.filter(s => !customerSales.includes(s));

        console.log(`• Customer Transactions: ${customerSales.length}`);
        console.log(`• Staff/Other Transactions: ${staffSales.length}`);
        console.log(`• Customer Revenue: ${formatCurrency(customerSales.reduce((sum, s) => sum + s.salePrice, 0))}`);
        console.log(`• Staff/Other Revenue: ${formatCurrency(staffSales.reduce((sum, s) => sum + s.salePrice, 0))}`);

        // 3. Time-based Analysis
        console.log('\n⏰ Time-based Analysis:');
        console.log('='.repeat(50));

        const salesByDay = {};
        const salesByHour = {};
        
        sales.forEach(sale => {
            const date = new Date(sale.date);
            const dayKey = date.toLocaleDateString();
            const hourKey = date.getHours();

            salesByDay[dayKey] = (salesByDay[dayKey] || 0) + sale.salePrice;
            salesByHour[hourKey] = (salesByHour[hourKey] || 0) + sale.salePrice;
        });

        const dailyAverage = Object.values(salesByDay).reduce((sum, val) => sum + val, 0) / 
                            Object.keys(salesByDay).length;

        console.log(`• Average Daily Revenue: ${formatCurrency(dailyAverage)}`);
        console.log('\nBusiest Hours:');
        Object.entries(salesByHour)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .forEach(([hour, revenue]) => {
                console.log(`• ${hour}:00-${hour}:59: ${formatCurrency(revenue)}`);
            });

        // 4. Product Analysis
        console.log('\n📦 Product Analysis:');
        console.log('='.repeat(50));

        const productStats = {};
        sales.forEach(sale => {
            if (!productStats[sale.articleNumber]) {
                productStats[sale.articleNumber] = {
                    sales: 0,
                    revenue: 0,
                    transactions: 0,
                    averagePrice: 0,
                    customers: new Set()
                };
            }
            
            const stats = productStats[sale.articleNumber];
            stats.sales += sale.quantity || 1;
            stats.revenue += sale.salePrice;
            stats.transactions += 1;
            if (String(sale.customerNumber).startsWith('2')) {
                stats.customers.add(sale.customerNumber);
            }
        });

        // Calculate averages and sort by revenue
        Object.entries(productStats).forEach(([_, stats]) => {
            stats.averagePrice = stats.revenue / stats.sales;
        });

        const topProducts = Object.entries(productStats)
            .sort(([,a], [,b]) => b.revenue - a.revenue)
            .slice(0, 10);

        console.log('Top 10 Products by Revenue:');
        topProducts.forEach(([articleNumber, stats]) => {
            console.log(`\nArticle #${articleNumber}:`);
            console.log(`• Total Revenue: ${formatCurrency(stats.revenue)}`);
            console.log(`• Units Sold: ${stats.sales}`);
            console.log(`• Transactions: ${stats.transactions}`);
            console.log(`• Average Price: ${formatCurrency(stats.averagePrice)}`);
            console.log(`• Unique Customers: ${stats.customers.size}`);
        });

        // 5. Transaction Size Analysis
        console.log('\n💰 Transaction Size Analysis:');
        console.log('='.repeat(50));

        const transactionRanges = {
            'Small (€0-10)': 0,
            'Medium (€10-50)': 0,
            'Large (€50-100)': 0,
            'Extra Large (€100+)': 0
        };

        sales.forEach(sale => {
            if (sale.salePrice <= 10) transactionRanges['Small (€0-10)']++;
            else if (sale.salePrice <= 50) transactionRanges['Medium (€10-50)']++;
            else if (sale.salePrice <= 100) transactionRanges['Large (€50-100)']++;
            else transactionRanges['Extra Large (€100+)']++;
        });

        console.log('Transaction Size Distribution:');
        Object.entries(transactionRanges).forEach(([range, count]) => {
            const percentage = (count / sales.length * 100).toFixed(1);
            console.log(`• ${range}: ${count} (${percentage}%)`);
        });

        // 6. Customer Loyalty Analysis
        console.log('\n🎯 Customer Loyalty Analysis:');
        console.log('='.repeat(50));

        const customerFrequency = {};
        customerSales.forEach(sale => {
            const customerId = sale.customerNumber;
            if (!customerFrequency[customerId]) {
                customerFrequency[customerId] = {
                    visits: 0,
                    totalSpent: 0,
                    firstVisit: new Date(sale.date),
                    lastVisit: new Date(sale.date)
                };
            }
            
            const customer = customerFrequency[customerId];
            customer.visits++;
            customer.totalSpent += sale.salePrice;
            
            const saleDate = new Date(sale.date);
            if (saleDate < customer.firstVisit) customer.firstVisit = saleDate;
            if (saleDate > customer.lastVisit) customer.lastVisit = saleDate;
        });

        const customerSegments = {
            'One-time': 0,
            'Occasional (2-5 visits)': 0,
            'Regular (6-10 visits)': 0,
            'Frequent (11+ visits)': 0
        };

        Object.values(customerFrequency).forEach(customer => {
            if (customer.visits === 1) customerSegments['One-time']++;
            else if (customer.visits <= 5) customerSegments['Occasional (2-5 visits)']++;
            else if (customer.visits <= 10) customerSegments['Regular (6-10 visits)']++;
            else customerSegments['Frequent (11+ visits)']++;
        });

        console.log('Customer Segments:');
        Object.entries(customerSegments).forEach(([segment, count]) => {
            const percentage = (count / Object.keys(customerFrequency).length * 100).toFixed(1);
            console.log(`• ${segment}: ${count} customers (${percentage}%)`);
        });

        // Top loyal customers
        console.log('\nTop 5 Most Loyal Customers:');
        Object.entries(customerFrequency)
            .sort(([,a], [,b]) => b.visits - a.visits)
            .slice(0, 5)
            .forEach(([customerId, data]) => {
                const daysSinceFirst = Math.round((data.lastVisit - data.firstVisit) / (1000 * 60 * 60 * 24));
                console.log(`\nCustomer #${customerId}:`);
                console.log(`• Total Visits: ${data.visits}`);
                console.log(`• Total Spent: ${formatCurrency(data.totalSpent)}`);
                console.log(`• Average per Visit: ${formatCurrency(data.totalSpent / data.visits)}`);
                console.log(`• First Visit: ${data.firstVisit.toLocaleDateString()}`);
                console.log(`• Last Visit: ${data.lastVisit.toLocaleDateString()}`);
                console.log(`• Days Between First-Last: ${daysSinceFirst}`);
            });

    } catch (error) {
        console.error('Error analyzing sales data:', error.message);
    }
}

analyzeSalesData();
