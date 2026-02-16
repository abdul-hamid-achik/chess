"use server"

import { auth } from "@/lib/auth/config"
import { db } from "@/lib/db"
import { puzzles, userPuzzles } from "@/lib/db/schema"
import { eq, and, sql } from "drizzle-orm"
import type { UserPuzzle } from "@/lib/db/schema"
import { Chess } from "chess.js"
import { z } from "zod"

const submitPuzzleAttemptSchema = z.object({
  puzzleId: z.string().uuid(),
  userMoves: z.array(z.string().min(2).max(10)),
})

/**
 * Get a random puzzle based on optional difficulty filter
 * Prioritizes unsolved puzzles or puzzles the user hasn't attempted
 */
export async function getPuzzle(difficulty?: "easy" | "medium" | "hard" | "all") {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { error: "Unauthorized", puzzle: null }
    }

    // Define rating ranges based on difficulty
    let minRating = 800
    let maxRating = 2200

    if (difficulty === "easy") {
      minRating = 800
      maxRating = 1200
    } else if (difficulty === "medium") {
      minRating = 1200
      maxRating = 1700
    } else if (difficulty === "hard") {
      minRating = 1700
      maxRating = 2200
    }

    // Get all puzzles in the rating range
    const allPuzzles = await db
      .select()
      .from(puzzles)
      .where(
        and(
          sql`${puzzles.rating} >= ${minRating}`,
          sql`${puzzles.rating} <= ${maxRating}`
        )
      )

    if (allPuzzles.length === 0) {
      return { error: "No puzzles found for this difficulty", puzzle: null }
    }

    // Get user's puzzle attempts
    const userAttempts = await db
      .select()
      .from(userPuzzles)
      .where(eq(userPuzzles.userId, session.user.id))

    const attemptedPuzzleIds = new Set(userAttempts.map((up) => up.puzzleId))

    // Prioritize puzzles not yet attempted
    const unsolvedPuzzles = allPuzzles.filter((p) => !attemptedPuzzleIds.has(p.id))

    // If all puzzles have been attempted, pick from failed attempts
    const puzzlePool = unsolvedPuzzles.length > 0 ? unsolvedPuzzles : allPuzzles

    // Pick a random puzzle
    const randomIndex = Math.floor(Math.random() * puzzlePool.length)
    const selectedPuzzle = puzzlePool[randomIndex]

    // Get user's attempt for this puzzle if it exists
    const userAttempt = userAttempts.find((up) => up.puzzleId === selectedPuzzle.id)

    return {
      success: true,
      puzzle: selectedPuzzle,
      userAttempt: userAttempt || null,
    }
  } catch (error) {
    console.error("Error fetching puzzle:", error)
    return { error: "Failed to fetch puzzle", puzzle: null }
  }
}

/**
 * Submit a puzzle attempt and validate the solution
 * Returns whether the attempt was correct and updates user statistics
 */
export async function submitPuzzleAttempt(puzzleId: string, userMoves: string[]) {
  const parsed = submitPuzzleAttemptSchema.safeParse({ puzzleId, userMoves })
  if (!parsed.success) {
    return { error: "Invalid puzzle attempt data", success: false }
  }

  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { error: "Unauthorized", success: false }
    }

    // Fetch the puzzle
    const [puzzle] = await db
      .select()
      .from(puzzles)
      .where(eq(puzzles.id, puzzleId))
      .limit(1)

    if (!puzzle) {
      return { error: "Puzzle not found", success: false }
    }

    // Validate moves using chess.js
    const game = new Chess(puzzle.fen)
    const solutionMoves = puzzle.moves as string[]

    // Check if user moves match the solution
    const isCorrect = validateMoves(game, userMoves, solutionMoves)

    // Check if user has already attempted this puzzle
    const existingAttempt = await db
      .select()
      .from(userPuzzles)
      .where(
        and(
          eq(userPuzzles.userId, session.user.id),
          eq(userPuzzles.puzzleId, puzzleId)
        )
      )
      .limit(1)

    if (existingAttempt.length > 0) {
      // Update existing attempt
      const [updated] = await db
        .update(userPuzzles)
        .set({
          attempts: existingAttempt[0].attempts + 1,
          solved: isCorrect || existingAttempt[0].solved,
          solvedAt: new Date(),
        })
        .where(eq(userPuzzles.id, existingAttempt[0].id))
        .returning()

      return {
        success: true,
        correct: isCorrect,
        alreadySolved: existingAttempt[0].solved,
        attempts: updated.attempts,
      }
    } else {
      // Create new attempt
      const [_newAttempt] = await db
        .insert(userPuzzles)
        .values({
          userId: session.user.id,
          puzzleId: puzzleId,
          attempts: 1,
          solved: isCorrect,
          solvedAt: new Date(),
        })
        .returning()

      return {
        success: true,
        correct: isCorrect,
        alreadySolved: false,
        attempts: 1,
      }
    }
  } catch (error) {
    console.error("Error submitting puzzle attempt:", error)
    return { error: "Failed to submit attempt", success: false }
  }
}

