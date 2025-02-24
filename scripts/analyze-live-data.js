const axios = require('axios');
const WebSocket = require('ws');

const AUTH_URL = 'https://auth.prohandel.cloud/api/v4';
const API_URL = 'https://linde.prohandel.de/api/v2';
const WS_URL = 'wss://linde.prohandel.de/api/v2/ws';
const API_KEY = '7e7c639358434c4fa215d4e3978739d0';
const API_SECRET = '1cjnuux79d';

async function authenticate() {
    try {
        const response = await axios.post(`${AUTH_URL}/token`, {
            apiKey: API_KEY,
            secret: API_SECRET
        }, {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data.token.token.value;
    } catch (error) {
        console.error('Authentication failed:', error.message);
        throw error;
    }
}

async function makeRequest(endpoint, params = {}) {
    try {
        const token = await authenticate();
        const queryString = new URLSearchParams(params).toString();
        const url = `${API_URL}/${endpoint}${queryString ? '?' + queryString : ''}`;
        
        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        return response.data;
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error.message);
        return null;
    }
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleString('de-DE');
}

async function analyzeLiveData() {
    console.log('🔄 Fetching and analyzing live ProHandel data...\n');

    // 1. Recent Sales Analysis
    console.log('📊 SALES ANALYSIS');
    console.log('=================');
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const sales = await makeRequest('sale', {
        pagesize: 100,
        fromDate: lastWeek.toISOString()
    });

    if (sales && sales.length > 0) {
        const totalRevenue = sales.reduce((sum, sale) => sum + sale.salePrice, 0);
        const averageOrderValue = totalRevenue / sales.length;
        const uniqueBranches = new Set(sales.map(sale => sale.branchNumber)).size;
        const uniqueCustomers = new Set(sales.map(sale => sale.customerNumber)).size;

        console.log(`📈 Last 7 Days Summary:`);
        console.log(`• Total Sales: ${sales.length}`);
        console.log(`• Total Revenue: ${formatCurrency(totalRevenue)}`);
        console.log(`• Average Order Value: ${formatCurrency(averageOrderValue)}`);
        console.log(`• Active Branches: ${uniqueBranches}`);
        console.log(`• Unique Customers: ${uniqueCustomers}`);
        
        console.log('\n🔥 Most Recent Transactions:');
        const recentSales = sales
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5);

        recentSales.forEach(sale => {
            console.log(`• ${formatDate(sale.date)} - Amount: ${formatCurrency(sale.salePrice)} (Branch: ${sale.branchNumber})`);
        });
    }

    // 2. Inventory Status
    console.log('\n📦 INVENTORY STATUS');
    console.log('=================');
    const articles = await makeRequest('article', { pagesize: 100 });

    if (articles && articles.length > 0) {
        const totalStock = articles.reduce((sum, article) => sum + (article.stock || 0), 0);
        const lowStockThreshold = 10;
        const lowStockItems = articles.filter(article => article.stock < lowStockThreshold);
        const outOfStockItems = articles.filter(article => article.stock === 0);

        console.log(`• Total Products: ${articles.length}`);
        console.log(`• Total Stock: ${totalStock} units`);
        console.log(`• Low Stock Items: ${lowStockItems.length}`);
        console.log(`• Out of Stock Items: ${outOfStockItems.length}`);

        console.log('\n💎 Top Priced Items:');
        const topPricedItems = articles
            .sort((a, b) => b.price - a.price)
            .slice(0, 5);

        topPricedItems.forEach(article => {
            console.log(`• ${article.name || article.number} - Price: ${formatCurrency(article.price)}`);
        });
    }

    // 3. Branch Performance
    console.log('\n🏪 BRANCH PERFORMANCE');
    console.log('===================');
    const branches = await makeRequest('branch', { pagesize: 100 });

    if (branches && branches.length > 0) {
        console.log(`• Total Active Branches: ${branches.filter(b => b.isActive).length}`);
        
        console.log('\nBranch Details:');
        branches
            .filter(b => b.isActive)
            .forEach(branch => {
                console.log(`\n📍 ${branch.name1}`);
                console.log(`   Location: ${branch.street}, ${branch.zipCode} ${branch.city}`);
                console.log(`   Contact: ${branch.telephoneNumber}`);
                if (branch.email) console.log(`   Email: ${branch.email}`);
            });
    }

    // 4. Customer Insights
    console.log('\n👥 CUSTOMER INSIGHTS');
    console.log('==================');
    const customers = await makeRequest('customer', { pagesize: 100 });

    if (customers && customers.length > 0) {
        const activeCustomers = customers.filter(c => !c.isDeleted && !c.inactiveFlag);
        const businessCustomers = customers.filter(c => c.isBusiness);
        
        console.log(`• Total Customers: ${customers.length}`);
        console.log(`• Active Customers: ${activeCustomers.length}`);
        console.log(`• Business Customers: ${businessCustomers.length}`);
        console.log(`• Newsletter Subscribers: ${customers.filter(c => c.subscriptionNewsletter).length}`);

        console.log('\n🌟 Top Customers (by Revenue):');
        customers
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5)
            .forEach(customer => {
                console.log(`• ${customer.name1} - Revenue: ${formatCurrency(customer.revenue)}`);
            });
    }
}

// Start real-time monitoring
async function startRealtimeMonitoring() {
    const token = await authenticate();
    const ws = new WebSocket(`${WS_URL}?token=${token}`);

    console.log('\n📡 REAL-TIME MONITORING');
    console.log('====================');
    console.log('Connecting to real-time feed...');

    ws.on('open', () => {
        console.log('✅ Connected to real-time feed');
        
        // Subscribe to all relevant channels
        ws.send(JSON.stringify({
            type: 'subscribe',
            channels: ['sale', 'article', 'customer', 'branch']
        }));
    });

    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data);
            if (message.type === 'sale') {
                const sale = message.data;
                console.log('\n🔔 New Sale:');
                console.log(`Time: ${formatDate(sale.date)}`);
                console.log(`Amount: ${formatCurrency(sale.salePrice)}`);
                console.log(`Branch: ${sale.branchNumber}`);
            }
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });

    ws.on('close', () => {
        console.log('❌ Disconnected from real-time feed');
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });

    // Keep the connection alive
    setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
        }
    }, 30000);
}

// Run both analysis and monitoring
Promise.all([
    analyzeLiveData(),
    startRealtimeMonitoring()
]).catch(console.error);
