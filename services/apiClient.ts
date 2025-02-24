import axios, { AxiosInstance } from "axios"
import { Sale } from "@/types/api"

const API_KEY = "7e7c639358434c4fa215d4e3978739d0"
const API_PASSWORD = "1cjnuux79d"
const BASE_URL = "https://api.prohandel.de"
const AUTH_URL = "https://auth.prohandel.cloud/api/v4/token"
const REFRESH_URL = "https://auth.prohandel.cloud/api/v4/token/refresh"

interface AuthResponse {
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

// API Endpoints
export const ENDPOINTS = {
  CUSTOMER: "/api/v2/customer",
  SUPPLIER: "/api/v2/supplier",
  CATEGORY: "/api/v2/category",
  STAFF: "/api/v2/staff",
  ARTICLE: "/api/v2/article",
  BRANCH: "/api/v2/branch"
}

class ApiClient {
  private axiosInstance: AxiosInstance
  private accessToken: string | null = null
  private refreshToken: string | null = null
  private tokenExpiresAt: number | null = null
  private refreshTokenExpiresAt: number | null = null

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: BASE_URL,
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
    })

    // Add response interceptor for token handling
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        // Check if token needs refresh (if less than 25% of lifetime remains)
        if (this.shouldRefreshToken()) {
          await this.refreshAccessToken()
        }
        
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Add response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response) {
          const { status, data } = error.response
          switch (status) {
            case 401:
              if (error.response.headers["www-authenticate"]?.includes("invalid_token")) {
                try {
                  await this.authenticate()
                  // Retry the original request
                  const originalRequest = error.config
                  return this.axiosInstance(originalRequest)
                } catch (authError) {
                  console.error("Authentication failed:", authError)
                }
              }
              console.error("Authentication failed. Please check your API credentials.")
              break
            case 403:
              console.error("Access forbidden. Please check your permissions.")
              break
            case 404:
              console.error("Resource not found:", error.config.url)
              break
            case 429:
              console.error("Rate limit exceeded. Please try again later.")
              break
            case 500:
              console.error("Server error. Please try again later.")
              break
            default:
              console.error("API error:", data)
          }
        } else if (error.request) {
          console.error("No response received:", error.request)
        } else {
          console.error("Error setting up request:", error.message)
        }
        return Promise.reject(error)
      }
    )
  }

  private shouldRefreshToken(): boolean {
    if (!this.tokenExpiresAt || !this.accessToken) return true
    
    const now = Date.now()
    const timeUntilExpiry = this.tokenExpiresAt - now
    const tokenLifetime = this.tokenExpiresAt - (now - 1800000) // 1800 seconds = 30 minutes
    
    // Refresh if less than 25% of lifetime remains
    return timeUntilExpiry < tokenLifetime * 0.25
  }

  private async authenticate(): Promise<void> {
    try {
      const response = await axios.post<AuthResponse>(AUTH_URL, {
        apiKey: API_KEY,
        secret: API_PASSWORD,
      })

      const { token } = response.data
      this.accessToken = token.token.value
      this.refreshToken = token.refreshToken.value
      
      // Set expiration times
      const now = Date.now()
      this.tokenExpiresAt = now + token.token.expiresIn * 1000
      this.refreshTokenExpiresAt = now + token.refreshToken.expiresIn * 1000
    } catch (error) {
      console.error("Authentication failed:", error)
      throw error
    }
  }

  private async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      await this.authenticate()
      return
    }

    try {
      const response = await axios.post<AuthResponse>(
        REFRESH_URL,
        {},
        {
          headers: {
            Authorization: `Bearer ${this.refreshToken}`,
          },
        }
      )

      const { token } = response.data
      this.accessToken = token.token.value
      this.refreshToken = token.refreshToken.value
      
      // Update expiration times
      const now = Date.now()
      this.tokenExpiresAt = now + token.token.expiresIn * 1000
      this.refreshTokenExpiresAt = now + token.refreshToken.expiresIn * 1000
    } catch (error) {
      // If refresh fails, try full authentication
      await this.authenticate()
    }
  }

  async get<T>(url: string, config = {}): Promise<T> {
    if (!this.accessToken) {
      await this.authenticate()
    }
    const response = await this.axiosInstance.get<T>(url, config)
    return response.data
  }

  // Add other methods (post, put, delete) as needed
}

// Create API client instance
const apiClient = new ApiClient()

export interface FetchSalesOptions {
  startDate?: string
  endDate?: string
  branchNumber?: number
  limit?: number
  offset?: number
}

export async function fetchSalesData(options: FetchSalesOptions = {}): Promise<Sale[]> {
  try {
    const params = new URLSearchParams()
    
    if (options.startDate) params.append("startDate", options.startDate)
    if (options.endDate) params.append("endDate", options.endDate)
    if (options.branchNumber) params.append("branchNumber", options.branchNumber.toString())
    if (options.limit) params.append("limit", options.limit.toString())
    if (options.offset) params.append("offset", options.offset.toString())

    return await apiClient.get<Sale[]>(ENDPOINTS.SALES, { params })
  } catch (error) {
    console.error("Error fetching sales data:", error)
    throw error
  }
}

export async function fetchSaleById(id: string): Promise<Sale> {
  try {
    return await apiClient.get<Sale>(`${ENDPOINTS.SALES}/${id}`)
  } catch (error) {
    console.error(`Error fetching sale with ID ${id}:`, error)
    throw error
  }
}

export async function fetchSaleByNumber(number: number): Promise<Sale> {
  try {
    return await apiClient.get<Sale>(`${ENDPOINTS.SALES}/number/${number}`)
  } catch (error) {
    console.error(`Error fetching sale with number ${number}:`, error)
    throw error
  }
}

export default apiClient
