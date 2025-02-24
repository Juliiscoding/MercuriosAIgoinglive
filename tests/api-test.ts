import { RealtimeService } from '../services/realtimeService'
import type { DashboardMetrics } from '../types/api'
import { ApiListResponse, Customer, Article, Branch, Sale } from '../types/api'

// For browser APIs in Node environment
declare global {
  class MockWebSocket {
    constructor(url: string)
    onopen: ((event: any) => void) | null
    onclose: ((event: any) => void) | null
    onerror: ((event: any) => void) | null
    onmessage: ((event: any) => void) | null
    send: (data: string) => void
    close: () => void
    readyState: number
    static OPEN: number
  }
}

// Mock WebSocket for Node environment
if (typeof window === 'undefined') {
  (global as any).WebSocket = class MockWebSocket {
    static OPEN = 1
    readyState = 0
    onopen: ((event: any) => void) | null = null
    onclose: ((event: any) => void) | null = null
    onerror: ((event: any) => void) | null = null
    onmessage: ((event: any) => void) | null = null

    constructor(url: string) {
      console.log('Creating WebSocket connection to:', url)
      setTimeout(() => {
        this.readyState = MockWebSocket.OPEN
        this.onopen?.({})
      }, 100)
    }

    send(data: string) {
      console.log('Sending data:', data)
      const parsed = JSON.parse(data)
      
      if (parsed.type === 'auth') {
        setTimeout(() => {
          this.onmessage?.({
            data: JSON.stringify({
              type: 'auth_response',
              status: 'success'
            })
          })

          // Send some mock data after successful auth
          setTimeout(() => {
            this.onmessage?.({
              data: JSON.stringify({
                type: 'metrics',
                data: {
                  revenue: {
                    total: 1200000,
                    averageOrder: 285,
                    dailyTrend: [35000, 37000, 34000],
                    monthlyTrend: [1100000, 1200000, 1300000]
                  },
                  products: {
                    total: 1500,
                    inStock: 1200,
                    lowStock: 200,
                    outOfStock: 100
                  },
                  customers: {
                    total: 5000,
                    active: 3500,
                    new: 150,
                    churnRate: 2.5
                  },
                  branches: {
                    total: 10,
                    active: 8,
                    performance: [
                      {
                        id: "1",
                        name: "Berlin Main",
                        revenue: 450000,
                        orders: 1500,
                        satisfaction: 94.5
                      }
                    ]
                  }
                }
              })
            })
          }, 500)
        }, 100)
      }
    }

    close() {
      this.onclose?.({ code: 1000, reason: 'Normal closure' })
    }
  }
}

async function testProHandelAPI() {
  console.log('Starting ProHandel API Tests...')
  
  try {
    // Test API endpoints
    const { api } = await import('../services/api')
    
    console.log('\n1. Testing Authentication...')
    try {
      const token = await (api as any).ensureValidToken()
      console.log('✓ Token obtained:', token.substring(0, 10) + '...')
      console.log('Full token:', token)
    } catch (error) {
      console.error('Authentication error:', error)
      throw error
    }

    console.log('\n2. Testing Customer Endpoint...')
    try {
      const customers = await api.get<ApiListResponse<Customer>>('/customer?pagesize=20')
      console.log('Raw customer response:', customers)
      
      if (customers?.items) {
        console.log('✓ Customers retrieved:', customers.items.length)
        console.log('Sample customer:', customers.items[0])
      } else {
        console.log('✗ Unexpected customer response format')
      }
    } catch (error: any) {
      console.error('Customer endpoint error:', error.response?.data || error)
      throw error
    }

    console.log('\n3. Testing Article Endpoint...')
    try {
      const articles = await api.get<ApiListResponse<Article>>('/article?pagesize=20')
      console.log('Raw article response:', articles)
      
      if (articles?.items) {
        console.log('✓ Articles retrieved:', articles.items.length)
        console.log('Sample article:', articles.items[0])
      } else {
        console.log('✗ Unexpected article response format')
      }
    } catch (error: any) {
      console.error('Article endpoint error:', error.response?.data || error)
      throw error
    }

    console.log('\n4. Testing Branch Endpoint...')
    try {
      const branches = await api.get<ApiListResponse<Branch>>('/branch?pagesize=20')
      console.log('Raw branch response:', branches)
      
      if (branches?.items) {
        console.log('✓ Branches retrieved:', branches.items.length)
        console.log('Sample branch:', branches.items[0])
      } else {
        console.log('✗ Unexpected branch response format')
      }
    } catch (error: any) {
      console.error('Branch endpoint error:', error.response?.data || error)
      throw error
    }

    console.log('\n5. Testing Sale Endpoint...')
    try {
      const fromDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      const sales = await api.get<ApiListResponse<Sale>>('/sale?pagesize=20&fromDate=' + encodeURIComponent(fromDate))
      console.log('Raw sales response:', sales)
      
      if (sales?.items) {
        console.log('✓ Sales retrieved:', sales.items.length)
        console.log('Sample sale:', sales.items[0])
      } else {
        console.log('✗ Unexpected sales response format')
      }
    } catch (error: any) {
      console.error('Sale endpoint error:', error.response?.data || error)
      throw error
    }

    // Test WebSocket Connection
    console.log('\n6. Testing WebSocket Connection...')
    const realtimeService = RealtimeService.getInstance()
    
    return new Promise((resolve) => {
      let receivedData = false
      
      realtimeService.subscribeToConnection((connected, error, attempts) => {
        if (connected) {
          console.log('✓ WebSocket connected successfully')
        } else if (error) {
          console.error('✗ WebSocket connection error:', error, 'attempts:', attempts)
        }
      })

      realtimeService.subscribeToUpdates((data) => {
        if (!receivedData) {
          console.log('✓ Received real-time update:', Object.keys(data))
          receivedData = true
          
          // Clean up and resolve after receiving data
          setTimeout(() => {
            realtimeService.disconnect()
            resolve('All tests completed successfully')
          }, 1000)
        }
      })

      // Set a timeout in case we don't receive data
      setTimeout(() => {
        if (!receivedData) {
          console.error('✗ No real-time data received within timeout')
          realtimeService.disconnect()
          resolve('Tests completed with some failures')
        }
      }, 10000)
    })

  } catch (error) {
    console.error('Test failed:', error)
    throw error
  }
}

// Run the test
testProHandelAPI()
  .then(result => console.log('\nTest Result:', result))
  .catch(error => console.error('\nTest Failed:', error))
