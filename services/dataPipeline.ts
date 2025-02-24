import { chunk, flatten } from 'lodash'
import apiClient, { ENDPOINTS } from './apiClient'
import { Article, Branch, Category, Customer, Staff, Supplier } from '@/types/api'

// Configuration
const BATCH_SIZE = 100
const CONCURRENT_REQUESTS = 5
const MAX_RETRIES = 3
const RETRY_DELAY = 1000

interface DataBatch<T> {
  data: T[]
  page: number
  totalPages?: number
  hasMore: boolean
}

export class DataPipeline {
  private async fetchBatch<T>(
    endpoint: string,
    page: number,
    pageSize: number
  ): Promise<DataBatch<T>> {
    try {
      const response = await apiClient.get<T[]>(endpoint, {
        params: {
          limit: pageSize,
          offset: (page - 1) * pageSize,
        },
      })

      // Extract pagination info from headers
      const hasMore = response.headers['x-more-pages-available'] === 'True'
      const totalPages = response.headers['x-total-pages']
        ? parseInt(response.headers['x-total-pages'])
        : undefined

      return {
        data: response.data,
        page,
        totalPages,
        hasMore,
      }
    } catch (error) {
      console.error(`Error fetching batch from ${endpoint}, page ${page}:`, error)
      throw error
    }
  }

  private async fetchAllData<T>(endpoint: string): Promise<T[]> {
    let page = 1
    let allData: T[] = []
    let hasMore = true

    while (hasMore) {
      const batch = await this.fetchBatch<T>(endpoint, page, BATCH_SIZE)
      allData = [...allData, ...batch.data]
      hasMore = batch.hasMore
      page++

      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    return allData
  }

  private async enrichArticleData(
    articles: Article[],
    categories: Category[],
    suppliers: Supplier[]
  ): Promise<EnrichedArticle[]> {
    return articles.map(article => ({
      ...article,
      category: categories.find(c => c.id === article.categoryId),
      supplier: suppliers.find(s => s.id === article.supplierId),
      metrics: {
        margin: article.sellingPrice - article.purchasePrice,
        marginPercentage: ((article.sellingPrice - article.purchasePrice) / article.sellingPrice) * 100,
      },
    }))
  }

  private async enrichCustomerData(
    customers: Customer[],
    branches: Branch[]
  ): Promise<EnrichedCustomer[]> {
    return customers.map(customer => ({
      ...customer,
      branch: branches.find(b => b.id === customer.branchId),
      metrics: {
        lifetimeValue: customer.totalPurchases || 0,
        discountRate: customer.discountPercent || 0,
      },
    }))
  }

  async extractAndTransform(): Promise<EnrichedDataset> {
    try {
      console.log('Starting data extraction...')

      // Extract data from all endpoints concurrently
      const [articles, categories, suppliers, customers, branches, staff] = await Promise.all([
        this.fetchAllData<Article>(ENDPOINTS.ARTICLE),
        this.fetchAllData<Category>(ENDPOINTS.CATEGORY),
        this.fetchAllData<Supplier>(ENDPOINTS.SUPPLIER),
        this.fetchAllData<Customer>(ENDPOINTS.CUSTOMER),
        this.fetchAllData<Branch>(ENDPOINTS.BRANCH),
        this.fetchAllData<Staff>(ENDPOINTS.STAFF),
      ])

      console.log('Data extraction complete. Starting enrichment...')

      // Enrich the data
      const enrichedArticles = await this.enrichArticleData(articles, categories, suppliers)
      const enrichedCustomers = await this.enrichCustomerData(customers, branches)

      // Calculate aggregate metrics
      const aggregateMetrics = this.calculateAggregateMetrics(
        enrichedArticles,
        enrichedCustomers,
        branches
      )

      console.log('Data enrichment complete.')

      return {
        articles: enrichedArticles,
        categories,
        suppliers,
        customers: enrichedCustomers,
        branches,
        staff,
        aggregateMetrics,
      }
    } catch (error) {
      console.error('Error in data pipeline:', error)
      throw error
    }
  }

  private calculateAggregateMetrics(
    articles: EnrichedArticle[],
    customers: EnrichedCustomer[],
    branches: Branch[]
  ): AggregateMetrics {
    return {
      inventory: {
        totalProducts: articles.length,
        totalValue: articles.reduce((sum, article) => sum + article.stockQuantity * article.purchasePrice, 0),
        averageMargin: articles.reduce((sum, article) => sum + article.metrics.marginPercentage, 0) / articles.length,
      },
      customers: {
        totalCustomers: customers.length,
        averageLifetimeValue: customers.reduce((sum, customer) => sum + customer.metrics.lifetimeValue, 0) / customers.length,
        segmentation: this.calculateCustomerSegmentation(customers),
      },
      branches: {
        totalBranches: branches.length,
        performanceMetrics: this.calculateBranchPerformance(branches, customers),
      },
    }
  }

  private calculateCustomerSegmentation(customers: EnrichedCustomer[]): CustomerSegmentation {
    // Sort customers by lifetime value
    const sortedCustomers = [...customers].sort((a, b) => b.metrics.lifetimeValue - a.metrics.lifetimeValue)
    const totalCustomers = customers.length

    return {
      premium: sortedCustomers.slice(0, Math.floor(totalCustomers * 0.2)),
      regular: sortedCustomers.slice(Math.floor(totalCustomers * 0.2), Math.floor(totalCustomers * 0.8)),
      occasional: sortedCustomers.slice(Math.floor(totalCustomers * 0.8)),
    }
  }

  private calculateBranchPerformance(branches: Branch[], customers: EnrichedCustomer[]): BranchPerformance[] {
    return branches.map(branch => {
      const branchCustomers = customers.filter(customer => customer.branchId === branch.id)
      
      return {
        branchId: branch.id,
        branchName: branch.name,
        customerCount: branchCustomers.length,
        totalRevenue: branchCustomers.reduce((sum, customer) => sum + customer.metrics.lifetimeValue, 0),
        averageCustomerValue: branchCustomers.length > 0
          ? branchCustomers.reduce((sum, customer) => sum + customer.metrics.lifetimeValue, 0) / branchCustomers.length
          : 0,
      }
    })
  }
}

// Types for enriched data
interface EnrichedArticle extends Article {
  category?: Category
  supplier?: Supplier
  metrics: {
    margin: number
    marginPercentage: number
  }
}

interface EnrichedCustomer extends Customer {
  branch?: Branch
  metrics: {
    lifetimeValue: number
    discountRate: number
  }
}

interface CustomerSegmentation {
  premium: EnrichedCustomer[]
  regular: EnrichedCustomer[]
  occasional: EnrichedCustomer[]
}

interface BranchPerformance {
  branchId: string
  branchName: string
  customerCount: number
  totalRevenue: number
  averageCustomerValue: number
}

interface AggregateMetrics {
  inventory: {
    totalProducts: number
    totalValue: number
    averageMargin: number
  }
  customers: {
    totalCustomers: number
    averageLifetimeValue: number
    segmentation: CustomerSegmentation
  }
  branches: {
    totalBranches: number
    performanceMetrics: BranchPerformance[]
  }
}

interface EnrichedDataset {
  articles: EnrichedArticle[]
  categories: Category[]
  suppliers: Supplier[]
  customers: EnrichedCustomer[]
  branches: Branch[]
  staff: Staff[]
  aggregateMetrics: AggregateMetrics
}
