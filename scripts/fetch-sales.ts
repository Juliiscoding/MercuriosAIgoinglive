import { api } from '../services/api';
import type { Sale, ApiListResponse } from '../types/api';

async function fetchRealtimeSales() {
  try {
    // Get sales from the last hour
    const fromDate = new Date();
    fromDate.setHours(fromDate.getHours() - 1);
    
    const response = await api.get<ApiListResponse<Sale>>(`/sale?pagesize=100&fromDate=${encodeURIComponent(fromDate.toISOString())}`);
    
    if (!response.items.length) {
      console.log('No sales found in the last hour.');
      return;
    }

    console.log(`\nFound ${response.items.length} sales in the last hour:\n`);
    
    response.items
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
    const totalSales = response.items.reduce((sum, sale) => sum + sale.salePrice, 0);
    console.log(`\nTotal sales in the last hour: €${totalSales.toFixed(2)}`);
    
  } catch (error) {
    console.error('Error fetching sales:', error);
  }
}

fetchRealtimeSales();
