"use client"

import { useState } from "react"
import { GameAnalysisCard } from "./game-analysis-card"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Brain } from "lucide-react"
import { toast } from "sonner"
import { analyzeGame } from "@/lib/actions/analysis"
import type { GameWithAnalysis } from "@/types/analysis"

interface GameListForAnalysisProps {
  games: GameWithAnalysis[]
  loading?: boolean
  onGameAnalyzed?: () => void
}

export function GameListForAnalysis({
  games,
  loading,
  onGameAnalyzed,
}: GameListForAnalysisProps) {
  const [analyzingGameId, setAnalyzingGameId] = useState<string | null>(null)

  const handleAnalyze = async (gameId: string) => {
    setAnalyzingGameId(gameId)
    try {
      const result = await analyzeGame(gameId)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Game analyzed successfully!")
        onGameAnalyzed?.()
      }
    } catch {
      toast.error("Failed to analyze game")
    } finally {
      setAnalyzingGameId(null)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (games.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-64">
          <Brain className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-2">No games available</p>
          <p className="text-sm text-muted-foreground text-center">
            Complete some games to start analyzing them
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {games.map((game) => (
        <GameAnalysisCard
          key={game.id}
          game={game}
          onAnalyze={handleAnalyze}
          analyzing={analyzingGameId === game.id}
        />
      ))}
    </div>
  )
}
