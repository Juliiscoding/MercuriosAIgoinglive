import { NextResponse } from "next/server"

const generateChartData = () => {
  return {
    pieChart: [
      { month: "january", desktop: 186, mobile: 124, fill: "var(--color-january)" },
      { month: "february", desktop: 305, mobile: 245, fill: "var(--color-february)" },
      { month: "march", desktop: 237, mobile: 278, fill: "var(--color-march)" },
      { month: "april", desktop: 173, mobile: 197, fill: "var(--color-april)" },
      { month: "may", desktop: 209, mobile: 223, fill: "var(--color-may)" }
    ],
    barChart: [
      { name: "Mon", total: 145 },
      { name: "Tue", total: 234 },
      { name: "Wed", total: 187 },
      { name: "Thu", total: 256 },
      { name: "Fri", total: 198 },
      { name: "Sat", total: 167 },
      { name: "Sun", total: 145 }
    ],
    areaChart: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      users: Math.floor(Math.random() * 1000) + 500
    }))
  }
}

export async function GET() {
  // In a real application, this would fetch from a database
  const chartData = generateChartData()
  return NextResponse.json(chartData)
}