/**
 * Validate if user moves match the solution moves
 * userMoves contains only the player's moves
 * solutionMoves contains all moves (player and opponent alternating)
 * Player moves are at even indices (0, 2, 4...), opponent moves at odd indices (1, 3, 5...)
 */
function validateMoves(
  game: Chess,
  userMoves: string[],
  solutionMoves: string[]
): boolean {
  // Calculate expected number of player moves in the solution
  const expectedPlayerMoves = Math.ceil(solutionMoves.length / 2)

  // Check if user provided the correct number of moves
  if (userMoves.length !== expectedPlayerMoves) {
    return false
  }

  // Validate each user move against the solution
  for (let i = 0; i < userMoves.length; i++) {
    const solutionMoveIndex = i * 2 // Player moves are at even indices
    const solutionMove = solutionMoves[solutionMoveIndex]

    try {
      // Make the player's move
      const move = game.move(userMoves[i])

      // Compare with solution
      if (move.san !== solutionMove) {
        return false
      }

      // Play the opponent's response to maintain correct board state
      const opponentMoveIndex = solutionMoveIndex + 1
      if (opponentMoveIndex < solutionMoves.length) {
        game.move(solutionMoves[opponentMoveIndex])
      }
    } catch (_e) {
      return false
    }
  }

  return true
}

/**
 * Get user's puzzle statistics
 */
export async function getUserPuzzleStats() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { error: "Unauthorized", stats: null }
    }

    // Get all user puzzle attempts
    const attempts = await db
      .select()
      .from(userPuzzles)
      .where(eq(userPuzzles.userId, session.user.id))

    const totalAttempts = attempts.reduce((sum, a) => sum + a.attempts, 0)
    const totalSolved = attempts.filter((a) => a.solved).length
    const totalPuzzles = attempts.length
    const accuracy = totalAttempts > 0 ? Math.round((totalSolved / totalAttempts) * 100) : 0

    return {
      success: true,
      stats: {
        totalPuzzles,
        totalSolved,
        totalAttempts,
        accuracy,
        rating: calculatePuzzleRating(attempts),
      },
    }
  } catch (error) {
    console.error("Error fetching puzzle stats:", error)
    return { error: "Failed to fetch stats", stats: null }
  }
}

/**
 * Calculate user's estimated puzzle rating based on solved puzzles
 */
function calculatePuzzleRating(attempts: UserPuzzle[]): number {
  const solvedPuzzles = attempts.filter((a) => a.solved)

  if (solvedPuzzles.length === 0) {
    return 800 // Starting rating
  }

  // Simple calculation: average rating of solved puzzles
  // In a real system, this would use a proper Elo/Glicko system
  const totalRating = solvedPuzzles.reduce((sum, attempt) => {
    // This would need to join with puzzles table in practice
    // For now, we'll estimate based on first attempt success
    return sum + (attempt.attempts === 1 ? 1500 : 1200)
  }, 0)

  return Math.round(totalRating / solvedPuzzles.length)
}

/**
 * Skip a puzzle (mark as attempted but not solved)
 */
export async function skipPuzzle(puzzleId: string) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { error: "Unauthorized", success: false }
    }

    // Check if user has already attempted this puzzle
    const existingAttempt = await db
      .select()
      .from(userPuzzles)
      .where(
        and(
          eq(userPuzzles.userId, session.user.id),
          eq(userPuzzles.puzzleId, puzzleId)
        )
      )
      .limit(1)

    if (existingAttempt.length > 0) {
      // Just update the solved time
      await db
        .update(userPuzzles)
        .set({
          solvedAt: new Date(),
        })
        .where(eq(userPuzzles.id, existingAttempt[0].id))
    } else {
      // Create a new attempt marked as skipped (attempts = 0, solved = false)
      await db.insert(userPuzzles).values({
        userId: session.user.id,
        puzzleId: puzzleId,
        attempts: 0,
        solved: false,
        solvedAt: new Date(),
      })
    }

    return { success: true }
  } catch (error) {
    console.error("Error skipping puzzle:", error)
    return { error: "Failed to skip puzzle", success: false }
  }
}

/**
 * Get hint for current puzzle (next player move in solution)
 * @param puzzleId - The puzzle ID
 * @param playerMovesCount - Number of player moves already made
 */
export async function getPuzzleHint(puzzleId: string, playerMovesCount: number = 0) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { error: "Unauthorized", hint: null }
    }

    const [puzzle] = await db
      .select()
      .from(puzzles)
      .where(eq(puzzles.id, puzzleId))
      .limit(1)

    if (!puzzle) {
      return { error: "Puzzle not found", hint: null }
    }

    const solutionMoves = puzzle.moves as string[]

    // Player moves are at even indices: 0, 2, 4...
    const nextPlayerMoveIndex = playerMovesCount * 2

    if (nextPlayerMoveIndex >= solutionMoves.length) {
      return { error: "No more moves in solution", hint: null }
    }

    const nextMove = solutionMoves[nextPlayerMoveIndex]

    return {
      success: true,
      hint: `Try the move: ${nextMove}`,
    }
  } catch (error) {
    console.error("Error getting hint:", error)
    return { error: "Failed to get hint", hint: null }
  }
}
