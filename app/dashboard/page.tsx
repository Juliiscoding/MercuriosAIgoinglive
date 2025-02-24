'use client'

import { useEffect, useState } from 'react'
import { fetchDashboardMetrics, type DashboardMetrics } from '@/services/api'
import { RealtimeService } from '@/services/realtimeService'
import { ConnectionStatus } from '@/components/connection-status'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowUpIcon, ArrowDownIcon, DollarSign, Users, Package, Building } from 'lucide-react'

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let unsubscribeUpdates: (() => void) | null = null
    let unsubscribeConnection: (() => void) | null = null

    const initializeDashboard = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Initial data fetch
        const initialData = await fetchDashboardMetrics()
        setMetrics(initialData)

        // Set up real-time updates
        const realtime = RealtimeService.getInstance()

        // Subscribe to connection status
        unsubscribeConnection = realtime.subscribeToConnection((connected) => {
          setIsConnected(connected)
          if (!connected) {
            setError('Real-time connection lost. Attempting to reconnect...')
          } else {
            setError(null)
          }
        })

        // Subscribe to metric updates
        unsubscribeUpdates = realtime.subscribeToUpdates((update) => {
          setMetrics((current) => current ? { ...current, ...update } : null)
        })

        setIsLoading(false)
      } catch (err) {
        console.error('Dashboard initialization error:', err)
        setError('Failed to load dashboard data. Please try again.')
        setIsLoading(false)
      }
    }

    initializeDashboard()

    // Cleanup subscriptions
    return () => {
      if (unsubscribeUpdates) unsubscribeUpdates()
      if (unsubscribeConnection) unsubscribeConnection()
    }
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-pulse text-lg">Loading dashboard data...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-8">
      {/* Connection Status */}
      <ConnectionStatus />

      {/* Connection Status */}
      {isConnected ? (
        <Alert className="bg-green-50 dark:bg-green-900/20">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertTitle>Connected</AlertTitle>
          <AlertDescription>
            Real-time updates are active
          </AlertDescription>
        </Alert>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {/* Dashboard Content */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Revenue Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.revenue.total.toLocaleString('de-DE', {
                style: 'currency',
                currency: 'EUR'
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics?.revenue.averageOrder.toLocaleString('de-DE', {
                style: 'currency',
                currency: 'EUR'
              })} avg. order
            </p>
            <div className="mt-1 flex items-center text-xs">
              <span className={`flex items-center ${metrics?.revenue.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {metrics?.revenue.trend > 0 ? (
                  <ArrowUpIcon className="mr-1 h-3 w-3" />
                ) : (
                  <ArrowDownIcon className="mr-1 h-3 w-3" />
                )}
                {metrics?.revenue.trend.toFixed(1)}%
              </span>
              <span className="ml-2 text-gray-500 dark:text-gray-400">
                Last 30 days
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Customers Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.customers.active.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics?.customers.new} new this month
            </p>
            <div className="mt-1 flex items-center text-xs">
              <span className={`flex items-center ${metrics?.customers.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {metrics?.customers.trend > 0 ? (
                  <ArrowUpIcon className="mr-1 h-3 w-3" />
                ) : (
                  <ArrowDownIcon className="mr-1 h-3 w-3" />
                )}
                {metrics?.customers.trend.toFixed(1)}%
              </span>
              <span className="ml-2 text-gray-500 dark:text-gray-400">
                This month
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Products Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.products.total.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics?.products.lowStock} low stock
            </p>
            <div className="mt-1 flex items-center text-xs">
              <span className={`flex items-center ${metrics?.products.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {metrics?.products.trend > 0 ? (
                  <ArrowUpIcon className="mr-1 h-3 w-3" />
                ) : (
                  <ArrowDownIcon className="mr-1 h-3 w-3" />
                )}
                {metrics?.products.trend.toFixed(1)}%
              </span>
              <span className="ml-2 text-gray-500 dark:text-gray-400">
                This month
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Branches Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Branches</CardTitle>
            <Building className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.branches.active.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              of {metrics?.branches.total} total
            </p>
            <div className="mt-1 flex items-center text-xs">
              <span className={`flex items-center ${metrics?.branches.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {metrics?.branches.trend > 0 ? (
                  <ArrowUpIcon className="mr-1 h-3 w-3" />
                ) : (
                  <ArrowDownIcon className="mr-1 h-3 w-3" />
                )}
                {metrics?.branches.trend.toFixed(1)}%
              </span>
              <span className="ml-2 text-gray-500 dark:text-gray-400">
                This month
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Branch Performance */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Branch Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {metrics?.branches.performance.map((branch) => (
              <div
                key={branch.id}
                className="flex items-center justify-between border-b py-2 last:border-0"
              >
                <div>
                  <div className="font-medium">{branch.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {branch.orders} orders
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    {branch.revenue.toLocaleString('de-DE', {
                      style: 'currency',
                      currency: 'EUR'
                    })}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {branch.satisfaction.toFixed(1)}% satisfaction
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
