"use client"

import { useState, useEffect } from "react"
import { Chess } from "chess.js"
import { Chessboard } from "react-chessboard"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { submitPuzzleAttempt, skipPuzzle, getPuzzleHint } from "@/lib/actions/puzzles"
import { toast } from "sonner"
import { Lightbulb, SkipForward, RotateCcw, Trophy } from "lucide-react"
import type { Puzzle } from "@/lib/db/schema"

interface PuzzleSolverProps {
  puzzle: Puzzle
  onPuzzleComplete: () => void
}

export function PuzzleSolver({ puzzle, onPuzzleComplete }: PuzzleSolverProps) {
  const [game, setGame] = useState(new Chess(puzzle.fen))
  const [fen, setFen] = useState(puzzle.fen)
  const [userMoves, setUserMoves] = useState<string[]>([])
  const [solutionMoves] = useState<string[]>(puzzle.moves as string[])
  const [puzzleState, setPuzzleState] = useState<"playing" | "correct" | "wrong">("playing")
  const [attempts, setAttempts] = useState(0)
  const [hintUsed, setHintUsed] = useState(false)

  // Determine player's color from starting position (whose turn it is to move)
  const [playerColor] = useState<"white" | "black">(() => {
    const initialGame = new Chess(puzzle.fen)
    return initialGame.turn() === "w" ? "white" : "black"
  })

  useEffect(() => {
    // Reset when puzzle changes
    setGame(new Chess(puzzle.fen))
    setFen(puzzle.fen)
    setUserMoves([])
    setPuzzleState("playing")
    setAttempts(0)
    setHintUsed(false)
  }, [puzzle])

  const handleMove = ({ sourceSquare, targetSquare }: { piece?: unknown; sourceSquare: string; targetSquare: string | null }) => {
    // Only allow moves during playing state
    if (puzzleState !== "playing") return false
    if (!targetSquare) return false

    const gameCopy = new Chess(game.fen())

    try {
      // Try to make the move
      const move = gameCopy.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q", // Always promote to queen for simplicity
      })

      if (move === null) return false

      // Player moves are at even indices: 0, 2, 4...
      // Calculate which player move this should be
      const playerMoveCount = userMoves.length
      const solutionMoveIndex = playerMoveCount * 2
      const expectedMove = solutionMoves[solutionMoveIndex]

      if (move.san === expectedMove) {
        // Correct move!
        const newUserMoves = [...userMoves, move.san]
        setUserMoves(newUserMoves)
        setGame(gameCopy)
        setFen(gameCopy.fen())

        // Reset hint for the next move
        setHintUsed(false)

        // Calculate expected number of player moves
        const totalPlayerMoves = Math.ceil(solutionMoves.length / 2)

        // Check if puzzle is complete
        if (newUserMoves.length === totalPlayerMoves) {
          handlePuzzleComplete(true, newUserMoves)
        } else {
          // Make opponent's response
          const opponentMoveIndex = solutionMoveIndex + 1
          if (opponentMoveIndex < solutionMoves.length) {
            setTimeout(() => {
              makeOpponentMove(gameCopy, opponentMoveIndex)
            }, 500)
          }
        }

        return true
      } else {
        // Wrong move
        handlePuzzleComplete(false, [...userMoves, move.san])
        return false
      }
    } catch {
      return false
    }
  }

  const makeOpponentMove = (currentGame: Chess, opponentMoveIndex: number) => {
    // Validate index
    if (opponentMoveIndex < 0 || opponentMoveIndex >= solutionMoves.length) {
      return
    }

    const opponentMove = solutionMoves[opponentMoveIndex]

    try {
      currentGame.move(opponentMove)
      setGame(new Chess(currentGame.fen()))
      setFen(currentGame.fen())
    } catch {
      // Silent fail
    }
  }

  const handlePuzzleComplete = async (correct: boolean, finalMoves: string[]) => {
    setPuzzleState(correct ? "correct" : "wrong")
    setAttempts(attempts + 1)

    // Submit the attempt to the server
    const response = await submitPuzzleAttempt(puzzle.id, finalMoves)

    if (response.success) {
      if (correct) {
        toast.success("Puzzle solved!", {
          description: `${response.alreadySolved ? "Already solved" : "First solve"} • ${response.attempts} ${response.attempts === 1 ? "attempt" : "attempts"}`,
        })
      } else {
        toast.error("Incorrect move", {
          description: "Try again or use a hint",
        })
      }
    }
  }

  const handleReset = () => {
    const newGame = new Chess(puzzle.fen)
    setGame(newGame)
    setFen(newGame.fen())
    setUserMoves([])
    setPuzzleState("playing")
  }

  const handleSkip = async () => {
    await skipPuzzle(puzzle.id)
    toast.info("Puzzle skipped")
    onPuzzleComplete()
  }

  const handleHint = async () => {
    const response = await getPuzzleHint(puzzle.id, userMoves.length)

    if (response.success && response.hint) {
      toast.info("Hint", { description: response.hint })
      setHintUsed(true)
    } else if (response.error) {
      toast.error("No hint available", { description: response.error })
    }
  }

  const handleNext = () => {
    onPuzzleComplete()
  }

  const difficultyColor = (rating: number) => {
    if (rating < 1200) return "bg-green-600"
    if (rating < 1700) return "bg-yellow-600"
    return "bg-red-600"
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {puzzle.description}
              </CardTitle>
              <CardDescription className="mt-2">
                <div className="flex items-center gap-2">
                  <Badge className={difficultyColor(puzzle.rating)}>
                    {puzzle.rating}
                  </Badge>
                  <span className="text-xs capitalize">
                    {Array.isArray(puzzle.themes)
                      ? puzzle.themes.join(", ")
                      : puzzle.themes}
                  </span>
                </div>
              </CardDescription>
            </div>

            {puzzleState === "correct" && (
              <Badge className="bg-green-600 flex items-center gap-1">
                <Trophy className="w-3 h-3" />
                Solved!
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="max-w-[600px] mx-auto">
            <Chessboard
              options={{
                position: fen,
                onPieceDrop: handleMove,
                boardOrientation: playerColor,
                allowDragging: puzzleState === "playing",
                boardStyle: {
                  borderRadius: "4px",
                  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
                },
              }}
            />
          </div>

          <div className="mt-4 flex flex-col gap-2">
            {puzzleState === "playing" && (
              <div className="flex gap-2 justify-center">
                <Button variant="outline" size="sm" onClick={handleReset}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleHint}
                  disabled={hintUsed}
                >
                  <Lightbulb className="w-4 h-4 mr-2" />
                  {hintUsed ? "Hint Used" : "Hint"}
                </Button>
                <Button variant="outline" size="sm" onClick={handleSkip}>
                  <SkipForward className="w-4 h-4 mr-2" />
                  Skip
                </Button>
              </div>
            )}

            {puzzleState === "correct" && (
              <div className="flex gap-2 justify-center">
                <Button onClick={handleNext} className="w-full max-w-xs">
                  Next Puzzle
                </Button>
              </div>
            )}

            {puzzleState === "wrong" && (
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={handleReset}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button variant="outline" onClick={handleHint} disabled={hintUsed}>
                  <Lightbulb className="w-4 h-4 mr-2" />
                  {hintUsed ? "Hint Used" : "Hint"}
                </Button>
                <Button onClick={handleNext}>Next Puzzle</Button>
              </div>
            )}
          </div>

          {userMoves.length > 0 && (
            <div className="mt-4 p-3 bg-muted rounded text-sm">
              <p className="font-medium mb-1">Your moves:</p>
              <p>{userMoves.join(", ")}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
