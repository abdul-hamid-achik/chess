"use server"

import { auth } from "@/lib/auth/config"
import { db } from "@/lib/db"
import { games, gameAnalysis } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"
import { analyzeGame as analyzeGameAPI } from "@/lib/api/chess-api"
import {
  generatePositionsFromPGN,
  classifyMove,
  convertEvaluationPerspective,
  calculateGameAccuracy,
} from "@/lib/analysis-helpers"
import type {
  AnalyzeGameResponse,
  GetAnalysisResponse,
  GetAnalyzableGamesResponse,
  MoveAnalysisData,
} from "@/types/analysis"

/**
 * Analyze a chess game using Chess-API.com
 * Generates position evaluations, classifies moves, and stores results
 */
export async function analyzeGame(gameId: string): Promise<AnalyzeGameResponse> {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "You must be signed in to analyze games" }
  }

  try {
    // Fetch the game
    const [game] = await db
      .select()
      .from(games)
      .where(eq(games.id, gameId))
      .limit(1)

    if (!game) {
      return { error: "Game not found" }
    }

    // Verify ownership
    if (game.userId !== session.user.id) {
      return { error: "You do not have permission to analyze this game" }
    }

    // Check if already analyzed
    const [existing] = await db
      .select()
      .from(gameAnalysis)
      .where(eq(gameAnalysis.gameId, gameId))
      .limit(1)

    if (existing) {
      return { error: "This game has already been analyzed" }
    }

    // Validate PGN
    if (!game.pgn) {
      return { error: "Game does not have PGN data" }
    }

    // Generate positions from PGN
    const positionsResult = generatePositionsFromPGN(game.pgn)
    if (!positionsResult.success || !positionsResult.positions || !positionsResult.moves) {
      return { error: positionsResult.error || "Failed to parse game moves" }
    }

    const { positions, moves } = positionsResult

    // Analyze all positions using Chess-API.com
    console.log(`Analyzing game ${gameId} with ${positions.length} positions...`)
    const analysisResult = await analyzeGameAPI(positions)

    if (!analysisResult.success || !analysisResult.evaluations) {
      return { error: analysisResult.error || "Failed to analyze game positions" }
    }

    const evaluations = analysisResult.evaluations
    const isPlayerWhite = game.playerColor === "w"

    // Process move analysis
    const moveAnalyses: MoveAnalysisData[] = []
    let brilliantCount = 0
    let blunderCount = 0
    let mistakeCount = 0
    let inaccuracyCount = 0

    // Start from move 1 (skip initial position)
    for (let i = 0; i < moves.length; i++) {
      const move = moves[i]
      const evalBefore = evaluations[i]?.evaluation || 0
      const evalAfter = evaluations[i + 1]?.evaluation || 0
      const bestMove = evaluations[i]?.bestMove

      // Determine if this is player's move or opponent's move
      const isWhiteMove = i % 2 === 0
      const isPlayerMove = isPlayerWhite ? isWhiteMove : !isWhiteMove

      // Only analyze player's moves
      if (!isPlayerMove) {
        continue
      }

      // Convert evaluations to player's perspective
      const playerEvalBefore = convertEvaluationPerspective(evalBefore, isPlayerWhite)
      const playerEvalAfter = convertEvaluationPerspective(evalAfter, isPlayerWhite)
      const delta = playerEvalAfter - playerEvalBefore

      // Classify the move
      const classification = classifyMove(
        playerEvalBefore,
        playerEvalAfter,
        bestMove,
        move
      )

      // Count classifications
      switch (classification) {
        case "brilliant":
          brilliantCount++
          break
        case "blunder":
          blunderCount++
          break
        case "mistake":
          mistakeCount++
          break
        case "inaccuracy":
          inaccuracyCount++
          break
      }

      moveAnalyses.push({
        move,
        evaluation: playerEvalAfter,
        bestMove,
        classification,
        evaluationBefore: playerEvalBefore,
        evaluationAfter: playerEvalAfter,
        delta,
      })
    }

    // Calculate average accuracy
    const averageAccuracy = calculateGameAccuracy(moveAnalyses)

    // Save analysis to database
    const [savedAnalysis] = await db
      .insert(gameAnalysis)
      .values({
        gameId,
        moveAnalysis: moveAnalyses,
        averageAccuracy,
        blunders: blunderCount,
        mistakes: mistakeCount,
        inaccuracies: inaccuracyCount,
        brilliantMoves: brilliantCount,
      })
      .returning()

    // Update game accuracy field
    await db
      .update(games)
      .set({ accuracy: averageAccuracy })
      .where(eq(games.id, gameId))

    return {
      success: true,
      analysis: savedAnalysis,
    }
  } catch (error) {
    console.error("Error analyzing game:", error)
    return {
      error: error instanceof Error ? error.message : "Failed to analyze game",
    }
  }
}

