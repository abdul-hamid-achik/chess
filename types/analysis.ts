// Type definitions for chess game analysis

// Move classification types
export type MoveClassification =
  | "brilliant"
  | "great"
  | "good"
  | "inaccuracy"
  | "mistake"
  | "blunder"

// Chess-API.com Request Types
export interface ChessApiAnalysisRequest {
  fen: string
  depth?: number // Max 18, default 12
  maxThinkingTime?: number // Max 100ms, default 50ms
  variants?: number // Max 5
}

// Chess-API.com Response Types
export interface ChessApiMove {
  move: string
  centipawns: number
  mate?: number
}

export interface ChessApiResponse {
  success: boolean
  evaluation?: number
  mate?: number
  bestMove?: string
  continuation?: string[]
  lines?: Array<{
    moves: string[]
    centipawns: number
    mate?: number
  }>
  error?: string
}

// Move Analysis Types (stored in DB)
export interface MoveAnalysisData {
  move: string
  evaluation: number // In centipawns
  bestMove?: string
  classification: MoveClassification
  evaluationBefore?: number
  evaluationAfter?: number
  delta?: number // Change in evaluation
}

// Complete Game Analysis
export interface GameAnalysis {
  id: string
  gameId: string
  moveAnalysis: MoveAnalysisData[]
  averageAccuracy: number
  blunders: number
  mistakes: number
  inaccuracies: number
  brilliantMoves: number
  createdAt: Date
}

// Analysis Summary Stats
export interface AnalysisSummary {
  accuracy: number
  totalMoves: number
  brilliantMoves: number
  greatMoves: number
  goodMoves: number
  inaccuracies: number
  mistakes: number
  blunders: number
  averageEvaluation: number
  biggestMistake?: {
    move: string
    moveNumber: number
    delta: number
  }
}

// UI-specific types
export interface AnalysisPoint {
  moveNumber: number
  move: string
  evaluation: number
  classification: MoveClassification
}

export interface EvaluationGraphData {
  moveNumber: number
  evaluation: number
  move: string
}

// Game with Analysis Status
export interface GameWithAnalysis {
  id: string
  playerColor: string
  opponentType: string
  difficulty: string | null
  timeControl: string
  result: string
  createdAt: Date
  pgn: string
  moves: string[]
  hasAnalysis: boolean
  analysis?: GameAnalysis
}

// Analysis Action Response Types
export interface AnalyzeGameResponse {
  success?: boolean
  error?: string
  analysis?: GameAnalysis
}

export interface GetAnalysisResponse {
  success?: boolean
  error?: string
  analysis?: GameAnalysis | null
}

export interface GetAnalyzableGamesResponse {
  success?: boolean
  error?: string
  games?: GameWithAnalysis[]
}

// Move evaluation thresholds (in centipawns)
export const EVALUATION_THRESHOLDS = {
  BRILLIANT: -10, // Move is actually better than engine's choice
  GREAT: 10, // Within 0.1 pawns of best
  GOOD: 50, // Within 0.5 pawns of best
  INACCURACY: 100, // 0.5-1.0 pawns worse
  MISTAKE: 200, // 1.0-2.0 pawns worse
  BLUNDER: 200, // 2.0+ pawns worse
} as const

// Move classification colors for UI
export const MOVE_COLORS = {
  brilliant: "#1abc9c",
  great: "#2ecc71",
  good: "#3498db",
  inaccuracy: "#f39c12",
  mistake: "#e67e22",
  blunder: "#e74c3c",
} as const

// Move classification labels
export const MOVE_LABELS = {
  brilliant: "Brilliant",
  great: "Great",
  good: "Good",
  inaccuracy: "Inaccuracy",
  mistake: "Mistake",
  blunder: "Blunder",
} as const
