import type { DashboardMetrics } from '../types/api'
import { api } from './api'

const WS_URL = 'wss://linde.prohandel.de/api/v2/ws'

type UpdateCallback = (data: Partial<DashboardMetrics>) => void
type ConnectionCallback = (connected: boolean, error: string | null, attempts: number) => void

export class RealtimeService {
  private static instance: RealtimeService
  private ws: WebSocket | null = null
  private updateCallbacks: Set<UpdateCallback> = new Set()
  private connectionCallbacks: Set<ConnectionCallback> = new Set()
  private reconnectTimeout: NodeJS.Timeout | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private shouldReconnect = true
  private heartbeatInterval: NodeJS.Timeout | null = null
  private isAuthenticated = false

  private constructor() {
    if (typeof window !== 'undefined') {
      this.connect()
    }
  }

  static getInstance(): RealtimeService {
    if (!RealtimeService.instance) {
      RealtimeService.instance = new RealtimeService()
    }
    return RealtimeService.instance
  }

  private async connect() {
    try {
      if (this.ws?.readyState === WebSocket.OPEN) {
        return
      }

      // Get a fresh token before connecting
      const token = await (api as any).ensureValidToken()
      this.ws = new WebSocket(`${WS_URL}?token=${token}`)

      // Set up connection timeout
      const connectionTimeout = setTimeout(() => {
        if (this.ws?.readyState !== WebSocket.OPEN) {
          this.ws?.close()
          this.notifyConnectionStatus(false, 'Connection timeout', this.reconnectAttempts)
        }
      }, 10000)

      this.ws.onopen = () => {
        clearTimeout(connectionTimeout)
        this.isAuthenticated = true
        this.reconnectAttempts = 0
        this.notifyConnectionStatus(true, null, 0)
        this.startHeartbeat()
        
        // Subscribe to relevant channels
        if (this.ws?.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({
            type: 'subscribe',
            channels: ['customer', 'article', 'branch']
          }))
        }
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          if (data.type === 'metrics') {
            this.updateCallbacks.forEach(callback => callback(data.data))
          } else if (data.type === 'error') {
            console.error('WebSocket error:', data.message)
            if (data.code === 'AUTH_FAILED') {
              this.isAuthenticated = false
              this.notifyConnectionStatus(false, 'Authentication failed: ' + data.message, this.reconnectAttempts)
              this.ws?.close()
            }
          }
        } catch (error) {
          console.error('Error processing message:', error)
        }
      }

      this.ws.onclose = (event) => {
        clearTimeout(connectionTimeout)
        this.stopHeartbeat()
        
        let errorMessage: string | null = null
        
        // Handle different close codes
        switch (event.code) {
          case 1000:
            errorMessage = 'Normal closure'
            break
          case 1006:
            errorMessage = 'Connection closed abnormally'
            break
          case 1011:
            errorMessage = 'Server error'
            break
          default:
            errorMessage = `Connection closed (${event.code})`
        }
        
        this.notifyConnectionStatus(false, errorMessage, this.reconnectAttempts)
        
        if (this.shouldReconnect) {
          this.reconnect()
        }
      }

      this.ws.onerror = () => {
        clearTimeout(connectionTimeout)
        this.notifyConnectionStatus(false, 'Connection error occurred', this.reconnectAttempts)
      }

    } catch (error) {
      this.notifyConnectionStatus(false, error instanceof Error ? error.message : 'Failed to establish connection', this.reconnectAttempts)
      if (this.shouldReconnect) {
        this.reconnect()
      }
    }
  }

  private reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.notifyConnectionStatus(false, 'Maximum reconnection attempts reached', this.reconnectAttempts)
      return
    }

    this.reconnectAttempts++
    
    // Exponential backoff
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 30000)
    
    this.reconnectTimeout = setTimeout(() => {
      this.connect()
    }, delay)
  }

  private startHeartbeat() {
    this.stopHeartbeat()
    
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }))
      }
    }, 30000)
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  subscribeToUpdates(callback: UpdateCallback) {
    this.updateCallbacks.add(callback)
    return () => {
      this.updateCallbacks.delete(callback)
    }
  }

  subscribeToConnection(callback: ConnectionCallback) {
    this.connectionCallbacks.add(callback)
    return () => {
      this.connectionCallbacks.delete(callback)
    }
  }

  disconnect() {
    this.shouldReconnect = false
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
    }
    this.stopHeartbeat()
    if (this.ws) {
      this.ws.close()
    }
  }

  private notifyConnectionStatus(connected: boolean, error: string | null, attempts: number) {
    this.connectionCallbacks.forEach(callback => callback(connected, error, attempts))
  }
}
