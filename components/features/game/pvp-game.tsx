"use client"

import { useState, useEffect, useRef } from "react"
import { Chess } from "chess.js"
import { Chessboard } from "react-chessboard"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Flag, WifiOff } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { formatTime } from "@/lib/utils/format-time"
import { makeMove, resignGame, timeoutGame, offerDraw, acceptDraw, declineDraw } from "@/lib/actions/pvp-games"
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
  const [drawOfferedBy, setDrawOfferedBy] = useState<string | null>(game.drawOfferedBy)
  const [connectionState, setConnectionState] = useState<"connected" | "connecting" | "disconnected">("connecting")

  const playerColor = game.whitePlayerId === userId ? "w" : "b"
  const isWhite = playerColor === "w"

  // Countdown timer
  useEffect(() => {
    if (gameStatus !== "active") return

    const interval = setInterval(() => {
      const currentTurn = gameRef.current.turn()

      if (currentTurn === "w") {
        setWhiteTime((prev) => {
          if (prev <= 0) {
            clearInterval(interval)
            handleTimeout("white")
            return 0
          }
          return prev - 1
        })
      } else {
        setBlackTime((prev) => {
          if (prev <= 0) {
            clearInterval(interval)
            handleTimeout("black")
            return 0
          }
          return prev - 1
        })
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [gameStatus, fen]) // Re-sync when fen changes (after opponent's move)

  // Subscribe to Ably channel
  useEffect(() => {
    const client = getAblyClient()
    const channel = client.channels.get(game.ablyChannelId)

    // Monitor connection state
    client.connection.on("connected", () => {
      setConnectionState("connected")
    })

    client.connection.on("connecting", () => {
      setConnectionState("connecting")
    })

    client.connection.on("disconnected", () => {
      setConnectionState("disconnected")
      toast.error("Connection lost. Attempting to reconnect...")
    })

    client.connection.on("failed", () => {
      setConnectionState("disconnected")
      toast.error("Connection failed")
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        case "draw:offer":
          setDrawOfferedBy(message.data.offeredBy)
          if (message.data.offeredBy !== userId) {
            toast.info("Opponent offers a draw")
          }
          break
        case "draw:decline":
          setDrawOfferedBy(null)
          if (message.data.declinedBy !== userId) {
            toast.info("Draw offer declined")
          }
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

  const handleTimeout = async (side: "white" | "black") => {
    const result = await timeoutGame(game.id, side)
    if (result.error) {
      toast.error(result.error)
    } else {
      setGameStatus("completed")
      const winner = side === "white" ? "black" : "white"
      toast.info(`${winner} wins on time!`)
    }
  }

  const handleOfferDraw = async () => {
    const result = await offerDraw(game.id)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Draw offer sent")
      setDrawOfferedBy(userId)
    }
  }

  const handleAcceptDraw = async () => {
    const result = await acceptDraw(game.id)
    if (result.error) {
      toast.error(result.error)
    } else {
      setGameStatus("completed")
      toast.success("Draw accepted")
    }
  }

  const handleDeclineDraw = async () => {
    const result = await declineDraw(game.id)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.info("Draw offer declined")
      setDrawOfferedBy(null)
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start justify-center max-w-6xl mx-auto">
      {connectionState === "disconnected" && (
        <div className="fixed top-4 right-4 z-50 p-4 bg-red-500 text-white rounded-lg shadow-lg flex items-center gap-2">
          <WifiOff className="w-5 h-5" />
          <span className="font-semibold">Disconnected - Reconnecting...</span>
        </div>
      )}

      {connectionState === "connecting" && (
        <div className="fixed top-4 right-4 z-50 p-4 bg-yellow-500 text-white rounded-lg shadow-lg flex items-center gap-2">
          <span className="font-semibold">Connecting...</span>
        </div>
      )}
      <div className="flex-1 w-full max-w-[600px]">
        <Card>
          <CardContent className="p-4">
            <Chessboard
              options={{
                position: fen,
                onPieceDrop: ({ sourceSquare, targetSquare }) => {
                  onPieceDrop(sourceSquare, targetSquare || "")
                  return true
                },
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
              <div className="space-y-2">
                {drawOfferedBy && drawOfferedBy !== userId && (
                  <div className="p-4 bg-yellow-100 dark:bg-yellow-900 rounded-lg space-y-2">
                    <p className="text-sm font-semibold text-center">Opponent offers a draw</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button onClick={handleAcceptDraw} variant="default" size="sm">
                        Accept
                      </Button>
                      <Button onClick={handleDeclineDraw} variant="outline" size="sm">
                        Decline
                      </Button>
                    </div>
                  </div>
                )}

                {drawOfferedBy === userId && (
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <p className="text-sm text-center">Draw offer sent</p>
                  </div>
                )}

                {!drawOfferedBy && (
                  <Button onClick={handleOfferDraw} variant="outline" className="w-full">
                    Offer Draw
                  </Button>
                )}

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      <Flag className="w-4 h-4 mr-2" />
                      Resign
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Resign Game?</AlertDialogTitle>
                      <AlertDialogDescription>This will count as a loss. Are you sure?</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleResign}>Resign</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
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
