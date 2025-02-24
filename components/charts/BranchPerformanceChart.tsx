import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from "recharts"

interface BranchPerformanceProps {
  data: {
    branch: string
    revenue: number
    customers: number
    satisfaction: number
    efficiency: number
    growth: number
  }[]
}

export function BranchPerformanceChart({ data }: BranchPerformanceProps) {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Branch Performance</CardTitle>
        <CardDescription>Multi-dimensional performance analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="branch" />
            <PolarRadiusAxis angle={30} domain={[0, 100]} />
            <Radar
              name="Revenue"
              dataKey="revenue"
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.6}
            />
            <Radar
              name="Customers"
              dataKey="customers"
              stroke="#82ca9d"
              fill="#82ca9d"
              fillOpacity={0.6}
            />
            <Radar
              name="Satisfaction"
              dataKey="satisfaction"
              stroke="#ffc658"
              fill="#ffc658"
              fillOpacity={0.6}
            />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
