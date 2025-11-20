"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Activity } from "lucide-react"

interface ActivityChartProps {
  data: Array<{
    period: string
    wins: number
    losses: number
    draws: number
    total: number
  }>
  groupBy: "day" | "week" | "month"
}

export function ActivityChart({ data, groupBy }: ActivityChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Game Activity</CardTitle>
          <CardDescription>Games played over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            <div className="text-center">
              <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Play games to see your activity trends</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalGames = data.reduce((sum, item) => sum + item.total, 0)
  const avgGamesPerPeriod = Math.round(totalGames / data.length)

  const groupByLabel = groupBy === "day" ? "day" : groupBy === "week" ? "week" : "month"

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Game Activity</CardTitle>
            <CardDescription>Games played over time</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{totalGames}</div>
            <div className="text-xs text-muted-foreground">
              {avgGamesPerPeriod} avg/{groupByLabel}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="period"
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
              angle={-45}
              textAnchor="end"
              height={80}
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
            <Bar
              dataKey="wins"
              stackId="a"
              fill="hsl(142, 76%, 36%)"
              name="Wins"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="draws"
              stackId="a"
              fill="hsl(215, 16%, 47%)"
              name="Draws"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="losses"
              stackId="a"
              fill="hsl(0, 84%, 60%)"
              name="Losses"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
