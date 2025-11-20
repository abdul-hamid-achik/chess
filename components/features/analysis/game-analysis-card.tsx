"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Brain, Trophy, TrendingDown, Minus, Loader2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import type { GameWithAnalysis } from "@/types/analysis"

interface GameAnalysisCardProps {
  game: GameWithAnalysis
  onAnalyze?: (_id: string) => Promise<void>
  analyzing?: boolean
}

export function GameAnalysisCard({ game, onAnalyze, analyzing }: GameAnalysisCardProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleAnalyze = async () => {
    if (!onAnalyze) return
    setIsAnalyzing(true)
    try {
      await onAnalyze(game.id)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getResultBadge = () => {
    switch (game.result) {
      case "win":
        return <Badge className="bg-green-500 hover:bg-green-600">Win</Badge>
      case "loss":
        return <Badge variant="destructive">Loss</Badge>
      case "draw":
        return <Badge variant="secondary">Draw</Badge>
      default:
        return null
    }
  }

  const getResultIcon = () => {
    switch (game.result) {
      case "win":
        return <Trophy className="h-4 w-4 text-green-500" />
      case "loss":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      case "draw":
        return <Minus className="h-4 w-4 text-gray-500" />
      default:
        return null
    }
  }

  return (
    <Card className="hover:border-primary transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getResultIcon()}
            <CardTitle className="text-base">
              vs {game.opponentType === "bot" ? "Computer" : "Human"}
              {game.difficulty && ` (${game.difficulty})`}
            </CardTitle>
          </div>
          {getResultBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Game Info */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {game.playerColor === "w" ? "⚪ White" : "⚫ Black"}
          </span>
          <span className="capitalize">{game.timeControl}</span>
          <span>{formatDistanceToNow(new Date(game.createdAt), { addSuffix: true })}</span>
        </div>

        {/* Analysis Status */}
        {game.hasAnalysis && game.analysis ? (
          <div className="space-y-2">
            {/* Accuracy */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Accuracy</span>
                <span className="font-semibold">{game.analysis.averageAccuracy}%</span>
              </div>
              <Progress value={game.analysis.averageAccuracy} className="h-2" />
            </div>

            {/* Move Quality Summary */}
            <div className="flex items-center justify-between text-xs">
              {game.analysis.brilliantMoves > 0 && (
                <span className="text-cyan-500">
                  ✨ {game.analysis.brilliantMoves} brilliant
                </span>
              )}
              {game.analysis.blunders > 0 && (
                <span className="text-red-500">
                  ⚠️ {game.analysis.blunders} blunders
                </span>
              )}
              {game.analysis.mistakes > 0 && (
                <span className="text-orange-500">
                  ❌ {game.analysis.mistakes} mistakes
                </span>
              )}
              {game.analysis.inaccuracies > 0 && (
                <span className="text-yellow-500">
                  ~ {game.analysis.inaccuracies} inaccuracies
                </span>
              )}
            </div>

            {/* View Analysis Button */}
            <Link href={`/analysis/${game.id}`}>
              <Button className="w-full" size="sm">
                <Brain className="mr-2 h-4 w-4" />
                View Analysis
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            <Badge variant="outline" className="mb-2">
              Not Analyzed
            </Badge>
            <Button
              className="w-full"
              size="sm"
              onClick={handleAnalyze}
              disabled={isAnalyzing || analyzing}
            >
              {isAnalyzing || analyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-4 w-4" />
                  Analyze Game
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
