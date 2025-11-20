"use client"

import { useState, useEffect } from "react"
import { Chess } from "chess.js"
import { Chessboard } from "react-chessboard"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { formatMoveNumber, getClassificationVariant } from "@/lib/analysis-helpers"
import { MOVE_LABELS } from "@/types/analysis"
import type { MoveAnalysisData } from "@/types/analysis"

interface EnhancedGameReplayProps {
  moves: string[]
  moveAnalyses: MoveAnalysisData[]
  playerColor: "w" | "b"
  onMoveChange?: (_index: number) => void
  controlledMoveIndex?: number
}

export function EnhancedGameReplay({
  moves,
  moveAnalyses,
  playerColor,
  onMoveChange,
  controlledMoveIndex,
}: EnhancedGameReplayProps) {
  const [game, setGame] = useState(new Chess())
  const [internalMoveIndex, setInternalMoveIndex] = useState(-1)
  const [fen, setFen] = useState(game.fen())

  // Use controlled index if provided, otherwise use internal
  const currentMoveIndex =
    controlledMoveIndex !== undefined ? controlledMoveIndex : internalMoveIndex

  useEffect(() => {
    const newGame = new Chess()
    setGame(newGame)
    setFen(newGame.fen())
    if (controlledMoveIndex === undefined) {
      setInternalMoveIndex(-1)
    }
  }, [moves, controlledMoveIndex])

  const goToMove = (moveIndex: number) => {
    const newGame = new Chess()

    for (let i = 0; i <= moveIndex; i++) {
      if (i < moves.length) {
        try {
          newGame.move(moves[i])
        } catch (e) {
          console.error("Error applying move:", moves[i], e)
          break
        }
      }
    }

    setGame(newGame)
    setFen(newGame.fen())

    if (controlledMoveIndex === undefined) {
      setInternalMoveIndex(moveIndex)
    }
    onMoveChange?.(moveIndex)
  }

  const goToStart = () => goToMove(-1)
  const goToPrevious = () => {
    if (currentMoveIndex > -1) {
      goToMove(currentMoveIndex - 1)
    }
  }
  const goToNext = () => {
    if (currentMoveIndex < moves.length - 1) {
      goToMove(currentMoveIndex + 1)
    }
  }
  const goToEnd = () => goToMove(moves.length - 1)

  // Get current move analysis
  const getCurrentAnalysis = () => {
    if (currentMoveIndex === -1 || currentMoveIndex >= moveAnalyses.length) {
      return null
    }
    return moveAnalyses[currentMoveIndex]
  }

  const currentAnalysis = getCurrentAnalysis()

  // Get current evaluation (including starting position)
  const getCurrentEvaluation = () => {
    if (currentMoveIndex === -1) {
      // Starting position - get from first move's evaluationBefore or default to 0
      return moveAnalyses.length > 0 && moveAnalyses[0].evaluationBefore !== undefined
        ? moveAnalyses[0].evaluationBefore
        : 0
    }
    return currentAnalysis?.evaluationAfter
  }

  const currentEvaluation = getCurrentEvaluation()

  // Get evaluation display
  const getEvaluationDisplay = (evaluation: number) => {
    const pawns = evaluation / 100
    const sign = pawns > 0 ? "+" : ""
    return `${sign}${pawns.toFixed(2)}`
  }

  const getEvaluationColor = (evaluation: number) => {
    if (evaluation > 200) return "bg-green-500"
    if (evaluation > 50) return "bg-blue-500"
    if (evaluation > -50) return "bg-gray-500"
    if (evaluation > -200) return "bg-orange-500"
    return "bg-red-500"
  }

  // Calculate evaluation bar height (0-100%)
  const getEvaluationBarHeight = (evaluation: number) => {
    // Convert centipawns to pawns for better visual range
    const pawns = evaluation / 100
    // Map from -10 to +10 pawns to 0-100%
    // At 0 pawns (equal), bar should be at 50%
    const percentage = 50 - pawns * 5
    return Math.min(100, Math.max(0, percentage))
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {/* Chessboard with evaluation bar */}
        <div className="flex gap-2 max-w-[640px] mx-auto">
          {/* Evaluation bar */}
          {currentEvaluation !== undefined && (
            <div className="relative w-8 bg-black rounded-lg overflow-hidden flex-shrink-0 border border-border">
              {/* White section (bottom) - grows upward when White is winning */}
              <div
                className="absolute bottom-0 left-0 right-0 bg-white transition-all duration-300"
                style={{
                  height: `${100 - getEvaluationBarHeight(currentEvaluation)}%`,
                }}
              />
              {/* Center line (50-50) */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-yellow-500 transform -translate-y-1/2 z-10" />
            </div>
          )}

          {/* Chessboard */}
          <div className="flex-1">
            <Chessboard
              options={{
                position: fen,
                boardOrientation: playerColor === "w" ? "white" : "black",
                allowDragging: false,
                customDarkSquareStyle: { backgroundColor: "#b58863" },
                customLightSquareStyle: { backgroundColor: "#f0d9b5" },
              }}
            />
          </div>
        </div>

        {/* Current move info */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          {currentAnalysis ? (
            <>
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm text-muted-foreground">
                  {formatMoveNumber(currentMoveIndex)}
                </span>
                <span className="font-semibold text-lg">{currentAnalysis.move}</span>
                <Badge variant={getClassificationVariant(currentAnalysis.classification)}>
                  {MOVE_LABELS[currentAnalysis.classification]}
                </Badge>
              </div>
              {currentEvaluation !== undefined && (
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Evaluation</div>
                  <div className="font-mono font-semibold">
                    {getEvaluationDisplay(currentEvaluation)}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm text-muted-foreground">Starting Position</span>
              </div>
              {currentEvaluation !== undefined && (
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Evaluation</div>
                  <div className="font-mono font-semibold">
                    {getEvaluationDisplay(currentEvaluation)}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Best move suggestion */}
        {currentAnalysis &&
          currentAnalysis.bestMove &&
          (currentAnalysis.classification === "mistake" ||
            currentAnalysis.classification === "blunder" ||
            currentAnalysis.classification === "inaccuracy") && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg">
              <div className="text-sm font-medium text-red-900 dark:text-red-100 mb-1">
                Better Move Available
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Best: </span>
                <span className="font-semibold">{currentAnalysis.bestMove}</span>
                {currentAnalysis.delta && (
                  <span className="ml-2 text-red-500 font-mono">
                    ({(currentAnalysis.delta / 100).toFixed(2)})
                  </span>
                )}
              </div>
            </div>
          )}

        {/* Navigation controls */}
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={goToStart}
            disabled={currentMoveIndex === -1}
          >
            <ChevronsLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={goToPrevious}
            disabled={currentMoveIndex === -1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="px-4 py-2 bg-muted rounded flex items-center min-w-[120px] justify-center">
            <span className="text-sm">
              {currentMoveIndex === -1
                ? "Start"
                : `Move ${currentMoveIndex + 1} / ${moves.length}`}
            </span>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={goToNext}
            disabled={currentMoveIndex === moves.length - 1}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={goToEnd}
            disabled={currentMoveIndex === moves.length - 1}
          >
            <ChevronsRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
