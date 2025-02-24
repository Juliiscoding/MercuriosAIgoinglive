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

async function analyzeSalesForCustomers() {
    try {
        console.log('🔍 Analyzing Sales Data for Customer Information...\n');
        const token = await authenticate();

        // Fetch sales data with different parameters
        const response = await axios.get(`${API_URL}/sale`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            params: {
                pagesize: 100,
                sort: '-date'
            }
        });

        const sales = response.data;
        
        console.log('📊 Sales Data Analysis:');
        console.log('='.repeat(50));
        console.log(`Total Sales Records: ${sales.length}`);

        // Extract unique customer numbers
        const customerNumbers = new Set(sales.map(s => s.customerNumber));
        console.log(`Unique Customer Numbers: ${customerNumbers.size}`);

        // Analyze customer numbers
        const customerSales = {};
        sales.forEach(sale => {
            if (sale.customerNumber) {
                if (!customerSales[sale.customerNumber]) {
                    customerSales[sale.customerNumber] = {
                        transactions: [],
                        totalAmount: 0
                    };
                }
                customerSales[sale.customerNumber].transactions.push({
                    date: new Date(sale.date),
                    amount: sale.salePrice,
                    article: sale.articleNumber,
                    receipt: sale.receiptNumber
                });
                customerSales[sale.customerNumber].totalAmount += sale.salePrice;
            }
        });

        // Show customer transaction patterns
        console.log('\n👥 Customer Transaction Analysis:');
        console.log('='.repeat(50));

        const activeCustomers = Object.entries(customerSales)
            .sort((a, b) => b[1].transactions.length - a[1].transactions.length)
            .slice(0, 5);

        if (activeCustomers.length > 0) {
            console.log('\nTop 5 Customers by Transaction Count:');
            activeCustomers.forEach(([customerNumber, data]) => {
                console.log(`\nCustomer #${customerNumber}:`);
                console.log(`• Total Transactions: ${data.transactions.length}`);
                console.log(`• Total Spent: €${data.totalAmount.toFixed(2)}`);
                console.log(`• Average Transaction: €${(data.totalAmount / data.transactions.length).toFixed(2)}`);
                console.log(`• First Transaction: ${data.transactions[0].date.toLocaleString()}`);
                console.log(`• Last Transaction: ${data.transactions[data.transactions.length - 1].date.toLocaleString()}`);
            });
        }

        // Try to fetch receipt details for a sample transaction
        if (sales.length > 0) {
            const sampleSale = sales[0];
            console.log('\n🧾 Attempting to get detailed receipt information...');
            console.log('='.repeat(50));
            
            try {
                const receiptResponse = await axios.get(`${API_URL}/receipt/${sampleSale.receiptNumber}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (receiptResponse.data) {
                    console.log('Receipt Details Found:');
                    console.log(JSON.stringify(receiptResponse.data, null, 2));
                }
            } catch (error) {
                console.log('Receipt endpoint not available');
            }
        }

        // Check for loyalty card information
        console.log('\n💳 Checking for Customer Card/Loyalty Information...');
        console.log('='.repeat(50));

        const uniquePaymentOptions = new Set(sales.map(s => s.paymentOptionNumber));
        console.log('Payment Options Found:', Array.from(uniquePaymentOptions));

        // Try to correlate customer numbers with staff data
        console.log('\n🔄 Cross-referencing with Staff Numbers...');
        console.log('='.repeat(50));

        const staffNumbers = new Set(sales.map(s => s.staffNumber));
        console.log(`Staff Numbers in Sales: ${staffNumbers.size}`);
        console.log(`Customer Numbers in Sales: ${customerNumbers.size}`);

        const overlap = Array.from(customerNumbers).filter(num => staffNumbers.has(num));
        if (overlap.length > 0) {
            console.log('\n⚠️ Warning: Found overlapping staff and customer numbers!');
            console.log('This might indicate staff purchases or a numbering system issue.');
        }

        console.log('\n📋 Conclusions:');
        if (customerNumbers.size > 0) {
            console.log('1. Customer numbers are present in sales data');
            console.log('2. Need to investigate if these are actual retail customers or staff');
            console.log('3. Consider checking for additional customer-related endpoints:');
            console.log('   - /receipt (for detailed transaction data)');
            console.log('   - /loyalty or /bonus (for customer programs)');
            console.log('   - /card (for customer card management)');
        } else {
            console.log('No distinct customer information found in sales data');
            console.log('This might indicate:');
            console.log('1. Anonymous retail transactions');
            console.log('2. Customer data stored in a separate system');
            console.log('3. Limited API access to customer data');
        }

    } catch (error) {
        console.error('Error analyzing sales data:', error.message);
        if (error.response) {
            console.error('Response:', error.response.data);
        }
    }
}

analyzeSalesForCustomers();
