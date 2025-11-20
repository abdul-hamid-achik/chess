"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Chess } from "chess.js"
import { ChessBoard } from "./chess-board"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RotateCcw, ChevronLeft, ChevronRight, Flag, Play } from "lucide-react"
import { getBestMove, type Difficulty } from "@/lib/chess/engine"
import { saveGame } from "@/lib/actions/games"
import { toast } from "sonner"

type GameState = "setup" | "playing" | "finished"
type TimeControl = "bullet" | "blitz" | "rapid" | "classical"
type PlayerColor = "w" | "b"

const TIME_CONTROLS: Record<TimeControl, { label: string; time: number }> = {
  bullet: { label: "Bullet (1 min)", time: 60 },
  blitz: { label: "Blitz (5 min)", time: 300 },
  rapid: { label: "Rapid (10 min)", time: 600 },
  classical: { label: "Classical (30 min)", time: 1800 },
}

export function ChessGame() {
  const gameRef = useRef(new Chess())
  const [fen, setFen] = useState(gameRef.current.fen())
  const [moveHistory, setMoveHistory] = useState<string[]>([])
  const [captured, setCaptured] = useState<{ w: string[]; b: string[] }>({ w: [], b: [] })
  const [difficulty, setDifficulty] = useState<Difficulty>("Basic")
  const [gameState, setGameState] = useState<GameState>("setup")

  const [playerColor, setPlayerColor] = useState<PlayerColor>("w")
  const [selectedSide, setSelectedSide] = useState<PlayerColor | "random">("random")

  const [timeControl, setTimeControl] = useState<TimeControl>("rapid")
  const [whiteTime, setWhiteTime] = useState(600)
  const [blackTime, setBlackTime] = useState(600)
  const [winner, setWinner] = useState<"w" | "b" | "draw" | null>(null)
  const [gameOverReason, setGameOverReason] = useState<string>("")
  const [gameSaved, setGameSaved] = useState(false)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const startGame = () => {
    const initialTime = TIME_CONTROLS[timeControl].time
    setWhiteTime(initialTime)
    setBlackTime(initialTime)
    setWinner(null)
    setGameOverReason("")

    if (selectedSide === "random") {
      setPlayerColor(Math.random() > 0.5 ? "w" : "b")
    } else {
      setPlayerColor(selectedSide)
    }

    setGameState("playing")
  }

  // Clock timer
  useEffect(() => {
    if (gameState !== "playing") return

    const timer = setInterval(() => {
      if (gameRef.current.turn() === "w") {
        setWhiteTime((prev) => {
          if (prev <= 0) {
            setGameState("finished")
            setWinner("b")
            setGameOverReason("White ran out of time")
            return 0
          }
          return prev - 1
        })
      } else {
        setBlackTime((prev) => {
          if (prev <= 0) {
            setGameState("finished")
            setWinner("w")
            setGameOverReason("Black ran out of time")
            return 0
          }
          return prev - 1
        })
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState])

  // Check game over conditions
  useEffect(() => {
    const game = gameRef.current
    if (game.isGameOver()) {
      setGameState("finished")
      if (game.isCheckmate()) {
        setWinner(game.turn() === "w" ? "b" : "w")
        setGameOverReason("Checkmate")
      } else if (game.isDraw()) {
        setWinner("draw")
        setGameOverReason("Draw")
      } else if (game.isStalemate()) {
        setWinner("draw")
        setGameOverReason("Stalemate")
      } else if (game.isThreefoldRepetition()) {
        setWinner("draw")
        setGameOverReason("Threefold Repetition")
      } else if (game.isInsufficientMaterial()) {
        setWinner("draw")
        setGameOverReason("Insufficient Material")
      }
    }
  }, [fen])

  // Save game when finished
  useEffect(() => {
    if (gameState === "finished" && winner !== null && !gameSaved) {
      const saveGameData = async () => {
        try {
          const game = gameRef.current
          // Determine result from player's perspective
          let result: "win" | "loss" | "draw"
          if (winner === "draw") {
            result = "draw"
          } else {
            result = winner === playerColor ? "win" : "loss"
          }

          // Generate PGN
          const pgn = game.pgn()

          const response = await saveGame({
            playerColor,
            difficulty,
            timeControl,
            result,
            endReason: gameOverReason,
            finalFen: game.fen(),
            playerTime: playerColor === "w" ? whiteTime : blackTime,
            opponentTime: playerColor === "w" ? blackTime : whiteTime,
            moves: moveHistory,
            pgn,
          })

          if (response.error) {
            toast.error(response.error)
          } else if (response.success) {
            setGameSaved(true)
            const ratingChange = response.ratingChange || 0
            if (ratingChange > 0) {
              toast.success(`Game saved! Rating +${ratingChange}`)
            } else if (ratingChange < 0) {
              toast.success(`Game saved! Rating ${ratingChange}`)
            } else {
              toast.success("Game saved!")
            }
          }
        } catch (error) {
          console.error("Error saving game:", error)
          toast.error("Failed to save game")
        }
      }

      saveGameData()
    }
  }, [gameState, winner, gameSaved, playerColor, difficulty, timeControl, gameOverReason, whiteTime, blackTime, moveHistory])

  // Make a move
  const makeMove = useCallback(
    (move: { from: string; to: string; promotion?: string }) => {
      const game = gameRef.current

      if (game.turn() !== playerColor) {
        return false
      }

      try {
        const result = game.move(move)

        if (result) {
          setFen(game.fen())
          setMoveHistory(game.history())

          // Update captured pieces
          if (result.captured) {
            setCaptured((prev) => ({
              ...prev,
              [result.color === "w" ? "b" : "w"]: [...prev[result.color === "w" ? "b" : "w"], result.captured!],
            }))
          }
          return true
        }
      } catch {
        return false
      }
      return false
    },
    [playerColor],
  )

  // Bot move
  useEffect(() => {
    const game = gameRef.current
    if (gameState === "playing" && game.turn() !== playerColor && !game.isGameOver()) {
      const timeout = setTimeout(() => {
        const bestMove = getBestMove(game, difficulty)
        if (bestMove) {
          game.move(bestMove)
          setFen(game.fen())
          setMoveHistory(game.history())
        }
      }, 500)
      return () => clearTimeout(timeout)
    }
  }, [fen, difficulty, gameState, playerColor])

  const resetGame = () => {
    const newGame = new Chess()
    gameRef.current = newGame
    setFen(newGame.fen())
    setMoveHistory([])
    setCaptured({ w: [], b: [] })
    setWinner(null)
    setGameOverReason("")
    setGameSaved(false)
    setGameState("setup")
  }

  const handleResign = () => {
    setGameState("finished")
    setWinner(playerColor === "w" ? "b" : "w")
    setGameOverReason(`${playerColor === "w" ? "White" : "Black"} resigned`)
  }

  const handleDraw = () => {
    setGameState("finished")
    setWinner("draw")
    setGameOverReason("Draw agreed")
  }

  if (gameState === "setup") {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <Card className="w-full max-w-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">Chess</h1>
            <p className="text-muted-foreground">Configure your game</p>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Select Difficulty</h3>
              <div className="grid grid-cols-2 gap-2">
                {(["Basic", "Intermediate", "Advanced", "Pro"] as Difficulty[]).map((level) => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={`p-3 rounded-lg border-2 transition-all text-center ${difficulty === level
                      ? "border-primary bg-primary/10 font-bold"
                      : "border-border hover:border-primary/50"
                      }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Play As</h3>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setSelectedSide("w")}
                  className={`p-3 rounded-lg border-2 transition-all text-center ${selectedSide === "w"
                    ? "border-primary bg-primary/10 font-bold"
                    : "border-border hover:border-primary/50"
                    }`}
                >
                  White
                </button>
                <button
                  onClick={() => setSelectedSide("random")}
                  className={`p-3 rounded-lg border-2 transition-all text-center ${selectedSide === "random"
                    ? "border-primary bg-primary/10 font-bold"
                    : "border-border hover:border-primary/50"
                    }`}
                >
                  Random
                </button>
                <button
                  onClick={() => setSelectedSide("b")}
                  className={`p-3 rounded-lg border-2 transition-all text-center ${selectedSide === "b"
                    ? "border-primary bg-primary/10 font-bold"
                    : "border-border hover:border-primary/50"
                    }`}
                >
                  Black
                </button>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Time Control</h3>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(TIME_CONTROLS) as TimeControl[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setTimeControl(mode)}
                    className={`p-3 rounded-lg border-2 transition-all text-center ${timeControl === mode
                      ? "border-primary bg-primary/10 font-bold"
                      : "border-border hover:border-primary/50"
                      }`}
                  >
                    <div className="text-sm">{TIME_CONTROLS[mode].label}</div>
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={startGame} className="w-full" size="lg">
              <Play className="w-4 h-4 mr-2" />
              Start Game
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start justify-center max-w-6xl mx-auto">
      <div className="flex-1 w-full max-w-[600px]">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded flex items-center justify-center font-bold ${playerColor === "w" ? "bg-black text-white" : "bg-white border text-black"}`}
            >
              {playerColor === "w" ? "B" : "W"}
            </div>
            <div>
              <div className="font-bold">Opponent (Bot)</div>
              <div className="text-xs text-muted-foreground">Level: {difficulty}</div>
            </div>
          </div>
          <div
            className={`px-3 py-1 rounded font-mono text-xl font-bold ${gameRef.current.turn() !== playerColor && gameState === "playing" ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}
          >
            {formatTime(playerColor === "w" ? blackTime : whiteTime)}
          </div>
        </div>

        <Card className="overflow-hidden shadow-xl border-0 relative">
          <ChessBoard
            game={gameRef.current}
            fen={fen}
            onMove={makeMove}
            boardOrientation={playerColor === "w" ? "white" : "black"}
          />

          {gameState === "finished" && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
              <Card className="p-6 text-center animate-in fade-in zoom-in duration-300">
                <h2 className="text-2xl font-bold mb-2">
                  {winner === "w" ? "You Won!" : winner === "b" ? "You Lost" : "Draw"}
                </h2>
                <p className="text-muted-foreground mb-4">{gameOverReason}</p>
                <Button onClick={resetGame}>Play Again</Button>
              </Card>
            </div>
          )}
        </Card>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded flex items-center justify-center font-bold ${playerColor === "w" ? "bg-white border text-black" : "bg-black text-white"}`}
            >
              {playerColor === "w" ? "W" : "B"}
            </div>
            <div>
              <div className="font-bold">You</div>
              <div className="text-xs text-muted-foreground">Rating: 1200</div>
            </div>
          </div>
          <div
            className={`px-3 py-1 rounded font-mono text-xl font-bold ${gameRef.current.turn() === playerColor && gameState === "playing" ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}
          >
            {formatTime(playerColor === "w" ? whiteTime : blackTime)}
          </div>
        </div>
      </div>

      <div className="w-full lg:w-[350px] flex flex-col gap-4">
        <Card className="flex-1 p-4 min-h-[400px] flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-4 border-b">
            <h2 className="font-bold text-lg">Game Info</h2>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={resetGame} title="New Game">
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto mb-4">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              {moveHistory.reduce((acc: any[], move, i) => {
                if (i % 2 === 0) {
                  acc.push(
                    <div key={i} className="flex items-center">
                      <span className="w-6 text-muted-foreground">{Math.floor(i / 2) + 1}.</span>
                      <span className="font-medium">{move}</span>
                    </div>,
                  )
                } else {
                  const last = acc[acc.length - 1]
                  acc[acc.length - 1] = (
                    <div key={i - 1} className="contents">
                      {last}
                      <span className="font-medium">{move}</span>
                    </div>
                  )
                }
                return acc
              }, [])}
            </div>
          </div>

          <div className="flex gap-2 mt-auto pt-4 border-t">
            <Button
              className="flex-1 bg-transparent"
              variant="outline"
              onClick={handleResign}
              disabled={gameState !== "playing"}
            >
              <Flag className="w-4 h-4 mr-2" /> Resign
            </Button>
            <Button
              className="flex-1 bg-transparent"
              variant="outline"
              onClick={handleDraw}
              disabled={gameState !== "playing"}
            >
              ½-½ Draw
            </Button>
          </div>

          <div className="flex justify-center gap-2 mt-4">
            <Button variant="secondary" size="icon">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="secondary" size="icon">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
