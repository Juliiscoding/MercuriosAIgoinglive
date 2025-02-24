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

    while (hasMore && page <= 10) { // Limit to 10 pages for safety
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
                console.log(`Fetched page ${page}: ${response.data.length} records`);
                page++;
            } else {
                hasMore = false;
            }
        } catch (error) {
            console.error(`Error fetching page ${page}:`, error.message);
            hasMore = false;
        }
    }

    return allSales;
}

async function analyzeCustomerSpending() {
    try {
        console.log('💰 Analyzing Customer Spending Patterns...\n');
        const token = await authenticate();

        // Fetch all available sales data
        console.log('Fetching sales data...');
        const sales = await fetchAllSales(token);
        console.log(`\nTotal sales records retrieved: ${sales.length}`);

        // Separate customer and staff transactions
        const customerTransactions = sales.filter(s => String(s.customerNumber).startsWith('2') && String(s.customerNumber).length > 6);
        const staffTransactions = sales.filter(s => !String(s.customerNumber).startsWith('2') || String(s.customerNumber).length <= 6);

        console.log('\n📊 Transaction Distribution:');
        console.log(`Customer Transactions: ${customerTransactions.length}`);
        console.log(`Staff Transactions: ${staffTransactions.length}`);

        // Analyze customer spending
        const customerSpending = {};
        customerTransactions.forEach(transaction => {
            const customerId = transaction.customerNumber;
            if (!customerSpending[customerId]) {
                customerSpending[customerId] = {
                    totalSpent: 0,
                    transactions: [],
                    articles: new Set(),
                    firstPurchase: new Date(transaction.date),
                    lastPurchase: new Date(transaction.date),
                    averageTransaction: 0
                };
            }

            const customer = customerSpending[customerId];
            customer.totalSpent += transaction.salePrice;
            customer.transactions.push({
                date: new Date(transaction.date),
                amount: transaction.salePrice,
                article: transaction.articleNumber,
                receipt: transaction.receiptNumber
            });
            customer.articles.add(transaction.articleNumber);
            
            if (new Date(transaction.date) < customer.firstPurchase) {
                customer.firstPurchase = new Date(transaction.date);
            }
            if (new Date(transaction.date) > customer.lastPurchase) {
                customer.lastPurchase = new Date(transaction.date);
            }
        });

        // Calculate averages and sort by total spent
        Object.keys(customerSpending).forEach(customerId => {
            const customer = customerSpending[customerId];
            customer.averageTransaction = customer.totalSpent / customer.transactions.length;
        });

        const sortedCustomers = Object.entries(customerSpending)
            .sort((a, b) => b[1].totalSpent - a[1].totalSpent);

        // Display high spenders
        console.log('\n🏆 Top Spending Customers:');
        console.log('='.repeat(50));

        sortedCustomers.forEach(([customerId, data], index) => {
            console.log(`\n#${index + 1}. Customer ${customerId}:`);
            console.log(`💶 Total Spent: €${data.totalSpent.toFixed(2)}`);
            console.log(`🛍️  Number of Transactions: ${data.transactions.length}`);
            console.log(`📊 Average Transaction: €${data.averageTransaction.toFixed(2)}`);
            console.log(`🏷️  Unique Articles Purchased: ${data.articles.size}`);
            console.log(`📅 First Purchase: ${data.firstPurchase.toLocaleString()}`);
            console.log(`📅 Last Purchase: ${data.lastPurchase.toLocaleString()}`);
            
            // Show recent purchases
            console.log('\nRecent Purchases:');
            data.transactions
                .sort((a, b) => b.date - a.date)
                .slice(0, 3)
                .forEach(t => {
                    console.log(`• ${t.date.toLocaleString()}: €${t.amount.toFixed(2)} (Article #${t.article})`);
                });
        });

        // Calculate spending statistics
        const spendingAmounts = sortedCustomers.map(([_, data]) => data.totalSpent);
        const totalSpending = spendingAmounts.reduce((a, b) => a + b, 0);
        const averageSpending = totalSpending / sortedCustomers.length;

        console.log('\n📈 Spending Statistics:');
        console.log('='.repeat(50));
        console.log(`Total Customer Spending: €${totalSpending.toFixed(2)}`);
        console.log(`Average Spending per Customer: €${averageSpending.toFixed(2)}`);
        console.log(`Number of Unique Customers: ${sortedCustomers.length}`);

        // Spending distribution
        const spendingRanges = {
            '€0-50': 0,
            '€51-100': 0,
            '€101-200': 0,
            '€201-500': 0,
            '€500+': 0
        };

        spendingAmounts.forEach(amount => {
            if (amount <= 50) spendingRanges['€0-50']++;
            else if (amount <= 100) spendingRanges['€51-100']++;
            else if (amount <= 200) spendingRanges['€101-200']++;
            else if (amount <= 500) spendingRanges['€201-500']++;
            else spendingRanges['€500+']++;
        });

        console.log('\n📊 Spending Distribution:');
        Object.entries(spendingRanges).forEach(([range, count]) => {
            console.log(`${range}: ${count} customers`);
        });

    } catch (error) {
        console.error('Error analyzing customer spending:', error.message);
    }
}

analyzeCustomerSpending();
