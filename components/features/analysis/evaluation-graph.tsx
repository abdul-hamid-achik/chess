"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
import type { MoveAnalysisData } from "@/types/analysis"

interface EvaluationGraphProps {
  moves: MoveAnalysisData[]
}

export function EvaluationGraph({ moves }: EvaluationGraphProps) {
  // Prepare data for the chart
  const chartData = moves.map((move, index) => ({
    moveNumber: Math.floor(index / 2) + 1,
    moveIndex: index,
    evaluation: (move.evaluationAfter || 0) / 100, // Convert to pawns
    move: move.move,
    classification: move.classification,
  }))

  // Add starting position
  const dataWithStart = [
    {
      moveNumber: 0,
      moveIndex: -1,
      evaluation: 0,
      move: "Start",
      classification: "good",
    },
    ...chartData,
  ]

  // Custom dot to highlight mistakes and blunders
  const CustomDot = (props: { cx?: number; cy?: number; payload?: { classification: string } }) => {
    const { cx, cy, payload } = props
    const classification = payload.classification

    if (classification === "blunder") {
      return (
        <circle
          cx={cx}
          cy={cy}
          r={6}
          fill="#ef4444"
          stroke="#fff"
          strokeWidth={2}
        />
      )
    } else if (classification === "mistake") {
      return (
        <circle
          cx={cx}
          cy={cy}
          r={5}
          fill="#f97316"
          stroke="#fff"
          strokeWidth={2}
        />
      )
    } else if (classification === "brilliant") {
      return (
        <circle
          cx={cx}
          cy={cy}
          r={5}
          fill="#06b6d4"
          stroke="#fff"
          strokeWidth={2}
        />
      )
    }

    return null
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { moveNumber: number; move: string; evaluation: number } }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border border-border p-3 rounded-lg shadow-lg">
          <p className="font-semibold">
            {data.moveNumber > 0 ? `Move ${data.moveNumber}` : "Starting Position"}
          </p>
          {data.move !== "Start" && (
            <p className="text-sm text-muted-foreground">{data.move}</p>
          )}
          <p className="text-sm font-mono mt-1">
            Eval: <span className="font-semibold">{data.evaluation.toFixed(2)}</span>
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Position Evaluation</CardTitle>
        <CardDescription>
          Position advantage throughout the game (positive = white advantage)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={dataWithStart}
            margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.3} />
            <XAxis
              dataKey="moveNumber"
              label={{
                value: "Move Number",
                position: "insideBottom",
                offset: -5,
                fill: "hsl(var(--foreground))"
              }}
              stroke="hsl(var(--foreground))"
              tick={{ fill: "hsl(var(--foreground))" }}
            />
            <YAxis
              label={{
                value: "Evaluation (pawns)",
                angle: -90,
                position: "insideLeft",
                fill: "hsl(var(--foreground))"
              }}
              domain={[-10, 10]}
              stroke="hsl(var(--foreground))"
              tick={{ fill: "hsl(var(--foreground))" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={0}
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="3 3"
            />
            <Line
              type="monotone"
              dataKey="evaluation"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={<CustomDot />}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyan-500" />
            <span>Brilliant</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span>Mistake</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>Blunder</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
