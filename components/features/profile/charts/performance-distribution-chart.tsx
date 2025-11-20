"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Trophy, X, Minus } from "lucide-react"

interface PerformanceDistributionChartProps {
  data: Array<{
    name: string
    value: number
    percentage: number
  }>
  total: number
}

const COLORS = {
  Wins: "hsl(142, 76%, 36%)", // green-600
  Losses: "hsl(0, 84%, 60%)", // red-500
  Draws: "hsl(215, 16%, 47%)", // slate-500
}

export function PerformanceDistributionChart({ data, total }: PerformanceDistributionChartProps) {
  if (!data || total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance Distribution</CardTitle>
          <CardDescription>Win/loss/draw breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            <div className="text-center">
              <Trophy className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Play games to see your performance distribution</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Filter out zero values for cleaner chart
  const filteredData = data.filter((item) => item.value > 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Distribution</CardTitle>
        <CardDescription>{total} total games played</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={filteredData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }) => `${name}: ${percentage}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {filteredData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
              formatter={(value: number) => [`${value} games`, ""]}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Legend with icons */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="flex flex-col items-center">
            <Trophy className="h-5 w-5 text-green-600 mb-1" />
            <div className="text-sm font-medium">Wins</div>
            <div className="text-2xl font-bold">{data.find((d) => d.name === "Wins")?.value || 0}</div>
            <div className="text-xs text-muted-foreground">
              {data.find((d) => d.name === "Wins")?.percentage || 0}%
            </div>
          </div>
          <div className="flex flex-col items-center">
            <X className="h-5 w-5 text-red-500 mb-1" />
            <div className="text-sm font-medium">Losses</div>
            <div className="text-2xl font-bold">{data.find((d) => d.name === "Losses")?.value || 0}</div>
            <div className="text-xs text-muted-foreground">
              {data.find((d) => d.name === "Losses")?.percentage || 0}%
            </div>
          </div>
          <div className="flex flex-col items-center">
            <Minus className="h-5 w-5 text-slate-500 mb-1" />
            <div className="text-sm font-medium">Draws</div>
            <div className="text-2xl font-bold">{data.find((d) => d.name === "Draws")?.value || 0}</div>
            <div className="text-xs text-muted-foreground">
              {data.find((d) => d.name === "Draws")?.percentage || 0}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
