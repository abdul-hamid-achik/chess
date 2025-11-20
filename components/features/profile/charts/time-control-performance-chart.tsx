"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Clock } from "lucide-react"

interface TimeControlPerformanceChartProps {
  data: Array<{
    timeControl: string
    wins: number
    losses: number
    draws: number
    total: number
    winRate: number
  }>
}

export function TimeControlPerformanceChart({ data }: TimeControlPerformanceChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance by Time Control</CardTitle>
          <CardDescription>Win/loss breakdown across time controls</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            <div className="text-center">
              <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Play games in different time controls to see comparisons</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance by Time Control</CardTitle>
        <CardDescription>Win/loss breakdown across time controls</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="timeControl"
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Legend
              wrapperStyle={{ paddingTop: "20px" }}
              iconType="circle"
            />
            <Bar dataKey="wins" fill="hsl(142, 76%, 36%)" name="Wins" radius={[4, 4, 0, 0]} />
            <Bar dataKey="losses" fill="hsl(0, 84%, 60%)" name="Losses" radius={[4, 4, 0, 0]} />
            <Bar dataKey="draws" fill="hsl(215, 16%, 47%)" name="Draws" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>

        {/* Win rate summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {data.map((item) => (
            <div key={item.timeControl} className="text-center">
              <div className="text-sm font-medium text-muted-foreground">{item.timeControl}</div>
              <div className="text-2xl font-bold">{item.winRate}%</div>
              <div className="text-xs text-muted-foreground">{item.total} games</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
