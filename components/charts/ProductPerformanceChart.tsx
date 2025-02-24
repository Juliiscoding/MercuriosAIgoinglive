import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, Treemap, Tooltip } from "recharts"

interface ProductPerformanceProps {
  data: {
    name: string
    size: number
    color: string
    children?: {
      name: string
      size: number
      color: string
    }[]
  }[]
}

export function ProductPerformanceChart({ data }: ProductPerformanceProps) {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Product Performance</CardTitle>
        <CardDescription>Product categories by revenue</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <Treemap
            data={data}
            dataKey="size"
            stroke="#fff"
            fill="#8884d8"
            content={CustomizedContent}
          >
            <Tooltip content={<CustomTooltip />} />
          </Treemap>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

function CustomizedContent(props: any) {
  const { root, depth, x, y, width, height, index, colors, name } = props

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: props.color || "#8884d8",
          stroke: "#fff",
          strokeWidth: 2 / (depth + 1e-10),
          strokeOpacity: 1 / (depth + 1e-10),
        }}
      />
      {depth === 1 && (
        <text
          x={x + width / 2}
          y={y + height / 2 + 7}
          textAnchor="middle"
          fill="#fff"
          fontSize={14}
        >
          {name}
        </text>
      )}
    </g>
  )
}

function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border rounded shadow">
        <p>{`${payload[0].name}`}</p>
        <p>{`Revenue: $${payload[0].value.toLocaleString()}`}</p>
      </div>
    )
  }
  return null
}
