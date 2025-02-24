const axios = require('axios');

const AUTH_URL = 'https://auth.prohandel.cloud/api/v4';
const API_URL = 'https://linde.prohandel.de/api/v2';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '7e7c639358434c4fa215d4e3978739d0';
const API_SECRET = process.env.NEXT_PUBLIC_API_SECRET || '1cjnuux79d';

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

async function fetchSalesPage(token, page = 1, pageSize = 1000) {
    const response = await axios.get(`${API_URL}/sale`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        params: {
            pagesize: pageSize,
            page: page
        }
    });
    return response.data;
}

async function analyzeSales() {
    try {
        console.log('Authenticating...');
        const token = await authenticate();
        console.log('Authentication successful\n');
        
        const allSales = [];
        let page = 1;
        const maxPages = 5; // Limit to 5000 records for now
        
        console.log('Fetching sales data...');
        while (page <= maxPages) {
            console.log(`Fetching page ${page}...`);
            const sales = await fetchSalesPage(token, page);
            if (!Array.isArray(sales) || sales.length === 0) {
                break;
            }
            allSales.push(...sales);
            page++;
        }

        console.log(`\nFetched ${allSales.length} total records`);

        // Filter out deleted sales and returns
        const validSales = allSales.filter(sale => 
            !sale.isDeleted && 
            sale.type !== 2 // Exclude returns/cancellations
        );

        // Group sales by branch
        const salesByBranch = {};
        validSales.forEach(sale => {
            if (!salesByBranch[sale.branchNumber]) {
                salesByBranch[sale.branchNumber] = {
                    count: 0,
                    revenue: 0,
                    dates: new Set(),
                    articles: new Set(),
                    years: new Set()
                };
            }
            salesByBranch[sale.branchNumber].count++;
            salesByBranch[sale.branchNumber].revenue += sale.salePrice;
            salesByBranch[sale.branchNumber].dates.add(sale.date.split('T')[0]);
            salesByBranch[sale.branchNumber].articles.add(sale.articleNumber);
            salesByBranch[sale.branchNumber].years.add(new Date(sale.date).getFullYear());
        });

        // Print analysis
        console.log('\n=== Sales Data Analysis ===\n');
        console.log(`Total Records: ${allSales.length}`);
        console.log(`Valid Sales (excluding returns/deleted): ${validSales.length}`);
        console.log(`Number of Branches with Sales: ${Object.keys(salesByBranch).length}`);

        console.log('\n=== Sales by Branch ===\n');
        Object.entries(salesByBranch)
            .sort((a, b) => b[1].revenue - a[1].revenue)
            .forEach(([branchNumber, data]) => {
                const dateArray = Array.from(data.dates);
                const minDate = new Date(Math.min(...dateArray.map(d => new Date(d))));
                const maxDate = new Date(Math.max(...dateArray.map(d => new Date(d))));
                const years = Array.from(data.years).sort();
                
                console.log(`Branch ${branchNumber}:`);
                console.log(`  Transactions: ${data.count}`);
                console.log(`  Revenue: €${data.revenue.toFixed(2)}`);
                console.log(`  Average Order Value: €${(data.revenue / data.count).toFixed(2)}`);
                console.log(`  Unique Products Sold: ${data.articles.size}`);
                console.log(`  Years with Data: ${years.join(', ')}`);
                console.log(`  Date Range: ${minDate.toLocaleDateString()} to ${maxDate.toLocaleDateString()}`);
                console.log(`  Days with Sales: ${data.dates.size}`);
                console.log('-'.repeat(50));
            });

        // Analyze years with data
        const allYears = new Set();
        validSales.forEach(sale => {
            allYears.add(new Date(sale.date).getFullYear());
        });
        console.log('\n=== Years with Sales Data ===');
        console.log(Array.from(allYears).sort().join(', '));

        // Get sample of recent transactions
        console.log('\n=== Sample of Recent Transactions ===\n');
        const recentSales = validSales
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);

        recentSales.forEach(sale => {
            console.log(`Transaction ID: ${sale.id}`);
            console.log(`  Branch: ${sale.branchNumber}`);
            console.log(`  Date: ${new Date(sale.date).toLocaleString()}`);
            console.log(`  Article: ${sale.articleNumber}`);
            console.log(`  Sale Price: €${sale.salePrice.toFixed(2)}`);
            console.log(`  Label Price: €${sale.labelPrice ? sale.labelPrice.toFixed(2) : 'N/A'}`);
            console.log(`  Discount: €${sale.discount ? sale.discount.toFixed(2) : '0.00'}`);
            console.log('-'.repeat(30));
        });

    } catch (error) {
        console.error('Error analyzing sales:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

analyzeSales();
