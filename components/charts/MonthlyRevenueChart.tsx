import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface MonthlyRevenueProps {
  data: {
    month: string
    revenue: number
    targetRevenue: number
    growth: number
  }[]
}

export function MonthlyRevenueChart({ data }: MonthlyRevenueProps) {
  const formatCurrency = (value: number) => `$${value.toLocaleString()}`
  
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Monthly Revenue Trends</CardTitle>
        <CardDescription>Revenue performance against targets</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" tickFormatter={formatCurrency} />
            <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${value}%`} />
            <Tooltip
              formatter={(value: number, name: string) => {
                if (name === "growth") return `${value}%`
                return formatCurrency(value)
              }}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="revenue"
              stroke="#8884d8"
              name="Actual Revenue"
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="targetRevenue"
              stroke="#82ca9d"
              name="Target Revenue"
              strokeDasharray="5 5"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="growth"
              stroke="#ffc658"
              name="Growth Rate"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
