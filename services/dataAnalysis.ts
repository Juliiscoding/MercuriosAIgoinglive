import { EnrichedArticle, EnrichedCustomer, BranchPerformance, AggregateMetrics } from './dataPipeline'

export class DataAnalysis {
  // Product Analysis
  analyzeProductPerformance(articles: EnrichedArticle[]) {
    const sortedByMargin = [...articles].sort((a, b) => b.metrics.margin - a.metrics.margin)
    const sortedByStock = [...articles].sort((a, b) => b.stockQuantity - a.stockQuantity)

    return {
      topPerformers: sortedByMargin.slice(0, 10),
      lowPerformers: sortedByMargin.slice(-10),
      overstocked: sortedByStock.slice(0, 10),
      categoryPerformance: this.analyzeCategoryPerformance(articles),
      supplierPerformance: this.analyzeSupplierPerformance(articles),
    }
  }

  private analyzeCategoryPerformance(articles: EnrichedArticle[]) {
    const categoryMap = new Map<string, {
      totalRevenue: number
      totalMargin: number
      productCount: number
      averageMargin: number
    }>()

    articles.forEach(article => {
      if (!article.category) return

      const current = categoryMap.get(article.category.id) || {
        totalRevenue: 0,
        totalMargin: 0,
        productCount: 0,
        averageMargin: 0,
      }

      categoryMap.set(article.category.id, {
        totalRevenue: current.totalRevenue + (article.sellingPrice * article.stockQuantity),
        totalMargin: current.totalMargin + article.metrics.margin,
        productCount: current.productCount + 1,
        averageMargin: (current.totalMargin + article.metrics.margin) / (current.productCount + 1),
      })
    })

    return Array.from(categoryMap.entries()).map(([categoryId, metrics]) => ({
      categoryId,
      ...metrics,
    }))
  }

  private analyzeSupplierPerformance(articles: EnrichedArticle[]) {
    const supplierMap = new Map<string, {
      totalPurchaseValue: number
      productCount: number
      averageMargin: number
    }>()

    articles.forEach(article => {
      if (!article.supplier) return

      const current = supplierMap.get(article.supplier.id) || {
        totalPurchaseValue: 0,
        productCount: 0,
        averageMargin: 0,
      }

      supplierMap.set(article.supplier.id, {
        totalPurchaseValue: current.totalPurchaseValue + (article.purchasePrice * article.stockQuantity),
        productCount: current.productCount + 1,
        averageMargin: (current.averageMargin * current.productCount + article.metrics.marginPercentage) / (current.productCount + 1),
      })
    })

    return Array.from(supplierMap.entries()).map(([supplierId, metrics]) => ({
      supplierId,
      ...metrics,
    }))
  }

  // Customer Analysis
  analyzeCustomerBehavior(customers: EnrichedCustomer[]) {
    const sortedByValue = [...customers].sort((a, b) => b.metrics.lifetimeValue - a.metrics.lifetimeValue)

    return {
      topCustomers: sortedByValue.slice(0, 10),
      customerSegments: this.analyzeCustomerSegments(customers),
      geographicDistribution: this.analyzeGeographicDistribution(customers),
    }
  }

  private analyzeCustomerSegments(customers: EnrichedCustomer[]) {
    const totalCustomers = customers.length
    const sortedByValue = [...customers].sort((a, b) => b.metrics.lifetimeValue - a.metrics.lifetimeValue)

    return {
      premium: {
        customers: sortedByValue.slice(0, Math.floor(totalCustomers * 0.2)),
        metrics: this.calculateSegmentMetrics(sortedByValue.slice(0, Math.floor(totalCustomers * 0.2))),
      },
      regular: {
        customers: sortedByValue.slice(Math.floor(totalCustomers * 0.2), Math.floor(totalCustomers * 0.8)),
        metrics: this.calculateSegmentMetrics(sortedByValue.slice(Math.floor(totalCustomers * 0.2), Math.floor(totalCustomers * 0.8))),
      },
      occasional: {
        customers: sortedByValue.slice(Math.floor(totalCustomers * 0.8)),
        metrics: this.calculateSegmentMetrics(sortedByValue.slice(Math.floor(totalCustomers * 0.8))),
      },
    }
  }

