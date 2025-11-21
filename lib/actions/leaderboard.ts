"use server"

import { db } from "@/lib/db"
import { users, pvpGames } from "@/lib/db/schema"
import { desc, eq, sql } from "drizzle-orm"

export async function getLeaderboard(limit: number = 100) {
  try {
    // Get top players by rating with PvP stats
    const leaderboard = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        rating: users.rating,
        gamesPlayed: sql<number>`
          (SELECT COUNT(*)
           FROM ${pvpGames}
           WHERE (${pvpGames.whitePlayerId} = ${users.id}
              OR ${pvpGames.blackPlayerId} = ${users.id})
             AND ${pvpGames.status} = 'completed')
        `,
        wins: sql<number>`
          (SELECT COUNT(*)
           FROM ${pvpGames}
           WHERE ((${pvpGames.whitePlayerId} = ${users.id} AND ${pvpGames.result} = 'white')
              OR (${pvpGames.blackPlayerId} = ${users.id} AND ${pvpGames.result} = 'black'))
             AND ${pvpGames.status} = 'completed')
        `,
        losses: sql<number>`
          (SELECT COUNT(*)
           FROM ${pvpGames}
           WHERE ((${pvpGames.whitePlayerId} = ${users.id} AND ${pvpGames.result} = 'black')
              OR (${pvpGames.blackPlayerId} = ${users.id} AND ${pvpGames.result} = 'white'))
             AND ${pvpGames.status} = 'completed')
        `,
        draws: sql<number>`
          (SELECT COUNT(*)
           FROM ${pvpGames}
           WHERE (${pvpGames.whitePlayerId} = ${users.id}
              OR ${pvpGames.blackPlayerId} = ${users.id})
             AND ${pvpGames.result} = 'draw'
             AND ${pvpGames.status} = 'completed')
        `,
      })
      .from(users)
      .orderBy(desc(users.rating))
      .limit(limit)

    return {
      success: true,
      leaderboard: leaderboard.map((player, index) => ({
        ...player,
        rank: index + 1,
        winRate:
          player.gamesPlayed > 0
            ? Math.round((player.wins / player.gamesPlayed) * 100)
            : 0,
      })),
    }
  } catch (error) {
    console.error("Error fetching leaderboard:", error)
    return { error: "Failed to fetch leaderboard" }
  }
}

export async function getUserRank(userId: string) {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    })

    if (!user) {
      return { error: "User not found" }
    }

    // Count how many users have a higher rating
    const higherRated = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(sql`${users.rating} > ${user.rating}`)

    const rank = (higherRated[0]?.count || 0) + 1

    // Get user's PvP stats
    const stats = await db
      .select({
        gamesPlayed: sql<number>`
          (SELECT COUNT(*)
           FROM ${pvpGames}
           WHERE (${pvpGames.whitePlayerId} = ${userId}
              OR ${pvpGames.blackPlayerId} = ${userId})
             AND ${pvpGames.status} = 'completed')
        `,
        wins: sql<number>`
          (SELECT COUNT(*)
           FROM ${pvpGames}
           WHERE ((${pvpGames.whitePlayerId} = ${userId} AND ${pvpGames.result} = 'white')
              OR (${pvpGames.blackPlayerId} = ${userId} AND ${pvpGames.result} = 'black'))
             AND ${pvpGames.status} = 'completed')
        `,
        losses: sql<number>`
          (SELECT COUNT(*)
           FROM ${pvpGames}
           WHERE ((${pvpGames.whitePlayerId} = ${userId} AND ${pvpGames.result} = 'black')
              OR (${pvpGames.blackPlayerId} = ${userId} AND ${pvpGames.result} = 'white'))
             AND ${pvpGames.status} = 'completed')
        `,
        draws: sql<number>`
          (SELECT COUNT(*)
           FROM ${pvpGames}
           WHERE (${pvpGames.whitePlayerId} = ${userId}
              OR ${pvpGames.blackPlayerId} = ${userId})
             AND ${pvpGames.result} = 'draw'
             AND ${pvpGames.status} = 'completed')
        `,
      })
      .from(users)
      .where(eq(users.id, userId))

    const userStats = stats[0] || { gamesPlayed: 0, wins: 0, losses: 0, draws: 0 }

    return {
      success: true,
      rank,
      rating: user.rating,
      stats: {
        ...userStats,
        winRate:
          userStats.gamesPlayed > 0
            ? Math.round((userStats.wins / userStats.gamesPlayed) * 100)
            : 0,
      },
    }
  } catch (error) {
    console.error("Error fetching user rank:", error)
    return { error: "Failed to fetch user rank" }
  }
}
