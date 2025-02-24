export const mockDashboardData = {
  aggregateMetrics: {
    revenue: {
      total: 1250000,
      averageOrder: 250,
    },
    customers: {
      total: 5000,
    },
    inventory: {
      totalValue: 750000,
    },
  },
  enrichedData: {
    sales: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      revenue: Math.floor(Math.random() * 50000) + 30000,
      orders: Math.floor(Math.random() * 200) + 100,
    })),
  },
  analysis: {
    revenue: {
      monthly: Array.from({ length: 12 }, (_, i) => ({
        month: new Date(2024, i, 1).toLocaleString('default', { month: 'short' }),
        actual: Math.floor(Math.random() * 200000) + 100000,
        target: 150000,
      })),
    },
    product: Array.from({ length: 10 }, (_, i) => ({
      name: `Product ${i + 1}`,
      revenue: Math.floor(Math.random() * 100000) + 50000,
      units: Math.floor(Math.random() * 1000) + 500,
    })),
    branch: Array.from({ length: 5 }, (_, i) => ({
      name: `Branch ${i + 1}`,
      revenue: Math.random() * 100,
      orders: Math.random() * 100,
      customers: Math.random() * 100,
      satisfaction: Math.random() * 100,
    })),
    inventory: {
      stock: Array.from({ length: 20 }, (_, i) => ({
        product: `Product ${i + 1}`,
        stock: Math.floor(Math.random() * 1000) + 100,
        turnover: Math.random() * 5,
      })),
    },
    customer: {
      segments: [
        { name: 'Premium', value: 35 },
        { name: 'Standard', value: 45 },
        { name: 'Basic', value: 20 },
      ],
    },
  },
  predictions: {
    churn: Array.from({ length: 3 }, (_, i) => ({
      segment: ['High Risk', 'Medium Risk', 'Low Risk'][i],
      value: Math.floor(Math.random() * 1000) + 100,
    })),
    metrics: {
      'Model Accuracy': 0.92,
      'Prediction Confidence': 0.85,
      'Data Quality Score': 0.88,
    },
    trends: {
      'Revenue Growth': {
        direction: 'up',
        percentage: 15,
        description: 'Projected increase in next quarter',
      },
      'Customer Retention': {
        direction: 'up',
        percentage: 8,
        description: 'Expected improvement in retention rate',
      },
      'Market Share': {
        direction: 'up',
        percentage: 12,
        description: 'Forecasted market share growth',
      },
    },
  },
}
