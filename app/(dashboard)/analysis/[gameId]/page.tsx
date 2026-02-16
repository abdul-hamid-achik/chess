"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, Loader2, Trophy, TrendingDown, Minus } from "lucide-react"
import { AnalysisResults } from "@/components/features/analysis/analysis-results"
import { getGameAnalysis } from "@/lib/actions/analysis"
import { getGameById } from "@/lib/actions/games"
import { formatDistanceToNow } from "date-fns"
import type { GameAnalysis } from "@/types/analysis"
import type { Game } from "@/lib/db/schema"

export default function GameAnalysisPage() {
  const params = useParams()
  const router = useRouter()
  const gameId = params.gameId as string

  const [game, setGame] = useState<Game | null>(null)
  const [analysis, setAnalysis] = useState<GameAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadGameAndAnalysis()
  }, [gameId])

  const loadGameAndAnalysis = async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch game and analysis in parallel
      const [gameResult, analysisResult] = await Promise.all([
        getGameById(gameId),
        getGameAnalysis(gameId),
      ])

      if (gameResult.error) {
        setError(gameResult.error)
        return
      }

      if (analysisResult.error) {
        setError(analysisResult.error)
        return
      }

      if (!gameResult.game) {
        setError("Game not found")
        return
      }

      if (!analysisResult.analysis) {
        setError("This game has not been analyzed yet")
        return
      }

      setGame(gameResult.game)
      setAnalysis(analysisResult.analysis)
    } catch (err) {
      console.error("Error loading game analysis:", err)
      setError("Failed to load game analysis")
    } finally {
      setLoading(false)
    }
  }

  const getResultBadge = () => {
    if (!game) return null

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
    if (!game) return null

    switch (game.result) {
      case "win":
        return <Trophy className="h-5 w-5 text-green-500" />
      case "loss":
        return <TrendingDown className="h-5 w-5 text-red-500" />
      case "draw":
        return <Minus className="h-5 w-5 text-gray-500" />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error || !game || !analysis) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-4">
          <Button variant="ghost" onClick={() => router.push("/analysis")}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Analysis
          </Button>
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-64">
              <p className="text-lg font-medium text-red-500 mb-2">
                {error || "Game not found"}
              </p>
              <Button onClick={() => router.push("/analysis")}>
                Return to Game List
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with breadcrumb and game info */}
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => router.push("/analysis")}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Analysis
          </Button>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getResultIcon()}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold">
                    vs {game.opponentType === "bot" ? "Computer" : "Human"}
                    {game.difficulty && ` (${game.difficulty})`}
                  </h1>
                  {getResultBadge()}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{game.playerColor === "w" ? "⚪ White" : "⚫ Black"}</span>
                  <span className="capitalize">{game.timeControl}</span>
                  <span>
                    {formatDistanceToNow(new Date(game.createdAt), { addSuffix: true })}
                  </span>
                  {game.accuracy !== null && (
                    <Badge variant="outline">Accuracy: {game.accuracy}%</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Results */}
        <AnalysisResults
          analysis={analysis}
          moves={game.moves}
          playerColor={game.playerColor as "w" | "b"}
        />
      </div>
    </div>
  )
}
