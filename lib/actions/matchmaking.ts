"use server"

import { auth } from "@/lib/auth/config"
import { db } from "@/lib/db"
import { matchmakingQueue, users, pvpGames } from "@/lib/db/schema"
import { eq, and, gte, lte, sql } from "drizzle-orm"
import { Chess } from "chess.js"
import { publishToChannel } from "@/lib/ably/server"

const TIME_CONFIGS = {
  bullet: 60,
  blitz: 300,
  rapid: 600,
} as const

const RATING_RANGE = 200

export async function joinQueue(timeControl: keyof typeof TIME_CONFIGS) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  try {
    // Get user rating
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    })

    if (!user) return { error: "User not found" }

    // Remove from queue if already there
    await db.delete(matchmakingQueue).where(eq(matchmakingQueue.userId, session.user.id))

    // Add to queue
    await db.insert(matchmakingQueue).values({
      userId: session.user.id,
      rating: user.rating,
      timeControl,
    })

    // Try to find match immediately
    const match = await findMatch(session.user.id, user.rating, timeControl)

    if (match) {
      return { success: true, matched: true, gameId: match.gameId }
    }

    return { success: true, matched: false, inQueue: true }
  } catch (error) {
    console.error("Error joining queue:", error)
    return { error: "Failed to join queue" }
  }
}

export async function leaveQueue() {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  try {
    await db.delete(matchmakingQueue).where(eq(matchmakingQueue.userId, session.user.id))
    return { success: true }
  } catch (error) {
    console.error("Error leaving queue:", error)
    return { error: "Failed to leave queue" }
  }
}

async function findMatch(userId: string, userRating: number, timeControl: string) {
  // Find opponent with similar rating
  const opponents = await db
    .select({ user: users, queue: matchmakingQueue })
    .from(matchmakingQueue)
    .innerJoin(users, eq(matchmakingQueue.userId, users.id))
    .where(
      and(
        eq(matchmakingQueue.timeControl, timeControl),
        sql`${users.id} != ${userId}`,
        gte(users.rating, userRating - RATING_RANGE),
        lte(users.rating, userRating + RATING_RANGE)
      )
    )
    .orderBy(sql`ABS(${users.rating} - ${userRating})`)
    .limit(1)

  if (opponents.length === 0) return null

  const opponent = opponents[0]

  // Create game
  const game = await createPvPGame(userId, opponent.user.id, timeControl)

  // Remove both from queue
  await db
    .delete(matchmakingQueue)
    .where(sql`${matchmakingQueue.userId} IN (${userId}, ${opponent.user.id})`)

  return game
}

async function createPvPGame(userId1: string, userId2: string, timeControl: string) {
  // Random color assignment
  const [whiteId, blackId] = Math.random() > 0.5 ? [userId1, userId2] : [userId2, userId1]

  const initialTime = TIME_CONFIGS[timeControl as keyof typeof TIME_CONFIGS]
  const chess = new Chess()
  const channelId = `game:${crypto.randomUUID()}`

  const [game] = await db
    .insert(pvpGames)
    .values({
      whitePlayerId: whiteId,
      blackPlayerId: blackId,
      ablyChannelId: channelId,
      currentFen: chess.fen(),
      timeControl,
      whiteTime: initialTime,
      blackTime: initialTime,
      status: "active",
    })
    .returning()

  // Get user info
  const [whiteUser, blackUser] = await Promise.all([
    db.query.users.findFirst({ where: eq(users.id, whiteId) }),
    db.query.users.findFirst({ where: eq(users.id, blackId) }),
  ])

  // Publish game start to both players via Ably
  await publishToChannel(channelId, "game:start", {
    gameId: game.id,
    white: { id: whiteId, name: whiteUser?.name, rating: whiteUser?.rating },
    black: { id: blackId, name: blackUser?.name, rating: blackUser?.rating },
    timeControl,
    initialTime,
  })

  return { success: true, gameId: game.id }
}
