"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Sparkles, CheckCircle, Info, AlertCircle, XCircle, Zap } from "lucide-react"
import type { AnalysisSummary as AnalysisSummaryType } from "@/types/analysis"

interface AnalysisSummaryProps {
  summary: AnalysisSummaryType
}

export function AnalysisSummary({ summary }: AnalysisSummaryProps) {
  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return "text-green-500"
    if (accuracy >= 80) return "text-blue-500"
    if (accuracy >= 70) return "text-yellow-500"
    if (accuracy >= 60) return "text-orange-500"
    return "text-red-500"
  }

  const getAccuracyLabel = (accuracy: number) => {
    if (accuracy >= 90) return "Excellent"
    if (accuracy >= 80) return "Great"
    if (accuracy >= 70) return "Good"
    if (accuracy >= 60) return "Fair"
    return "Needs Improvement"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Game Analysis Summary</CardTitle>
        <CardDescription>
          Analysis of {summary.totalMoves} moves played
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Accuracy */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Accuracy</span>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-bold ${getAccuracyColor(summary.accuracy)}`}>
                {summary.accuracy}%
              </span>
              <Badge variant="outline">{getAccuracyLabel(summary.accuracy)}</Badge>
            </div>
          </div>
          <Progress value={summary.accuracy} className="h-3" />
        </div>

        {/* Move Quality Breakdown */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Move Quality</h4>

          <div className="grid grid-cols-2 gap-3">
            {/* Brilliant Moves */}
            {summary.brilliantMoves > 0 && (
              <div className="flex items-center gap-2 p-3 bg-cyan-50 dark:bg-cyan-950/20 rounded-lg">
                <Sparkles className="h-5 w-5 text-cyan-500" />
                <div>
                  <div className="text-2xl font-bold text-cyan-500">
                    {summary.brilliantMoves}
                  </div>
                  <div className="text-xs text-muted-foreground">Brilliant</div>
                </div>
              </div>
            )}

            {/* Great Moves */}
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold text-green-500">
                  {summary.greatMoves}
                </div>
                <div className="text-xs text-muted-foreground">Great</div>
              </div>
            </div>

            {/* Good Moves */}
            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <CheckCircle className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold text-blue-500">
                  {summary.goodMoves}
                </div>
                <div className="text-xs text-muted-foreground">Good</div>
              </div>
            </div>

            {/* Inaccuracies */}
            {summary.inaccuracies > 0 && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                <Info className="h-5 w-5 text-yellow-500" />
                <div>
                  <div className="text-2xl font-bold text-yellow-500">
                    {summary.inaccuracies}
                  </div>
                  <div className="text-xs text-muted-foreground">Inaccuracies</div>
                </div>
              </div>
            )}

            {/* Mistakes */}
            {summary.mistakes > 0 && (
              <div className="flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                <div>
                  <div className="text-2xl font-bold text-orange-500">
                    {summary.mistakes}
                  </div>
                  <div className="text-xs text-muted-foreground">Mistakes</div>
                </div>
              </div>
            )}

            {/* Blunders */}
            {summary.blunders > 0 && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                <XCircle className="h-5 w-5 text-red-500" />
                <div>
                  <div className="text-2xl font-bold text-red-500">
                    {summary.blunders}
                  </div>
                  <div className="text-xs text-muted-foreground">Blunders</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Biggest Mistake */}
        {summary.biggestMistake && (
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-start gap-2">
              <Zap className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm mb-1">Biggest Mistake</h4>
                <p className="text-sm text-muted-foreground">
                  Move {summary.biggestMistake.moveNumber}: {summary.biggestMistake.move}
                  <span className="ml-2 text-red-500 font-mono">
                    ({(summary.biggestMistake.delta / 100).toFixed(2)})
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
