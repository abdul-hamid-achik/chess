"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface RatingHistoryChartProps {
  data: Array<{
    date: string
    rating: number
    timestamp: number
  }>
}

export function RatingHistoryChart({ data }: RatingHistoryChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rating History</CardTitle>
          <CardDescription>Your rating progression over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Play more games to see your rating progression</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calculate rating change
  const startRating = data[0]?.rating || 1200
  const endRating = data[data.length - 1]?.rating || 1200
  const ratingChange = endRating - startRating
  const isPositive = ratingChange > 0
  const isNeutral = ratingChange === 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Rating History</CardTitle>
            <CardDescription>Your rating progression over time</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {isNeutral ? (
              <Minus className="h-5 w-5 text-muted-foreground" />
            ) : isPositive ? (
              <TrendingUp className="h-5 w-5 text-green-500" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-500" />
            )}
            <div className="text-right">
              <div className="text-2xl font-bold">{endRating}</div>
              <div
                className={`text-sm ${
                  isNeutral
                    ? "text-muted-foreground"
                    : isPositive
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {isPositive && "+"}
                {ratingChange} pts
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              domain={["dataMin - 50", "dataMax + 50"]}
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
            <Line
              type="monotone"
              dataKey="rating"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--primary))", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
