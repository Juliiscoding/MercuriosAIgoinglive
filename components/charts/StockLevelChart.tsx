import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from "recharts"

interface StockLevelProps {
  data: {
    name: string
    stockLevel: number
    reorderPoint: number
    turnoverRate: number
    value: number
  }[]
}

export function StockLevelChart({ data }: StockLevelProps) {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Inventory Analysis</CardTitle>
        <CardDescription>Stock levels vs turnover rate</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid />
            <XAxis
              dataKey="stockLevel"
              name="Stock Level"
              unit=" units"
              type="number"
            />
            <YAxis
              dataKey="turnoverRate"
              name="Turnover Rate"
              unit="%"
              type="number"
            />
            <ZAxis
              dataKey="value"
              range={[50, 1000]}
              name="Value"
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              content={CustomTooltip}
            />
            <Scatter
              data={data}
              fill="#8884d8"
              shape="circle"
            />
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white p-4 border rounded-lg shadow">
        <p className="font-bold">{data.name}</p>
        <p>Stock Level: {data.stockLevel} units</p>
        <p>Turnover Rate: {data.turnoverRate}%</p>
        <p>Value: ${data.value.toLocaleString()}</p>
        <p className="text-sm text-red-500">
          {data.stockLevel < data.reorderPoint ? "Below reorder point!" : ""}
        </p>
      </div>
    )
  }
  return null
}
