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
        console.log('🔍 Finding Top Customers for 2025...\n');
        const token = await authenticate();

        // Fetch sales data
        console.log('Fetching sales data...');
        const sales = await fetchAllSales(token);
        console.log(`\nTotal sales records: ${sales.length}`);

        // Filter for 2025 sales and customer transactions only
        const currentYear = 2025;
        const salesIn2025 = sales.filter(sale => {
            const saleDate = new Date(sale.date);
            return saleDate.getFullYear() === currentYear &&
                   String(sale.customerNumber).startsWith('2') &&
                   String(sale.customerNumber).length > 6;
        });

        console.log(`Sales in ${currentYear}: ${salesIn2025.length}`);

        // Aggregate customer purchases
        const customerPurchases = {};
        salesIn2025.forEach(sale => {
            const customerId = sale.customerNumber;
            if (!customerPurchases[customerId]) {
                customerPurchases[customerId] = {
                    totalSpent: 0,
                    transactions: [],
                    lastPurchase: null
                };
            }
            customerPurchases[customerId].totalSpent += sale.salePrice;
            customerPurchases[customerId].transactions.push(sale);
            
            const purchaseDate = new Date(sale.date);
            if (!customerPurchases[customerId].lastPurchase || 
                purchaseDate > customerPurchases[customerId].lastPurchase) {
                customerPurchases[customerId].lastPurchase = purchaseDate;
            }
        });

        // Sort customers by total spent
        const sortedCustomers = Object.entries(customerPurchases)
            .sort((a, b) => b[1].totalSpent - a[1].totalSpent);

        console.log('\n🏆 Top Customers of 2025:');
        console.log('='.repeat(50));

        // Try to fetch customer details for each top customer
        for (const [customerId, data] of sortedCustomers) {
            console.log(`\n👤 Customer ID: ${customerId}`);
            console.log(`💶 Total Spent: €${data.totalSpent.toFixed(2)}`);
            console.log(`🛍️  Number of Transactions: ${data.transactions.length}`);
            console.log(`📅 Last Purchase: ${data.lastPurchase.toLocaleString()}`);
            
            // Try to get customer details
            const customerDetails = await fetchCustomerDetails(token, customerId);
            if (customerDetails) {
                console.log('Customer Details:');
                if (customerDetails.name) console.log(`• Name: ${customerDetails.name}`);
                if (customerDetails.firstName) console.log(`• First Name: ${customerDetails.firstName}`);
                if (customerDetails.lastName) console.log(`• Last Name: ${customerDetails.lastName}`);
                if (customerDetails.email) console.log(`• Email: ${customerDetails.email}`);
                if (customerDetails.phone) console.log(`• Phone: ${customerDetails.phone}`);
            }

            // Show recent purchases
            console.log('\nRecent Purchases:');
            data.transactions
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 3)
                .forEach(transaction => {
                    console.log(`• ${new Date(transaction.date).toLocaleString()}: €${transaction.salePrice.toFixed(2)} (Article #${transaction.articleNumber})`);
                });
        }

        if (sortedCustomers.length === 0) {
            console.log('\n⚠️ No customer transactions found for 2025');
            console.log('This might be because:');
            console.log('1. The data hasn\'t been updated for 2025');
            console.log('2. Customer data is stored in a different system');
            console.log('3. Access to customer data is restricted');
        }

    } catch (error) {
        console.error('Error fetching top customers:', error.message);
    }
}

getTopCustomers();
