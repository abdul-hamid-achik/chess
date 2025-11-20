"use server"

import { auth } from "@/lib/auth/config"
import { db } from "@/lib/db"
import { games, userPuzzles, users } from "@/lib/db/schema"
import { eq, and, gte, sql } from "drizzle-orm"
import { startOfDay, subDays, format, startOfWeek, startOfMonth } from "date-fns"

/**
 * Get rating history over time
 * Tracks rating changes after each game
 */
export async function getRatingHistory(timeRange: "7d" | "30d" | "all" = "30d") {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Unauthorized", data: null }
  }

  try {
    // Calculate date threshold
    let dateThreshold: Date | null = null
    if (timeRange === "7d") {
      dateThreshold = subDays(new Date(), 7)
    } else if (timeRange === "30d") {
      dateThreshold = subDays(new Date(), 30)
    }

    // Get all games in chronological order
    const userGames = await db
      .select({
        id: games.id,
        result: games.result,
        createdAt: games.createdAt,
      })
      .from(games)
      .where(
        and(
          eq(games.userId, session.user.id),
          dateThreshold ? gte(games.createdAt, dateThreshold) : undefined
        )
      )
      .orderBy(games.createdAt)

    // Get user's current rating
    const [user] = await db
      .select({ rating: users.rating })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1)

    const currentRating = user?.rating || 1200

    // Calculate rating at each point
    // Start from current rating and work backwards
    let tempRating = currentRating
    const ratingHistory = []

    // Work backwards through games to calculate historical ratings
    for (let i = userGames.length - 1; i >= 0; i--) {
      const game = userGames[i]
      ratingHistory.unshift({
        date: format(game.createdAt, "MMM dd"),
        rating: tempRating,
        timestamp: game.createdAt.getTime(),
      })

      // Reverse the rating change
      if (game.result === "win") {
        tempRating -= 10 // Was +10, so subtract
      } else if (game.result === "loss") {
        tempRating += 10 // Was -10, so add
      }
      // Draw doesn't change rating
    }

    // Add current rating as the final point
    ratingHistory.push({
      date: format(new Date(), "MMM dd"),
      rating: currentRating,
      timestamp: Date.now(),
    })

    return { success: true, data: ratingHistory }
  } catch (error) {
    console.error("Error fetching rating history:", error)
    return { error: "Failed to fetch rating history", data: null }
  }
}

/**
 * Get performance breakdown by time control
 */
export async function getPerformanceByTimeControl(timeRange: "7d" | "30d" | "all" = "all") {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Unauthorized", data: null }
  }

  try {
    let dateThreshold: Date | null = null
    if (timeRange === "7d") {
      dateThreshold = subDays(new Date(), 7)
    } else if (timeRange === "30d") {
      dateThreshold = subDays(new Date(), 30)
    }

    const userGames = await db
      .select({
        timeControl: games.timeControl,
        result: games.result,
      })
      .from(games)
      .where(
        and(
          eq(games.userId, session.user.id),
          dateThreshold ? gte(games.createdAt, dateThreshold) : undefined
        )
      )

    // Group by time control and result
    const performanceMap = new Map<
      string,
      { wins: number; losses: number; draws: number; total: number }
    >()

    userGames.forEach((game) => {
      const timeControl = game.timeControl || "unknown"
      if (!performanceMap.has(timeControl)) {
        performanceMap.set(timeControl, { wins: 0, losses: 0, draws: 0, total: 0 })
      }

      const stats = performanceMap.get(timeControl)!
      stats.total++

      if (game.result === "win") stats.wins++
      else if (game.result === "loss") stats.losses++
      else if (game.result === "draw") stats.draws++
    })

    // Convert to array format for charts
    const data = Array.from(performanceMap.entries()).map(([timeControl, stats]) => ({
      timeControl: timeControl.charAt(0).toUpperCase() + timeControl.slice(1),
      wins: stats.wins,
      losses: stats.losses,
      draws: stats.draws,
      total: stats.total,
      winRate: stats.total > 0 ? Math.round((stats.wins / stats.total) * 100) : 0,
    }))

    return { success: true, data }
  } catch (error) {
    console.error("Error fetching performance by time control:", error)
    return { error: "Failed to fetch performance data", data: null }
  }
}

/**
 * Get game activity over time (games played per period)
 */
export async function getGameActivityData(timeRange: "7d" | "30d" | "all" = "30d") {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Unauthorized", data: null }
  }

  try {
    let dateThreshold: Date | null = null
    let groupBy: "day" | "week" | "month" = "day"

    if (timeRange === "7d") {
      dateThreshold = subDays(new Date(), 7)
      groupBy = "day"
    } else if (timeRange === "30d") {
      dateThreshold = subDays(new Date(), 30)
      groupBy = "day"
    } else {
      // For "all", use weekly grouping
      groupBy = "week"
    }

    const userGames = await db
      .select({
        createdAt: games.createdAt,
        result: games.result,
      })
      .from(games)
      .where(
        and(
          eq(games.userId, session.user.id),
          dateThreshold ? gte(games.createdAt, dateThreshold) : undefined
        )
      )
      .orderBy(games.createdAt)

    // Group games by period
    const activityMap = new Map<string, { wins: number; losses: number; draws: number; total: number }>()

    userGames.forEach((game) => {
      let periodKey: string
      if (groupBy === "day") {
        periodKey = format(game.createdAt, "MMM dd")
      } else if (groupBy === "week") {
        periodKey = format(startOfWeek(game.createdAt), "MMM dd")
      } else {
        periodKey = format(startOfMonth(game.createdAt), "MMM yyyy")
      }

      if (!activityMap.has(periodKey)) {
        activityMap.set(periodKey, { wins: 0, losses: 0, draws: 0, total: 0 })
      }

      const stats = activityMap.get(periodKey)!
      stats.total++

      if (game.result === "win") stats.wins++
      else if (game.result === "loss") stats.losses++
      else if (game.result === "draw") stats.draws++
    })

    // Convert to array
    const data = Array.from(activityMap.entries()).map(([period, stats]) => ({
      period,
      wins: stats.wins,
      losses: stats.losses,
      draws: stats.draws,
      total: stats.total,
    }))

    return { success: true, data, groupBy }
  } catch (error) {
    console.error("Error fetching game activity:", error)
    return { error: "Failed to fetch game activity", data: null }
  }
}

