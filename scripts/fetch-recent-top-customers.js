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
                    sort: '-date'  // Get most recent first
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

async function fetchCustomerDetails(token, customerNumber) {
    try {
        // Try different potential endpoints for customer details
        const endpoints = [
            `customer/${customerNumber}`,
            `customers/${customerNumber}`,
            `kunde/${customerNumber}`,
            `retail-customer/${customerNumber}`,
            `shop-customer/${customerNumber}`
        ];

        for (const endpoint of endpoints) {
            try {
                const response = await axios.get(`${API_URL}/${endpoint}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (response.data) {
                    return response.data;
                }
            } catch (error) {
                // Continue trying other endpoints
            }
        }
        return null;
    } catch (error) {
        console.log(`Could not fetch details for customer ${customerNumber}`);
        return null;
    }
}

async function getTopCustomers() {
    try {
        console.log('🔍 Finding Most Recent Top Customers...\n');
        const token = await authenticate();

        // Fetch sales data
        console.log('Fetching sales data...');
        const sales = await fetchAllSales(token);
        console.log(`\nTotal sales records: ${sales.length}`);

        // Find the most recent date
        const dates = sales.map(s => new Date(s.date));
        const mostRecentDate = new Date(Math.max(...dates));
        const oldestDate = new Date(Math.min(...dates));

        console.log(`\nData range: ${oldestDate.toLocaleDateString()} to ${mostRecentDate.toLocaleDateString()}`);

        // Filter for customer transactions only
        const customerSales = sales.filter(sale => 
            String(sale.customerNumber).startsWith('2') && 
            String(sale.customerNumber).length > 6
        );

        console.log(`Customer transactions: ${customerSales.length}`);

        // Aggregate customer purchases
        const customerPurchases = {};
        customerSales.forEach(sale => {
            const customerId = sale.customerNumber;
            if (!customerPurchases[customerId]) {
                customerPurchases[customerId] = {
                    totalSpent: 0,
                    transactions: [],
                    lastPurchase: null,
                    firstPurchase: null
                };
            }
            
            const customer = customerPurchases[customerId];
            customer.totalSpent += sale.salePrice;
            customer.transactions.push(sale);
            
            const purchaseDate = new Date(sale.date);
            if (!customer.lastPurchase || purchaseDate > customer.lastPurchase) {
                customer.lastPurchase = purchaseDate;
            }
            if (!customer.firstPurchase || purchaseDate < customer.firstPurchase) {
                customer.firstPurchase = purchaseDate;
            }
        });

        // Sort customers by total spent
        const sortedCustomers = Object.entries(customerPurchases)
            .sort((a, b) => b[1].totalSpent - a[1].totalSpent);

        console.log('\n🏆 Top Customers:');
        console.log('='.repeat(50));

        // Show top 10 customers
        for (const [customerId, data] of sortedCustomers.slice(0, 10)) {
            console.log(`\n👤 Customer ID: ${customerId}`);
            console.log(`💶 Total Spent: €${data.totalSpent.toFixed(2)}`);
            console.log(`🛍️  Number of Transactions: ${data.transactions.length}`);
            console.log(`📅 First Purchase: ${data.firstPurchase.toLocaleString()}`);
            console.log(`📅 Last Purchase: ${data.lastPurchase.toLocaleString()}`);
            
            // Try to get customer details
            const customerDetails = await fetchCustomerDetails(token, customerId);
            if (customerDetails) {
                console.log('\nCustomer Details:');
                if (customerDetails.name) console.log(`• Name: ${customerDetails.name}`);
                if (customerDetails.firstName) console.log(`• First Name: ${customerDetails.firstName}`);
                if (customerDetails.lastName) console.log(`• Last Name: ${customerDetails.lastName}`);
                if (customerDetails.email) console.log(`• Email: ${customerDetails.email}`);
                if (customerDetails.phone) console.log(`• Phone: ${customerDetails.phone}`);
            }

            // Show purchase patterns
            console.log('\nPurchase Patterns:');
            const avgTransactionValue = data.totalSpent / data.transactions.length;
            console.log(`• Average Transaction: €${avgTransactionValue.toFixed(2)}`);
            
            // Most purchased articles
            const articleFrequency = {};
            data.transactions.forEach(t => {
                articleFrequency[t.articleNumber] = (articleFrequency[t.articleNumber] || 0) + 1;
            });
            
            const favoriteArticles = Object.entries(articleFrequency)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3);
            
            if (favoriteArticles.length > 0) {
                console.log('\nMost Purchased Articles:');
                favoriteArticles.forEach(([article, count]) => {
                    console.log(`• Article #${article}: ${count} times`);
                });
            }
        }

    } catch (error) {
        console.error('Error fetching top customers:', error.message);
    }
}

getTopCustomers();
