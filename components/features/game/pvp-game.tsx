"use client"

import { useState, useEffect, useRef } from "react"
import { Chess } from "chess.js"
import { Chessboard } from "react-chessboard"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Flag } from "lucide-react"
import { makeMove, resignGame } from "@/lib/actions/pvp-games"
import { getAblyClient } from "@/lib/ably/client"
import { toast } from "sonner"
import type { PvpGame, User } from "@/lib/db/schema"

interface PvPGameProps {
  game: PvpGame
  opponent: User
  userId: string
}

export function PvPGame({ game, opponent, userId }: PvPGameProps) {
  const gameRef = useRef(new Chess(game.currentFen))
  const [fen, setFen] = useState(game.currentFen)
  const [whiteTime, setWhiteTime] = useState(game.whiteTime)
  const [blackTime, setBlackTime] = useState(game.blackTime)
  const [gameStatus, setGameStatus] = useState(game.status)

  const playerColor = game.whitePlayerId === userId ? "w" : "b"
  const isWhite = playerColor === "w"

  // Subscribe to Ably channel
  useEffect(() => {
    const client = getAblyClient()
    const channel = client.channels.get(game.ablyChannelId)

    const handleMessage = (message: any) => {
      switch (message.name) {
        case "move":
          gameRef.current.load(message.data.fen)
          setFen(message.data.fen)
          break
        case "game:end":
          setGameStatus("completed")
          toast.info(`Game Over: ${message.data.result} wins by ${message.data.reason}`)
          break
        case "time:update":
          setWhiteTime(message.data.whiteTime)
          setBlackTime(message.data.blackTime)
          break
      }
    }

    channel.subscribe(handleMessage)

    return () => {
      channel.unsubscribe(handleMessage)
    }
  }, [game.ablyChannelId])

  const onPieceDrop = async (sourceSquare: string, targetSquare: string | null) => {
    if (!targetSquare) return false
    if (gameRef.current.turn() !== playerColor) return false
    if (gameStatus !== "active") return false

    const move = gameRef.current.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    })

    if (!move) return false

    // Optimistic update
    setFen(gameRef.current.fen())

    // Send to server
    const result = await makeMove(game.id, move.san)

    if (result.error) {
      // Rollback
      gameRef.current.undo()
      setFen(gameRef.current.fen())
      toast.error(result.error)
      return false
    }

    return true
  }

  const handleResign = async () => {
    const result = await resignGame(game.id)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("You resigned")
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start justify-center max-w-6xl mx-auto">
      <div className="flex-1 w-full max-w-[600px]">
        <Card>
          <CardContent className="p-4">
            <Chessboard
              options={{
                position: fen,
                onPieceDrop: ({ sourceSquare, targetSquare }) =>
                  onPieceDrop(sourceSquare, targetSquare || ""),
                boardOrientation: isWhite ? "white" : "black",
                allowDragging: gameStatus === "active",
              }}
            />
          </CardContent>
        </Card>
      </div>

      <div className="w-full lg:w-[350px]">
        <Card>
          <CardContent className="p-6 space-y-6">
            <div>
              <h2 className="font-bold text-xl mb-4">Game Info</h2>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div>
                    <div className="text-sm text-muted-foreground">
                      {isWhite ? "You (White)" : opponent.name}
                    </div>
                    <div className="font-mono font-bold text-2xl">{formatTime(whiteTime)}</div>
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div>
                    <div className="text-sm text-muted-foreground">
                      {!isWhite ? "You (Black)" : opponent.name}
                    </div>
                    <div className="font-mono font-bold text-2xl">{formatTime(blackTime)}</div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Moves</h3>
              <div className="max-h-[300px] overflow-y-auto text-sm bg-muted p-3 rounded-lg">
                {game.moves.map((move, i) => (
                  <span key={i} className="inline-block mr-2">
                    {i % 2 === 0 && (
                      <span className="text-muted-foreground">{Math.floor(i / 2) + 1}. </span>
                    )}
                    <span>{move}</span>
                  </span>
                ))}
              </div>
            </div>

            {gameStatus === "active" && (
              <Button onClick={handleResign} variant="destructive" className="w-full">
                <Flag className="w-4 h-4 mr-2" />
                Resign
              </Button>
            )}

            {gameStatus === "completed" && (
              <div className="p-4 bg-muted rounded-lg text-center">
                <p className="font-semibold">Game Over</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Result: {game.result} by {game.endReason}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