/**
 * Get overall performance distribution (win/loss/draw)
 */
export async function getPerformanceDistribution(timeRange: "7d" | "30d" | "all" = "all") {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Unauthorized", data: null }
  }

  try {
    let dateThreshold: Date | null = null
    if (timeRange === "7d") {
      dateThreshold = subDays(new Date(), 7)
    } else if (timeRange === "30d") {
      dateThreshold = subDays(new Date(), 30)
    }

    const userGames = await db
      .select({
        result: games.result,
      })
      .from(games)
      .where(
        and(
          eq(games.userId, session.user.id),
          dateThreshold ? gte(games.createdAt, dateThreshold) : undefined
        )
      )

    // Count results
    let wins = 0
    let losses = 0
    let draws = 0

    userGames.forEach((game) => {
      if (game.result === "win") wins++
      else if (game.result === "loss") losses++
      else if (game.result === "draw") draws++
    })

    const total = wins + losses + draws

    const data = [
      { name: "Wins", value: wins, percentage: total > 0 ? Math.round((wins / total) * 100) : 0 },
      { name: "Losses", value: losses, percentage: total > 0 ? Math.round((losses / total) * 100) : 0 },
      { name: "Draws", value: draws, percentage: total > 0 ? Math.round((draws / total) * 100) : 0 },
    ]

    return { success: true, data, total }
  } catch (error) {
    console.error("Error fetching performance distribution:", error)
    return { error: "Failed to fetch performance distribution", data: null }
  }
}

/**
 * Get puzzle progress data over time
 */
export async function getPuzzleProgressData(timeRange: "7d" | "30d" | "all" = "30d") {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Unauthorized", data: null }
  }

  try {
    let dateThreshold: Date | null = null
    if (timeRange === "7d") {
      dateThreshold = subDays(new Date(), 7)
    } else if (timeRange === "30d") {
      dateThreshold = subDays(new Date(), 30)
    }

    const puzzleAttempts = await db
      .select({
        createdAt: userPuzzles.createdAt,
        solved: userPuzzles.solved,
        attempts: userPuzzles.attempts,
      })
      .from(userPuzzles)
      .where(
        and(
          eq(userPuzzles.userId, session.user.id),
          dateThreshold ? gte(userPuzzles.createdAt, dateThreshold) : undefined
        )
      )
      .orderBy(userPuzzles.createdAt)

    // Group by day and calculate cumulative stats
    const progressMap = new Map<string, { solved: number; total: number; accuracy: number }>()

    let cumulativeSolved = 0
    let cumulativeAttempts = 0

    puzzleAttempts.forEach((puzzle) => {
      const dayKey = format(puzzle.createdAt, "MMM dd")

      if (puzzle.solved) cumulativeSolved++
      cumulativeAttempts += puzzle.attempts

      const accuracy = cumulativeAttempts > 0
        ? Math.round((cumulativeSolved / cumulativeAttempts) * 100)
        : 0

      progressMap.set(dayKey, {
        solved: cumulativeSolved,
        total: puzzleAttempts.length,
        accuracy,
      })
    })

    // Convert to array
    const data = Array.from(progressMap.entries()).map(([period, stats]) => ({
      period,
      solved: stats.solved,
      accuracy: stats.accuracy,
    }))

    return { success: true, data }
  } catch (error) {
    console.error("Error fetching puzzle progress:", error)
    return { error: "Failed to fetch puzzle progress", data: null }
  }
}

/**
 * Get comprehensive statistics summary
 */
export async function getStatisticsSummary() {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Unauthorized", data: null }
  }

  try {
    // Get total games
    const totalGames = await db
      .select({ count: sql<number>`count(*)` })
      .from(games)
      .where(eq(games.userId, session.user.id))

    // Get puzzle stats
    const puzzleStats = await db
      .select({
        solved: userPuzzles.solved,
        attempts: userPuzzles.attempts,
      })
      .from(userPuzzles)
      .where(eq(userPuzzles.userId, session.user.id))

    const totalSolved = puzzleStats.filter((p) => p.solved).length
    const totalAttempts = puzzleStats.reduce((sum, p) => sum + p.attempts, 0)
    const puzzleAccuracy = totalAttempts > 0 ? Math.round((totalSolved / totalAttempts) * 100) : 0

    // Get current rating
    const [user] = await db
      .select({ rating: users.rating })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1)

    return {
      success: true,
      data: {
        totalGames: Number(totalGames[0]?.count || 0),
        totalPuzzlesSolved: totalSolved,
        puzzleAccuracy,
        currentRating: user?.rating || 1200,
      },
    }
  } catch (error) {
    console.error("Error fetching statistics summary:", error)
    return { error: "Failed to fetch statistics summary", data: null }
  }
}
