"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StatsData {
  current: number
  lastMonth: number
  percentageChange: number
}

interface UserStatsData {
  totalUsers: StatsData
  activeUsers: StatsData
  newSignups: StatsData
  retention: StatsData
  lastUpdated: string
}

export function UserStats() {
  const [stats, setStats] = useState<UserStatsData | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats')
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }

    fetchStats()
  }, [])

  if (!stats) {
    return <div>Loading...</div>
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalUsers.current.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            {stats.totalUsers.percentageChange > 0 ? '+' : ''}{stats.totalUsers.percentageChange}% from last month
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeUsers.current.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            {stats.activeUsers.percentageChange > 0 ? '+' : ''}{stats.activeUsers.percentageChange}% from last month
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">New Sign-ups</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.newSignups.current.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            {stats.newSignups.percentageChange > 0 ? '+' : ''}{stats.newSignups.percentageChange}% from last month
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">User Retention</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.retention.current}%</div>
          <p className="text-xs text-muted-foreground">
            {stats.retention.percentageChange > 0 ? '+' : ''}{stats.retention.percentageChange}% from last month
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
