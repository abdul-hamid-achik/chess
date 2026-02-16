"use server"

import { auth } from "@/lib/auth/config"
import { db } from "@/lib/db"
import { pvpGames, users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { Chess } from "chess.js"
import { publishToChannel } from "@/lib/ably/server"
import { calculateBothRatings } from "@/lib/utils/elo"
import { z } from "zod"

const makeMoveSchema = z.object({
  gameId: z.string().uuid(),
  move: z.string().min(2).max(10),
})

export async function getGame(gameId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  try {
    const game = await db.query.pvpGames.findFirst({
      where: eq(pvpGames.id, gameId),
    })

    if (!game) return { error: "Game not found" }

    // Verify user is a player
    if (game.whitePlayerId !== session.user.id && game.blackPlayerId !== session.user.id) {
      return { error: "Unauthorized" }
    }

    // Get opponent info
    const opponentId =
      game.whitePlayerId === session.user.id ? game.blackPlayerId : game.whitePlayerId
    const opponent = await db.query.users.findFirst({
      where: eq(users.id, opponentId),
    })

    return { success: true, game, opponent }
  } catch (error) {
    console.error("Error fetching game:", error)
    return { error: "Failed to fetch game" }
  }
}

export async function makeMove(gameId: string, move: string) {
  const parsed = makeMoveSchema.safeParse({ gameId, move })
  if (!parsed.success) {
    return { error: "Invalid move data" }
  }

  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  try {
    const game = await db.query.pvpGames.findFirst({
      where: eq(pvpGames.id, gameId),
    })

    if (!game) return { error: "Game not found" }
    if (game.status !== "active") return { error: "Game not active" }

    const chess = new Chess(game.currentFen)
    const isWhite = session.user.id === game.whitePlayerId

    // Validate turn
    if ((isWhite && chess.turn() !== "w") || (!isWhite && chess.turn() !== "b")) {
      return { error: "Not your turn" }
    }

    // Calculate time elapsed since last move
    const now = new Date()
    const lastMoveTime = game.lastMoveAt || game.startedAt
    const elapsedSeconds = Math.floor((now.getTime() - lastMoveTime.getTime()) / 1000)

    // Deduct time from active player
    let newWhiteTime = game.whiteTime
    let newBlackTime = game.blackTime

    if (isWhite) {
      newWhiteTime = Math.max(0, game.whiteTime - elapsedSeconds)
    } else {
      newBlackTime = Math.max(0, game.blackTime - elapsedSeconds)
    }

    // Check for timeout
    if (newWhiteTime <= 0 || newBlackTime <= 0) {
      const _winner = newWhiteTime <= 0 ? "black" : "white"
      await timeoutGameInternal(gameId, newWhiteTime <= 0 ? "white" : "black")
      return { error: "Time expired" }
    }

    // Make move
    const moveResult = chess.move(move)
    if (!moveResult) return { error: "Invalid move" }

    const newMoves = [...game.moves, moveResult.san]

    // Update game with new times
    await db
      .update(pvpGames)
      .set({
        currentFen: chess.fen(),
        moves: newMoves,
        whiteTime: newWhiteTime,
        blackTime: newBlackTime,
        lastMoveAt: now,
      })
      .where(eq(pvpGames.id, gameId))

    // Publish move and time update via Ably
    await publishToChannel(game.ablyChannelId, "move", {
      move: moveResult.san,
      fen: chess.fen(),
      from: moveResult.from,
      to: moveResult.to,
    })

    await publishToChannel(game.ablyChannelId, "time:update", {
      whiteTime: newWhiteTime,
      blackTime: newBlackTime,
    })

    // Check game over
    if (chess.isGameOver()) {
      await endGame(gameId, chess)
    }

    return { success: true, fen: chess.fen() }
  } catch (error) {
    console.error("Move error:", error)
    return { error: "Failed to make move" }
  }
}

export async function timeoutGame(gameId: string, loser: "white" | "black") {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  // Verify caller is a player in this game
  const game = await db.query.pvpGames.findFirst({
    where: eq(pvpGames.id, gameId),
  })

  if (!game) return { error: "Game not found" }

  if (game.whitePlayerId !== session.user.id && game.blackPlayerId !== session.user.id) {
    return { error: "Unauthorized" }
  }

  return await timeoutGameInternal(gameId, loser)
}

async function timeoutGameInternal(gameId: string, loser: "white" | "black") {
  try {
    const game = await db.query.pvpGames.findFirst({
      where: eq(pvpGames.id, gameId),
    })

    if (!game) return { error: "Game not found" }

    const winner = loser === "white" ? "black" : "white"

    await db
      .update(pvpGames)
      .set({
        status: "completed",
        result: winner,
        endReason: "timeout",
        completedAt: new Date(),
      })
      .where(eq(pvpGames.id, gameId))

    await publishToChannel(game.ablyChannelId, "game:end", {
      result: winner,
      reason: "timeout",
    })

    // Update ELO ratings
    await updateRatings(game.whitePlayerId, game.blackPlayerId, winner)

    return { success: true }
  } catch (error) {
    console.error("Timeout error:", error)
    return { error: "Failed to process timeout" }
  }
}

export async function resignGame(gameId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  try {
    const game = await db.query.pvpGames.findFirst({
      where: eq(pvpGames.id, gameId),
    })

    if (!game) return { error: "Game not found" }

    const winner = session.user.id === game.whitePlayerId ? "black" : "white"

    await db
      .update(pvpGames)
      .set({
        status: "completed",
        result: winner,
        endReason: "resignation",
        completedAt: new Date(),
      })
      .where(eq(pvpGames.id, gameId))

    await publishToChannel(game.ablyChannelId, "game:end", {
      result: winner,
      reason: "resignation",
    })

    // Update ELO ratings
    await updateRatings(game.whitePlayerId, game.blackPlayerId, winner)

    return { success: true }
  } catch (error) {
    console.error("Resign error:", error)
    return { error: "Failed to resign" }
  }
}

async function endGame(gameId: string, chess: Chess) {
  const game = await db.query.pvpGames.findFirst({
    where: eq(pvpGames.id, gameId),
  })

  if (!game) return

  let result: string
  let endReason: string

  if (chess.isCheckmate()) {
    result = chess.turn() === "w" ? "black" : "white"
    endReason = "checkmate"
  } else if (chess.isDraw()) {
    result = "draw"
    endReason = chess.isStalemate()
      ? "stalemate"
      : chess.isThreefoldRepetition()
      ? "repetition"
      : "draw"
  } else {
    return
  }

  await db
    .update(pvpGames)
    .set({
      status: "completed",
      result,
      endReason,
      completedAt: new Date(),
    })
    .where(eq(pvpGames.id, gameId))

  await publishToChannel(game.ablyChannelId, "game:end", {
    result,
    reason: endReason,
  })

  // Update ELO ratings
  if (result !== "draw") {
    await updateRatings(game.whitePlayerId, game.blackPlayerId, result as "white" | "black")
  } else {
    await updateRatings(game.whitePlayerId, game.blackPlayerId, "draw")
  }
}

export async function offerDraw(gameId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  try {
    const game = await db.query.pvpGames.findFirst({
      where: eq(pvpGames.id, gameId),
    })

    if (!game) return { error: "Game not found" }
    if (game.status !== "active") return { error: "Game not active" }

    // Verify user is a player
    if (game.whitePlayerId !== session.user.id && game.blackPlayerId !== session.user.id) {
      return { error: "Unauthorized" }
    }

    // Check if already offered by this player
    if (game.drawOfferedBy === session.user.id) {
      return { error: "You already offered a draw" }
    }

    // Update game with draw offer
    await db
      .update(pvpGames)
      .set({ drawOfferedBy: session.user.id })
      .where(eq(pvpGames.id, gameId))

    // Notify opponent via Ably
    await publishToChannel(game.ablyChannelId, "draw:offer", {
      offeredBy: session.user.id,
    })

    return { success: true }
  } catch (error) {
    console.error("Error offering draw:", error)
    return { error: "Failed to offer draw" }
  }
}

export async function acceptDraw(gameId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  try {
    const game = await db.query.pvpGames.findFirst({
      where: eq(pvpGames.id, gameId),
    })

    if (!game) return { error: "Game not found" }
    if (game.status !== "active") return { error: "Game not active" }

    // Verify user is a player and not the one who offered
    if (game.whitePlayerId !== session.user.id && game.blackPlayerId !== session.user.id) {
      return { error: "Unauthorized" }
    }

    if (!game.drawOfferedBy) {
      return { error: "No draw offer pending" }
    }

    if (game.drawOfferedBy === session.user.id) {
      return { error: "You cannot accept your own draw offer" }
    }

    // End game as draw
    await db
      .update(pvpGames)
      .set({
        status: "completed",
        result: "draw",
        endReason: "agreement",
        drawOfferedBy: null,
        completedAt: new Date(),
      })
      .where(eq(pvpGames.id, gameId))

    // Notify via Ably
    await publishToChannel(game.ablyChannelId, "game:end", {
      result: "draw",
      reason: "agreement",
    })

    // Update ratings for draw
    await updateRatings(game.whitePlayerId, game.blackPlayerId, "draw")

    return { success: true }
  } catch (error) {
    console.error("Error accepting draw:", error)
    return { error: "Failed to accept draw" }
  }
}

export async function declineDraw(gameId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  try {
    const game = await db.query.pvpGames.findFirst({
      where: eq(pvpGames.id, gameId),
    })

    if (!game) return { error: "Game not found" }
    if (game.status !== "active") return { error: "Game not active" }

    // Verify user is a player
    if (game.whitePlayerId !== session.user.id && game.blackPlayerId !== session.user.id) {
      return { error: "Unauthorized" }
    }

    if (!game.drawOfferedBy) {
      return { error: "No draw offer pending" }
    }

    // Clear draw offer
    await db
      .update(pvpGames)
      .set({ drawOfferedBy: null })
      .where(eq(pvpGames.id, gameId))

    // Notify via Ably
    await publishToChannel(game.ablyChannelId, "draw:decline", {
      declinedBy: session.user.id,
    })

    return { success: true }
  } catch (error) {
    console.error("Error declining draw:", error)
    return { error: "Failed to decline draw" }
  }
}

async function updateRatings(
  whitePlayerId: string,
  blackPlayerId: string,
  result: "white" | "black" | "draw"
) {
  try {
    await db.transaction(async (tx) => {
      // Fetch both players' current ratings
      const whitePlayer = await tx.query.users.findFirst({
        where: eq(users.id, whitePlayerId),
      })
      const blackPlayer = await tx.query.users.findFirst({
        where: eq(users.id, blackPlayerId),
      })

      if (!whitePlayer || !blackPlayer) {
        throw new Error("Failed to fetch players for rating update")
      }

      // Calculate new ratings using ELO formula
      const ratingChanges = calculateBothRatings(
        whitePlayer.rating,
        blackPlayer.rating,
        result
      )

      // Update both players' ratings in the database
      await Promise.all([
        tx
          .update(users)
          .set({ rating: ratingChanges.whiteNewRating })
          .where(eq(users.id, whitePlayerId)),
        tx
          .update(users)
          .set({ rating: ratingChanges.blackNewRating })
          .where(eq(users.id, blackPlayerId)),
      ])

      console.log(
        `Rating update: White ${whitePlayer.rating} -> ${ratingChanges.whiteNewRating} (${ratingChanges.whiteChange >= 0 ? "+" : ""}${ratingChanges.whiteChange}), Black ${blackPlayer.rating} -> ${ratingChanges.blackNewRating} (${ratingChanges.blackChange >= 0 ? "+" : ""}${ratingChanges.blackChange})`
      )
    })
  } catch (error) {
    console.error("Error updating ratings:", error)
  }
}
