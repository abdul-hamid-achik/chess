// Chess-API.com client for game analysis

import type {
  ChessApiAnalysisRequest,
  ChessApiResponse,
} from "@/types/analysis"

const CHESS_API_URL = process.env.CHESS_API_URL || "https://chess-api.com/v1"

// Default analysis parameters
const DEFAULT_DEPTH = 15 // Deeper analysis for more accurate results
const DEFAULT_MAX_THINKING_TIME = 100 // Maximum allowed by Chess-API.com
const DEFAULT_VARIANTS = 1 // Just need the best move

/**
 * Analyze a single chess position using Chess-API.com
 */
export async function analyzePosition(
  fen: string,
  depth: number = DEFAULT_DEPTH,
  variants: number = DEFAULT_VARIANTS
): Promise<ChessApiResponse> {
  try {
    const request: ChessApiAnalysisRequest = {
      fen,
      depth: Math.min(depth, 18), // API max is 18
      maxThinkingTime: DEFAULT_MAX_THINKING_TIME,
      variants: Math.min(variants, 5), // API max is 5
    }

    const response = await fetch(CHESS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error(`Chess API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // Transform API response to our format
    return {
      success: true,
      evaluation: data.eval !== undefined ? data.eval : data.score,
      mate: data.mate,
      bestMove: data.bestmove || data.best,
      continuation: data.continuation,
      lines: data.lines,
    }
  } catch (error) {
    console.error("Error analyzing position:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to analyze position",
    }
  }
}

/**
 * Analyze multiple positions in sequence (for full game analysis)
 */
export async function analyzePositions(
  fens: string[],
  depth: number = DEFAULT_DEPTH
): Promise<ChessApiResponse[]> {
  const results: ChessApiResponse[] = []

  // Analyze positions sequentially to avoid rate limiting
  for (const fen of fens) {
    const result = await analyzePosition(fen, depth)
    results.push(result)

    // Small delay to be respectful to the API
    if (fens.length > 1) {
      await sleep(100)
    }
  }

  return results
}

/**
 * Analyze a complete chess game by analyzing each position after each move
 */
export async function analyzeGame(
  positions: string[], // Array of FEN strings for each position
  depth: number = DEFAULT_DEPTH
): Promise<{
  success: boolean
  evaluations?: Array<{
    fen: string
    evaluation: number
    mate?: number
    bestMove?: string
  }>
  error?: string
}> {
  try {
    const evaluations: Array<{
      fen: string
      evaluation: number
      mate?: number
      bestMove?: string
    }> = []

    // Analyze each position
    for (let i = 0; i < positions.length; i++) {
      const result = await analyzePosition(positions[i], depth)

      if (!result.success) {
        console.error(`Failed to analyze position ${i + 1}:`, result.error)
        // Continue with next position even if one fails
        evaluations.push({
          fen: positions[i],
          evaluation: 0,
        })
        continue
      }

      evaluations.push({
        fen: positions[i],
        evaluation: result.evaluation || 0,
        mate: result.mate,
        bestMove: result.bestMove,
      })

      // Rate limiting: small delay between requests
      if (i < positions.length - 1) {
        await sleep(150)
      }
    }

    return {
      success: true,
      evaluations,
    }
  } catch (error) {
    console.error("Error analyzing game:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to analyze game",
    }
  }
}

/**
 * Utility function to sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Convert evaluation in centipawns to a more readable format
 */
export function formatEvaluation(centipawns: number): string {
  const pawns = centipawns / 100
  const sign = pawns > 0 ? "+" : ""
  return `${sign}${pawns.toFixed(2)}`
}

/**
 * Check if a move leads to mate
 */
export function isMatePosition(mate?: number): boolean {
  return mate !== undefined && mate !== null
}

/**
 * Get a descriptive string for mate positions
 */
export function getMateDescription(mate: number): string {
  if (mate > 0) {
    return `Mate in ${mate}`
  } else if (mate < 0) {
    return `Opponent mates in ${Math.abs(mate)}`
  }
  return "Mate"
}
