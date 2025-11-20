"use server"

import { auth } from "@/lib/auth/config"
import { db } from "@/lib/db"
import { games, users } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"
import type { NewGame } from "@/lib/db/schema"

export async function saveGame(gameData: {
  playerColor: "w" | "b"
  difficulty: string
  timeControl: string
  result: "win" | "loss" | "draw"
  endReason: string
  finalFen: string
  playerTime: number
  opponentTime: number
  moves: string[]
  pgn: string
}) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { error: "You must be signed in to save games" }
    }

    const newGame: NewGame = {
      userId: session.user.id,
      playerColor: gameData.playerColor,
      opponentType: "bot",
      difficulty: gameData.difficulty,
      timeControl: gameData.timeControl,
      result: gameData.result,
      endReason: gameData.endReason,
      finalFen: gameData.finalFen,
      playerTime: gameData.playerTime,
      opponentTime: gameData.opponentTime,
      pgn: gameData.pgn,
      moves: gameData.moves,
      accuracy: null, // Will be calculated by analysis engine later
    }

    const [savedGame] = await db.insert(games).values(newGame).returning()

    if (!savedGame) {
      return { error: "Failed to save game" }
    }

    // Update user's rating based on result (simple +10/-10/0 for now)
    const ratingChange = gameData.result === "win" ? 10 : gameData.result === "loss" ? -10 : 0

    if (ratingChange !== 0) {
      await db
        .update(users)
        .set({
          rating: session.user.rating + ratingChange
        })
        .where(eq(users.id, session.user.id))
    }

    return { success: true, game: savedGame, ratingChange }
  } catch (error) {
    console.error("Error saving game:", error)
    return { error: "Failed to save game. Please try again." }
  }
}

export async function getUserGames(limit: number = 10) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { error: "You must be signed in to view games" }
    }

    const userGames = await db.query.games.findMany({
      where: eq(games.userId, session.user.id),
      orderBy: [desc(games.createdAt)],
      limit,
    })

    return { success: true, games: userGames }
  } catch (error) {
    console.error("Error fetching games:", error)
    return { error: "Failed to fetch games" }
  }
}

export async function getGameById(gameId: string) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { error: "You must be signed in to view games" }
    }

    const game = await db.query.games.findFirst({
      where: eq(games.id, gameId),
    })

    if (!game) {
      return { error: "Game not found" }
    }

    // Ensure user owns this game
    if (game.userId !== session.user.id) {
      return { error: "Unauthorized" }
    }

    return { success: true, game }
  } catch (error) {
    console.error("Error fetching game:", error)
    return { error: "Failed to fetch game" }
  }
}

export async function getUserStats() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { error: "You must be signed in to view stats" }
    }

    const userGames = await db.query.games.findMany({
      where: eq(games.userId, session.user.id),
    })

    const totalGames = userGames.length
    const wins = userGames.filter((g) => g.result === "win").length
    const losses = userGames.filter((g) => g.result === "loss").length
    const draws = userGames.filter((g) => g.result === "draw").length
    const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0

    return {
      success: true,
      stats: {
        totalGames,
        wins,
        losses,
        draws,
        winRate,
      },
    }
  } catch (error) {
    console.error("Error fetching stats:", error)
    return { error: "Failed to fetch stats" }
  }
}
