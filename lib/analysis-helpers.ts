// Helper functions for chess game analysis

import { Chess } from "chess.js"
import type {
  MoveClassification,
  MoveAnalysisData,
  AnalysisSummary,
} from "@/types/analysis"
import { EVALUATION_THRESHOLDS } from "@/types/analysis"

/**
 * Classify a move based on the change in evaluation
 * @param evaluationBefore Position evaluation before the move (from player's perspective)
 * @param evaluationAfter Position evaluation after the move (from player's perspective)
 * @param engineBestMove Whether the move played was the engine's best move
 * @returns Move classification
 */
export function classifyMove(
  evaluationBefore: number,
  evaluationAfter: number,
  engineBestMove?: string,
  playedMove?: string
): MoveClassification {
  // Calculate evaluation delta (from player's perspective)
  const delta = evaluationAfter - evaluationBefore

  // Brilliant: Move is actually better than what the engine suggested
  if (engineBestMove && playedMove && playedMove !== engineBestMove && delta > EVALUATION_THRESHOLDS.BRILLIANT) {
    return "brilliant"
  }

  // Great: Best move or nearly identical (within 0.1 pawns)
  if (Math.abs(delta) <= EVALUATION_THRESHOLDS.GREAT) {
    return "great"
  }

  // Good: Slight loss (within 0.5 pawns)
  if (Math.abs(delta) <= EVALUATION_THRESHOLDS.GOOD) {
    return "good"
  }

  // Now check for mistakes (negative delta means position got worse)
  const lossInCentipawns = Math.abs(delta)

  // Blunder: More than 2.0 pawns lost
  if (lossInCentipawns >= EVALUATION_THRESHOLDS.BLUNDER) {
    return "blunder"
  }

  // Mistake: 1.0-2.0 pawns lost
  if (lossInCentipawns >= EVALUATION_THRESHOLDS.MISTAKE) {
    return "mistake"
  }

  // Inaccuracy: 0.5-1.0 pawns lost
  if (lossInCentipawns >= EVALUATION_THRESHOLDS.INACCURACY) {
    return "inaccuracy"
  }

  // Default to good if we couldn't classify
  return "good"
}

/**
 * Generate FEN positions for each move in a game
 * @param pgn Game in PGN format
 * @returns Array of FEN strings for each position
 */
export function generatePositionsFromPGN(pgn: string): {
  success: boolean
  positions?: string[]
  moves?: string[]
  error?: string
} {
  try {
    const game = new Chess()

    // Load and validate PGN (throws error if invalid in chess.js v1.0.0+)
    game.loadPgn(pgn)

    // Get move history from loaded game
    const history = game.history()

    // Reset to starting position and replay each move to capture positions
    game.reset()
    const positions: string[] = [game.fen()] // Starting position
    const moves: string[] = []

    for (const move of history) {
      game.move(move)
      positions.push(game.fen())
      moves.push(move)
    }

    return {
      success: true,
      positions,
      moves,
    }
  } catch (error) {
    console.error("Error generating positions from PGN:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to parse PGN",
    }
  }
}

/**
 * Convert evaluation from opponent's perspective to player's perspective
 */
export function convertEvaluationPerspective(
  evaluation: number,
  isWhite: boolean
): number {
  // Chess engines typically return evaluations from White's perspective
  // If player is Black, we need to negate the evaluation
  return isWhite ? evaluation : -evaluation
}

/**
 * Calculate accuracy score for a single move
 * Based on Lichess's accuracy formula
 */
export function calculateMoveAccuracy(
  evaluationBefore: number,
  evaluationAfter: number
): number {
  const delta = Math.abs(evaluationAfter - evaluationBefore)

  // If evaluation got better, accuracy is 100%
  if (evaluationAfter >= evaluationBefore) {
    return 100
  }

  // Apply decay function for lost centipawns
  // Formula: 100 * (1 - delta / (delta + 200))
  // This gives diminishing returns for bigger mistakes
  const accuracy = 100 * (1 - delta / (delta + 200))

  return Math.max(0, Math.min(100, accuracy))
}

/**
 * Calculate average accuracy for entire game
 */
export function calculateGameAccuracy(moveAnalyses: MoveAnalysisData[]): number {
  if (moveAnalyses.length === 0) return 0

  const totalAccuracy = moveAnalyses.reduce((sum, move) => {
    if (move.evaluationBefore !== undefined && move.evaluationAfter !== undefined) {
      return sum + calculateMoveAccuracy(move.evaluationBefore, move.evaluationAfter)
    }
    return sum
  }, 0)

  return Math.round(totalAccuracy / moveAnalyses.length)
}

/**
 * Generate analysis summary statistics
 */
export function generateAnalysisSummary(
  moveAnalyses: MoveAnalysisData[]
): AnalysisSummary {
  let brilliantMoves = 0
  let greatMoves = 0
  let goodMoves = 0
  let inaccuracies = 0
  let mistakes = 0
  let blunders = 0
  let biggestMistakeDelta = 0
  let biggestMistake: AnalysisSummary["biggestMistake"]

  moveAnalyses.forEach((move, index) => {
    switch (move.classification) {
      case "brilliant":
        brilliantMoves++
        break
      case "great":
        greatMoves++
        break
      case "good":
        goodMoves++
        break
      case "inaccuracy":
        inaccuracies++
        break
      case "mistake":
        mistakes++
        break
      case "blunder":
        blunders++
        break
    }

    // Track biggest mistake
    if (move.delta && Math.abs(move.delta) > biggestMistakeDelta) {
      biggestMistakeDelta = Math.abs(move.delta)
      biggestMistake = {
        move: move.move,
        moveNumber: Math.floor(index / 2) + 1,
        delta: move.delta,
      }
    }
  })

  const accuracy = calculateGameAccuracy(moveAnalyses)

  // Calculate average evaluation (in centipawns)
  const avgEval = moveAnalyses.reduce((sum, move) => {
    return sum + (move.evaluationAfter || 0)
  }, 0) / moveAnalyses.length

  return {
    accuracy,
    totalMoves: moveAnalyses.length,
    brilliantMoves,
    greatMoves,
    goodMoves,
    inaccuracies,
    mistakes,
    blunders,
    averageEvaluation: Math.round(avgEval),
    biggestMistake,
  }
}

/**
 * Check if a position is a forced mate
 */
export function isMatePosition(mate?: number): boolean {
  return mate !== undefined && mate !== null
}

/**
 * Format move number (e.g., "1", "1..." for black moves)
 */
export function formatMoveNumber(moveIndex: number): string {
  const moveNumber = Math.floor(moveIndex / 2) + 1
  const isWhiteMove = moveIndex % 2 === 0
  return isWhiteMove ? `${moveNumber}.` : `${moveNumber}...`
}

/**
 * Get color for move classification (for UI)
 */
export function getClassificationColor(classification: MoveClassification): string {
  const colors = {
    brilliant: "text-cyan-500",
    great: "text-green-500",
    good: "text-blue-500",
    inaccuracy: "text-yellow-500",
    mistake: "text-orange-500",
    blunder: "text-red-500",
  }
  return colors[classification]
}

/**
 * Get badge variant for move classification
 */
export function getClassificationVariant(
  classification: MoveClassification
): "default" | "secondary" | "destructive" | "outline" {
  switch (classification) {
    case "brilliant":
    case "great":
      return "default"
    case "good":
      return "secondary"
    case "inaccuracy":
      return "outline"
    case "mistake":
    case "blunder":
      return "destructive"
    default:
      return "secondary"
  }
}