/**
 * Get analysis for a specific game
 */
export async function getGameAnalysis(gameId: string): Promise<GetAnalysisResponse> {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "You must be signed in to view analysis" }
  }

  try {
    // Fetch game to verify ownership
    const [game] = await db
      .select()
      .from(games)
      .where(eq(games.id, gameId))
      .limit(1)

    if (!game) {
      return { error: "Game not found" }
    }

    if (game.userId !== session.user.id) {
      return { error: "You do not have permission to view this analysis" }
    }

    // Fetch analysis
    const [analysis] = await db
      .select()
      .from(gameAnalysis)
      .where(eq(gameAnalysis.gameId, gameId))
      .limit(1)

    return {
      success: true,
      analysis: analysis || null,
    }
  } catch (error) {
    console.error("Error fetching analysis:", error)
    return {
      error: "Failed to fetch analysis",
    }
  }
}

/**
 * Check if a game has been analyzed
 */
export async function hasAnalysis(gameId: string): Promise<{
  success?: boolean
  hasAnalysis?: boolean
  error?: string
}> {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "You must be signed in" }
  }

  try {
    const [analysis] = await db
      .select({ id: gameAnalysis.id })
      .from(gameAnalysis)
      .where(eq(gameAnalysis.gameId, gameId))
      .limit(1)

    return {
      success: true,
      hasAnalysis: !!analysis,
    }
  } catch (error) {
    console.error("Error checking analysis:", error)
    return { error: "Failed to check analysis status" }
  }
}

/**
 * Get all analyzable games (completed games without analysis)
 */
export async function getAnalyzableGames(): Promise<GetAnalyzableGamesResponse> {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "You must be signed in to view games" }
  }

  try {
    // Fetch all user's games
    const userGames = await db
      .select()
      .from(games)
      .where(eq(games.userId, session.user.id))
      .orderBy(desc(games.createdAt))

    // For each game, check if it has analysis
    const gamesWithAnalysisStatus = await Promise.all(
      userGames.map(async (game) => {
        const [analysis] = await db
          .select()
          .from(gameAnalysis)
          .where(eq(gameAnalysis.gameId, game.id))
          .limit(1)

        return {
          ...game,
          hasAnalysis: !!analysis,
          analysis: analysis || undefined,
        }
      })
    )

    return {
      success: true,
      games: gamesWithAnalysisStatus,
    }
  } catch (error) {
    console.error("Error fetching analyzable games:", error)
    return {
      error: "Failed to fetch games",
    }
  }
}

/**
 * Get games that haven't been analyzed yet
 */
export async function getUnanalyzedGames(): Promise<GetAnalyzableGamesResponse> {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "You must be signed in to view games" }
  }

  try {
    // Get all games without analysis
    const result = await getAnalyzableGames()

    if (!result.success || !result.games) {
      return result
    }

    // Filter to only unanalyzed games
    const unanalyzed = result.games.filter((game) => !game.hasAnalysis)

    return {
      success: true,
      games: unanalyzed,
    }
  } catch (error) {
    console.error("Error fetching unanalyzed games:", error)
    return {
      error: "Failed to fetch unanalyzed games",
    }
  }
}

/**
 * Get games that have been analyzed
 */
export async function getAnalyzedGames(): Promise<GetAnalyzableGamesResponse> {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "You must be signed in to view games" }
  }

  try {
    const result = await getAnalyzableGames()

    if (!result.success || !result.games) {
      return result
    }

    // Filter to only analyzed games
    const analyzed = result.games.filter((game) => game.hasAnalysis)

    return {
      success: true,
      games: analyzed,
    }
  } catch (error) {
    console.error("Error fetching analyzed games:", error)
    return {
      error: "Failed to fetch analyzed games",
    }
  }
}

/**
 * Delete analysis for a game (optional cleanup function)
 */
export async function deleteAnalysis(gameId: string): Promise<{
  success?: boolean
  error?: string
}> {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "You must be signed in" }
  }

  try {
    // Verify game ownership
    const [game] = await db
      .select()
      .from(games)
      .where(eq(games.id, gameId))
      .limit(1)

    if (!game) {
      return { error: "Game not found" }
    }

    if (game.userId !== session.user.id) {
      return { error: "Unauthorized" }
    }

    // Delete analysis
    await db.delete(gameAnalysis).where(eq(gameAnalysis.gameId, gameId))

    // Reset accuracy in games table
    await db
      .update(games)
      .set({ accuracy: null })
      .where(eq(games.id, gameId))

    return { success: true }
  } catch (error) {
    console.error("Error deleting analysis:", error)
    return { error: "Failed to delete analysis" }
  }
}
