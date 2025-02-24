import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts"

interface ChurnPredictionProps {
  data: {
    segment: string
    churnRisk: number
    customerCount: number
    averageValue: number
  }[]
}

export function ChurnPredictionChart({ data }: ChurnPredictionProps) {
  const colors = {
    low: "#4ade80",
    medium: "#fbbf24",
    high: "#ef4444",
  }

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Customer Churn Risk Analysis</CardTitle>
        <CardDescription>Predicted churn risk by customer segment</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="segment" />
            <YAxis yAxisId="left" tickFormatter={(value) => `${value}%`} />
            <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => value.toLocaleString()} />
            <Tooltip content={CustomTooltip} />
            <Legend />
            <Bar yAxisId="left" dataKey="churnRisk" name="Churn Risk">
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.churnRisk > 60 ? colors.high : entry.churnRisk > 30 ? colors.medium : colors.low}
                />
              ))}
            </Bar>
            <Bar yAxisId="right" dataKey="customerCount" name="Customer Count" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border rounded-lg shadow">
        <p className="font-bold">{label}</p>
        <p>Churn Risk: {payload[0].value}%</p>
        <p>Customers: {payload[1].value.toLocaleString()}</p>
        <p>Avg. Value: ${payload[0].payload.averageValue.toLocaleString()}</p>
      </div>
    )
  }
  return null
}
