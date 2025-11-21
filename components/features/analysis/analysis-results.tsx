"use client"

import { useState } from "react"
import { EnhancedGameReplay } from "./enhanced-game-replay"
import { AnalysisSummary } from "./analysis-summary"
import { MoveAnalysisList } from "./move-analysis-list"
import { EvaluationGraph } from "./evaluation-graph"
import { generateAnalysisSummary } from "@/lib/analysis-helpers"
import type { GameAnalysis } from "@/types/analysis"

interface AnalysisResultsProps {
  analysis: GameAnalysis
  moves: string[]
  playerColor: "w" | "b"
}

export function AnalysisResults({ analysis, moves, playerColor }: AnalysisResultsProps) {
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1)

  // Generate summary statistics
  const summary = generateAnalysisSummary(analysis.moveAnalysis)

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <AnalysisSummary summary={summary} />

      {/* Main Analysis View: Board + Move List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enhanced Game Replay */}
        <div>
          <EnhancedGameReplay
            moves={moves}
            moveAnalyses={analysis.moveAnalysis}
            playerColor={playerColor}
            controlledMoveIndex={currentMoveIndex}
            onMoveChange={setCurrentMoveIndex}
          />
        </div>

        {/* Move Analysis List */}
        <div>
          <MoveAnalysisList
            moves={analysis.moveAnalysis}
            currentMoveIndex={currentMoveIndex}
            onMoveClick={setCurrentMoveIndex}
          />
        </div>
      </div>

      {/* Evaluation Graph */}
      <EvaluationGraph moves={analysis.moveAnalysis} />
    </div>
  )
}
