const axios = require('axios');

const AUTH_URL = 'https://auth.prohandel.cloud/api/v4';
const API_URL = 'https://api.prohandel.de/api/v2';
const API_KEY = '7e7c639358434c4fa215d4e3978739d0';
const API_SECRET = '1cjnuux79d';

async function authenticate() {
  try {
    const response = await axios.post(`${AUTH_URL}/token`, {
      apiKey: API_KEY,
      secret: API_SECRET
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return response.data.token.token.value;
  } catch (error) {
    console.error('Authentication failed:', error.message);
    throw error;
  }
}

async function fetchRealtimeSales() {
  try {
    // Get authentication token
    const token = await authenticate();
    
    // Get sales from the last hour
    const fromDate = new Date();
    fromDate.setHours(fromDate.getHours() - 1);
    
    const response = await axios.get(
      `${API_URL}/sale?pagesize=100&fromDate=${encodeURIComponent(fromDate.toISOString())}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const sales = response.data.items || [];
    
    if (!sales.length) {
      console.log('No sales found in the last hour.');
      return;
    }

    console.log(`\nFound ${sales.length} sales in the last hour:\n`);
    
    sales
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .forEach(sale => {
        const saleDate = new Date(sale.date);
        console.log(`Time: ${saleDate.toLocaleTimeString()}`);
        console.log(`Sale ID: ${sale.id}`);
        console.log(`Branch: ${sale.branchNumber}`);
        console.log(`Amount: €${sale.salePrice.toFixed(2)}`);
        console.log('-------------------');
      });

    // Calculate total sales
    const totalSales = sales.reduce((sum, sale) => sum + sale.salePrice, 0);
    console.log(`\nTotal sales in the last hour: €${totalSales.toFixed(2)}`);
    
  } catch (error) {
    console.error('Error fetching sales:', error.message);
  }
}

fetchRealtimeSales();
