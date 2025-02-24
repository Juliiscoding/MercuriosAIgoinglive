import { CacheService } from './cacheService'
import { DataPipeline } from './dataPipeline'
import { DataAnalysis } from './dataAnalysis'
import { MLPredictions } from './mlPredictions'
import { mockDashboardData } from './mockData'

export class DataRefreshService {
  private static instance: DataRefreshService
  private cache: CacheService
  private pipeline: DataPipeline
  private analysis: DataAnalysis
  private mlPredictions: MLPredictions
  private refreshInterval: NodeJS.Timeout | null = null

  private constructor() {
    this.cache = CacheService.getInstance()
    this.pipeline = new DataPipeline()
    this.analysis = new DataAnalysis()
    this.mlPredictions = new MLPredictions()
    
    // Initialize with mock data
    this.cache.set('dashboardData', mockDashboardData)
  }

  public static getInstance(): DataRefreshService {
    if (!DataRefreshService.instance) {
      DataRefreshService.instance = new DataRefreshService()
    }
    return DataRefreshService.instance
  }

  // Get cached dashboard data
  public async getCachedData() {
    let data = this.cache.get('dashboardData')
    if (!data) {
      data = mockDashboardData
      this.cache.set('dashboardData', data)
    }
    return data
  }

  // Start automatic refresh
  public startAutoRefresh(intervalMinutes: number = 60) {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
    }

    this.refreshInterval = setInterval(
      () => this.refreshData(),
      intervalMinutes * 60 * 1000
    )

    // Initial refresh
    this.refreshData()
  }

  // Stop automatic refresh
  public stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
      this.refreshInterval = null
    }
  }

  // Manual refresh
  private async refreshData() {
    try {
      // For now, just update with new mock data to simulate changes
      const data = { ...mockDashboardData }
      this.cache.set('dashboardData', data)
    } catch (error) {
      console.error('Error refreshing data:', error)
    }
  }
}
