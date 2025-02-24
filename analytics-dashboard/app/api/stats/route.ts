import { NextResponse } from "next/server"

// Simulated database data
const generateUserStats = () => {
  const currentDate = new Date()
  const lastMonth = new Date(currentDate.setMonth(currentDate.getMonth() - 1))
  
  return {
    totalUsers: {
      current: 12345,
      lastMonth: 10287,
      percentageChange: 20
    },
    activeUsers: {
      current: 8765,
      lastMonth: 7621,
      percentageChange: 15
    },
    newSignups: {
      current: 1234,
      lastMonth: 1122,
      percentageChange: 10
    },
    retention: {
      current: 85,
      lastMonth: 81,
      percentageChange: 5
    },
    lastUpdated: new Date().toISOString()
  }
}

export async function GET() {
  // In a real application, this would fetch from a database
  const stats = generateUserStats()
  return NextResponse.json(stats)
}
