import { Sale, TransformedSalesData } from "@/types/api"
import { groupBy, sumBy } from "lodash"

export function transformSalesData(sales: Sale[]): TransformedSalesData {
  // Filter out deleted items
  const validSales = sales.filter(sale => !sale.isDeleted)

  // Calculate total sales and items
  const totalSales = sumBy(validSales, sale => sale.salePrice * sale.quantity)
  const totalItems = sumBy(validSales, 'quantity')

  // Calculate gross margin
  const totalCost = sumBy(validSales, sale => sale.purchasePrice * sale.quantity)
  const grossMargin = ((totalSales - totalCost) / totalSales) * 100

  // Calculate return rate
  const returns = validSales.filter(sale => sale.quantity < 0)
  const returnRate = (Math.abs(sumBy(returns, 'quantity')) / totalItems) * 100

  // Group sales by date
  const salesByDate = Object.entries(groupBy(validSales, sale => sale.date.split('T')[0]))
    .map(([date, sales]) => ({
      date,
      total: sumBy(sales, sale => sale.salePrice * sale.quantity),
      items: sumBy(sales, 'quantity'),
    }))
    .sort((a, b) => a.date.localeCompare(b.date))

  // Group sales by hour
  const salesByHour = Object.entries(groupBy(validSales, sale => Math.floor(sale.time / 3600)))
    .map(([hour, sales]) => ({
      hour: parseInt(hour),
      total: sumBy(sales, sale => sale.salePrice * sale.quantity),
      items: sumBy(sales, 'quantity'),
    }))
    .sort((a, b) => a.hour - b.hour)

  // Calculate top products
  const productSales = Object.entries(groupBy(validSales, 'articleNumber'))
    .map(([articleNumber, sales]) => ({
      articleNumber: parseInt(articleNumber),
      total: sumBy(sales, sale => sale.salePrice * sale.quantity),
      quantity: sumBy(sales, 'quantity'),
      revenue: sumBy(sales, sale => (sale.salePrice - sale.purchasePrice) * sale.quantity),
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)

  // Group sales by branch
  const salesByBranch = Object.entries(groupBy(validSales, 'branchNumber'))
    .map(([branchNumber, sales]) => ({
      branchNumber: parseInt(branchNumber),
      total: sumBy(sales, sale => sale.salePrice * sale.quantity),
      items: sumBy(sales, 'quantity'),
    }))
    .sort((a, b) => b.total - a.total)

  // Group sales by staff
  const salesByStaff = Object.entries(groupBy(validSales, 'staffNumber'))
    .map(([staffNumber, sales]) => ({
      staffNumber: parseInt(staffNumber),
      total: sumBy(sales, sale => sale.salePrice * sale.quantity),
      items: sumBy(sales, 'quantity'),
    }))
    .sort((a, b) => b.total - a.total)

  // Group by payment method
  const paymentMethods = Object.entries(groupBy(validSales, 'paymentOptionNumber'))
    .map(([paymentOptionNumber, sales]) => ({
      paymentOptionNumber: parseInt(paymentOptionNumber),
      total: sumBy(sales, sale => sale.salePrice * sale.quantity),
      count: sales.length,
    }))
    .sort((a, b) => b.total - a.total)

  // Calculate average order value
  const uniqueOrders = new Set(validSales.map(sale => sale.receiptNumber))
  const averageOrderValue = totalSales / uniqueOrders.size

  return {
    totalSales,
    totalItems,
    averageOrderValue,
    grossMargin,
    returnRate,
    salesByDate,
    salesByHour,
    topProducts,
    salesByBranch,
    salesByStaff,
    paymentMethods,
  }
}