  private calculateSegmentMetrics(customers: EnrichedCustomer[]) {
    return {
      averageLifetimeValue: customers.reduce((sum, c) => sum + c.metrics.lifetimeValue, 0) / customers.length,
      averageDiscount: customers.reduce((sum, c) => sum + c.discountPercent, 0) / customers.length,
      totalCustomers: customers.length,
    }
  }

  private analyzeGeographicDistribution(customers: EnrichedCustomer[]) {
    const distribution = new Map<string, {
      customerCount: number
      totalValue: number
      averageValue: number
    }>()

    customers.forEach(customer => {
      const region = customer.address.city
      const current = distribution.get(region) || {
        customerCount: 0,
        totalValue: 0,
        averageValue: 0,
      }

      distribution.set(region, {
        customerCount: current.customerCount + 1,
        totalValue: current.totalValue + customer.metrics.lifetimeValue,
        averageValue: (current.totalValue + customer.metrics.lifetimeValue) / (current.customerCount + 1),
      })
    })

    return Array.from(distribution.entries()).map(([region, metrics]) => ({
      region,
      ...metrics,
    }))
  }

  // Branch Analysis
  analyzeBranchPerformance(branchMetrics: BranchPerformance[]) {
    const sortedByRevenue = [...branchMetrics].sort((a, b) => b.totalRevenue - a.totalRevenue)

    return {
      topBranches: sortedByRevenue.slice(0, 5),
      lowPerformingBranches: sortedByRevenue.slice(-5),
      branchComparison: this.compareBranchPerformance(branchMetrics),
    }
  }

  private compareBranchPerformance(branches: BranchPerformance[]) {
    const averageRevenue = branches.reduce((sum, b) => sum + b.totalRevenue, 0) / branches.length
    const averageCustomerValue = branches.reduce((sum, b) => sum + b.averageCustomerValue, 0) / branches.length

    return branches.map(branch => ({
      ...branch,
      revenuePerformance: (branch.totalRevenue / averageRevenue) * 100,
      customerValuePerformance: (branch.averageCustomerValue / averageCustomerValue) * 100,
    }))
  }

  // Trend Analysis
  analyzeTrends(metrics: AggregateMetrics, historicalData: AggregateMetrics[]) {
    return {
      inventory: this.analyzeInventoryTrends(metrics, historicalData),
      customers: this.analyzeCustomerTrends(metrics, historicalData),
      branches: this.analyzeBranchTrends(metrics, historicalData),
    }
  }

  private analyzeInventoryTrends(current: AggregateMetrics, historical: AggregateMetrics[]) {
    return {
      valueGrowth: this.calculateGrowth(
        current.inventory.totalValue,
        historical[historical.length - 1]?.inventory.totalValue
      ),
      marginTrend: this.calculateTrend(
        historical.map(h => h.inventory.averageMargin)
      ),
    }
  }

  private analyzeCustomerTrends(current: AggregateMetrics, historical: AggregateMetrics[]) {
    return {
      customerGrowth: this.calculateGrowth(
        current.customers.totalCustomers,
        historical[historical.length - 1]?.customers.totalCustomers
      ),
      lifetimeValueTrend: this.calculateTrend(
        historical.map(h => h.customers.averageLifetimeValue)
      ),
    }
  }

  private analyzeBranchTrends(current: AggregateMetrics, historical: AggregateMetrics[]) {
    return {
      branchGrowth: this.calculateGrowth(
        current.branches.totalBranches,
        historical[historical.length - 1]?.branches.totalBranches
      ),
      performanceTrend: this.calculateTrend(
        historical.map(h => 
          h.branches.performanceMetrics.reduce((sum, b) => sum + b.totalRevenue, 0) / h.branches.totalBranches
        )
      ),
    }
  }

  private calculateGrowth(current: number, previous: number): number {
    if (!previous) return 0
    return ((current - previous) / previous) * 100
  }

  private calculateTrend(values: number[]): 'increasing' | 'decreasing' | 'stable' {
    if (values.length < 2) return 'stable'

    const trend = values.slice(1).reduce((acc, curr, i) => acc + (curr - values[i]), 0)
    if (Math.abs(trend) < values[0] * 0.05) return 'stable'
    return trend > 0 ? 'increasing' : 'decreasing'
  }
}
