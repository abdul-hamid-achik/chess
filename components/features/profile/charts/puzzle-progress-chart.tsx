"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Puzzle } from "lucide-react"

interface PuzzleProgressChartProps {
  data: Array<{
    period: string
    solved: number
    accuracy: number
  }>
}

export function PuzzleProgressChart({ data }: PuzzleProgressChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Puzzle Progress</CardTitle>
          <CardDescription>Your puzzle-solving accuracy over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            <div className="text-center">
              <Puzzle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Solve puzzles to see your progress trends</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const latestData = data[data.length - 1]
  const currentAccuracy = latestData?.accuracy || 0
  const totalSolved = latestData?.solved || 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Puzzle Progress</CardTitle>
            <CardDescription>Your puzzle-solving accuracy over time</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{currentAccuracy}%</div>
            <div className="text-xs text-muted-foreground">{totalSolved} solved</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="period"
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              yAxisId="left"
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
              label={{ value: "Puzzles Solved", angle: -90, position: "insideLeft" }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
              label={{ value: "Accuracy %", angle: 90, position: "insideRight" }}
              domain={[0, 100]}
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
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="solved"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--primary))", r: 4 }}
              activeDot={{ r: 6 }}
              name="Puzzles Solved"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="accuracy"
              stroke="hsl(142, 76%, 36%)"
              strokeWidth={2}
              dot={{ fill: "hsl(142, 76%, 36%)", r: 4 }}
              activeDot={{ r: 6 }}
              name="Accuracy %"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
