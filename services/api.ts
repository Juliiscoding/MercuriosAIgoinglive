import axios from 'axios'
import type { 
  DashboardMetrics, 
  ApiListResponse, 
  Sale, 
  Customer, 
  Article, 
  Branch 
} from '../types/api'

const AUTH_URL = 'https://auth.prohandel.cloud/api/v4'
const API_URL = 'https://linde.prohandel.de/api/v2'
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '7e7c639358434c4fa215d4e3978739d0'
const API_SECRET = process.env.NEXT_PUBLIC_API_SECRET || '1cjnuux79d'

interface TokenResponse {
  token: {
    token: {
      value: string
      name: string
      expiresIn: number
    }
    refreshToken: {
      value: string
      name: string
      expiresIn: number
    }
  }
  serverUrl: string
  requiredActions: string[]
}

export class ApiClient {
  private static instance: ApiClient
  private accessToken: string | null = null
  private refreshToken: string | null = null
  private tokenExpiry: number | null = null

  private constructor() {}

  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient()
    }
    return ApiClient.instance
  }

  private async authenticate(): Promise<void> {
    try {
      const response = await axios.post<TokenResponse>(`${AUTH_URL}/token`, {
        apiKey: API_KEY,
        secret: API_SECRET
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.data.token) {
        this.accessToken = response.data.token.token.value
        this.refreshToken = response.data.token.refreshToken.value
        this.tokenExpiry = Date.now() + (response.data.token.token.expiresIn * 1000)
      } else {
        throw new Error('Invalid authentication response')
      }
    } catch (error) {
      console.error('Authentication failed:', error)
      throw error
    }
  }

  private async refreshAccessToken(): Promise<void> {
    try {
      if (!this.refreshToken) {
        throw new Error('No refresh token available')
      }

      const response = await axios.post<TokenResponse>(
        `${AUTH_URL}/token/refresh`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.refreshToken}`
          }
        }
      )

      if (response.data.token) {
        this.accessToken = response.data.token.token.value
        this.refreshToken = response.data.token.refreshToken.value
        this.tokenExpiry = Date.now() + (response.data.token.token.expiresIn * 1000)
      } else {
        throw new Error('Invalid refresh token response')
      }
    } catch (error) {
      console.error('Token refresh failed:', error)
      // If refresh fails, try full authentication
      await this.authenticate()
    }
  }

  private async ensureValidToken(): Promise<string> {
    if (!this.accessToken || !this.tokenExpiry) {
      await this.authenticate()
    } else if (Date.now() >= this.tokenExpiry - 300000) { // Refresh if less than 5 minutes remaining
      await this.refreshAccessToken()
    }

    return this.accessToken!
  }

  async request<T>(method: string, endpoint: string, data?: any): Promise<T> {
    try {
      const token = await this.ensureValidToken()

      const response = await axios.request<T>({
        method,
        url: `${API_URL}${endpoint}`,
        data,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      return response.data
    } catch (error: any) {
      if (error.response?.status === 401) {
        // Token might be invalid, try refreshing
        await this.refreshAccessToken()
        
        // Retry the request with new token
        const token = await this.ensureValidToken()
        const response = await axios.request<T>({
          method,
          url: `${API_URL}${endpoint}`,
          data,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })

        return response.data
      }
      throw error
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>('GET', endpoint)
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>('POST', endpoint, data)
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>('PUT', endpoint, data)
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>('DELETE', endpoint)
  }

  async fetchDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      const [customersRes, articlesRes, branchesRes, salesRes] = await Promise.all([
        this.get<ApiListResponse<Customer>>('/customer?pagesize=100'),
        this.get<ApiListResponse<Article>>('/article?pagesize=100'),
        this.get<ApiListResponse<Branch>>('/branch?pagesize=100'),
        this.get<ApiListResponse<Sale>>('/sale?pagesize=100&fromDate=' + encodeURIComponent(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()))
      ])

      // Process sales data
      const now = new Date()
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      
      const recentSales = (salesRes?.items || []).filter(sale => 
        new Date(sale.date) >= thirtyDaysAgo && !sale.isDeleted
      )

      // Calculate daily revenue trend
      const dailyTrend: number[] = []
      for (let i = 0; i < 7; i++) {
        const day = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
        const daysSales = recentSales.filter(sale => 
          new Date(sale.date).toDateString() === day.toDateString()
        )
        const revenue = daysSales.reduce((sum, sale) => sum + sale.salePrice, 0)
        dailyTrend.unshift(revenue)
      }

      // Calculate monthly revenue trend
      const monthlyTrend: number[] = []
      for (let i = 0; i < 3; i++) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
        const monthsSales = (salesRes?.items || []).filter(sale => {
          const saleDate = new Date(sale.date)
          return saleDate >= monthStart && saleDate <= monthEnd && !sale.isDeleted
        })
        const revenue = monthsSales.reduce((sum, sale) => sum + sale.salePrice, 0)
        monthlyTrend.unshift(revenue)
      }

      return {
        revenue: {
          total: recentSales.reduce((sum, sale) => sum + sale.salePrice, 0),
          averageOrder: recentSales.reduce((sum, sale) => sum + sale.salePrice, 0) / recentSales.length || 0,
          dailyTrend,
          monthlyTrend
        },
        products: {
          total: articlesRes?.total || 0,
          inStock: (articlesRes?.items || []).filter(a => a.stock > 10).length,
          lowStock: (articlesRes?.items || []).filter(a => a.stock > 0 && a.stock <= 10).length,
          outOfStock: (articlesRes?.items || []).filter(a => a.stock === 0).length
        },
        customers: {
          total: customersRes?.total || 0,
          active: (customersRes?.items || []).filter(c => !c.inactiveFlag && !c.isDeleted).length,
          new: (customersRes?.items || []).filter(c => {
            const creationDate = new Date(c.creationDate)
            return (now.getTime() - creationDate.getTime()) <= 30 * 24 * 60 * 60 * 1000
          }).length,
          churnRate: 2.5 // Mock value, would need historical data to calculate
        },
        branches: {
          total: branchesRes?.total || 0,
          active: (branchesRes?.items || []).filter(b => !b.isDeleted).length,
          performance: (branchesRes?.items || []).map(branch => {
            const branchSales = recentSales.filter(s => s.branchNumber === branch.number)
            return {
              id: branch.id,
              name: branch.name,
              revenue: branchSales.reduce((sum, sale) => sum + sale.salePrice, 0),
              orders: branchSales.length,
              satisfaction: 90 + Math.random() * 10 // Mock value
            }
          })
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error)
      throw error
    }
  }
}

export async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  const client = ApiClient.getInstance();
  const response = await client.get('/dashboard/metrics');
  return response.data;
}

export const api = ApiClient.getInstance();
export type { DashboardMetrics }
