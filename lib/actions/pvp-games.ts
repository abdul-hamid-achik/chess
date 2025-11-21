"use server"

import { auth } from "@/lib/auth/config"
import { db } from "@/lib/db"
import { pvpGames, users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { Chess } from "chess.js"
import { publishToChannel } from "@/lib/ably/server"

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

    // Make move
    const moveResult = chess.move(move)
    if (!moveResult) return { error: "Invalid move" }

    const newMoves = [...game.moves, moveResult.san]

    // Update game
    await db
      .update(pvpGames)
      .set({
        currentFen: chess.fen(),
        moves: newMoves,
        lastMoveAt: new Date(),
      })
      .where(eq(pvpGames.id, gameId))

    // Publish move via Ably
    await publishToChannel(game.ablyChannelId, "move", {
      move: moveResult.san,
      fen: chess.fen(),
      from: moveResult.from,
      to: moveResult.to,
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

  // Update ratings if needed (simple ELO can be added here)
}
