"use client"

import { useState, useEffect } from "react"
import { Chess } from "chess.js"
import { Chessboard } from "react-chessboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

interface GameReplayProps {
  moves: string[]
  initialFen?: string
  playerColor: "w" | "b"
}

export function GameReplay({ moves, initialFen, playerColor }: GameReplayProps) {
  const [game, setGame] = useState(new Chess())
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1)
  const [fen, setFen] = useState(game.fen())

  useEffect(() => {
    const newGame = new Chess()
    setGame(newGame)
    setFen(newGame.fen())
    setCurrentMoveIndex(-1)
  }, [moves])

  const goToMove = (moveIndex: number) => {
    const newGame = new Chess()

    for (let i = 0; i <= moveIndex; i++) {
      if (i < moves.length) {
        try {
          newGame.move(moves[i])
        } catch (e) {
          console.error("Error applying move:", moves[i], e)
          break
        }
      }
    }

    setGame(newGame)
    setFen(newGame.fen())
    setCurrentMoveIndex(moveIndex)
  }

  const goToStart = () => goToMove(-1)
  const goToPrevious = () => {
    if (currentMoveIndex > -1) {
      goToMove(currentMoveIndex - 1)
    }
  }
  const goToNext = () => {
    if (currentMoveIndex < moves.length - 1) {
      goToMove(currentMoveIndex + 1)
    }
  }
  const goToEnd = () => goToMove(moves.length - 1)

  return (
    <div className="space-y-4">
      <Card className="max-w-[600px] mx-auto">
        <CardContent className="p-4">
          <Chessboard
            position={fen}
            boardOrientation={playerColor === "w" ? "white" : "black"}
            arePiecesDraggable={false}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Move Navigation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center gap-2 mb-4">
            <Button
              variant="outline"
              size="icon"
              onClick={goToStart}
              disabled={currentMoveIndex === -1}
            >
              <ChevronsLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={goToPrevious}
              disabled={currentMoveIndex === -1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="px-4 py-2 bg-muted rounded flex items-center">
              Move {currentMoveIndex + 1} of {moves.length}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={goToNext}
              disabled={currentMoveIndex === moves.length - 1}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={goToEnd}
              disabled={currentMoveIndex === moves.length - 1}
            >
              <ChevronsRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="max-h-64 overflow-y-auto">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              {moves.reduce((acc: any[], move, i) => {
                const isCurrentMove = i === currentMoveIndex

                if (i % 2 === 0) {
                  acc.push(
                    <div key={i} className="flex items-center">
                      <span className="w-6 text-muted-foreground">{Math.floor(i / 2) + 1}.</span>
                      <button
                        className={`font-medium hover:bg-accent px-2 py-1 rounded ${
                          isCurrentMove ? "bg-primary text-primary-foreground" : ""
                        }`}
                        onClick={() => goToMove(i)}
                      >
                        {move}
                      </button>
                    </div>,
                  )
                } else {
                  const last = acc[acc.length - 1]
                  acc[acc.length - 1] = (
                    <div key={i - 1} className="contents">
                      {last}
                      <button
                        className={`font-medium hover:bg-accent px-2 py-1 rounded ${
                          isCurrentMove ? "bg-primary text-primary-foreground" : ""
                        }`}
                        onClick={() => goToMove(i)}
                      >
                        {move}
                      </button>
                    </div>
                  )
                }
                return acc
              }, [])}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
