"use client"

import { useState } from "react"
import { Chessboard } from "react-chessboard"

interface ChessBoardProps {
  fen: string
  onMove: (_move: { from: string; to: string; promotion?: string }) => boolean
  boardOrientation?: "white" | "black"
}

export function ChessBoard({ fen, onMove, boardOrientation = "white" }: ChessBoardProps) {
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null)

  function onPieceDrop({ sourceSquare, targetSquare }: { piece?: unknown; sourceSquare: string; targetSquare: string | null }) {
    if (!targetSquare) return false

    const move = {
      from: sourceSquare,
      to: targetSquare,
      promotion: "q", // always promote to queen for simplicity
    }

    const result = onMove(move)

    // Clear selection after move
    setSelectedSquare(null)

    return result
  }

  function onSquareClick({ square }: { piece?: unknown; square: string }) {
    if (selectedSquare === null) {
      // First click - select the square
      setSelectedSquare(square)
    } else {
      // Second click - try to move
      const move = {
        from: selectedSquare,
        to: square,
        promotion: "q",
      }

      const result = onMove(move)

      if (!result) {
        // Invalid move, try selecting the new square instead
        setSelectedSquare(square)
      } else {
        // Valid move, clear selection
        setSelectedSquare(null)
      }
    }
  }

  return (
    <div className="w-full h-full">
      <Chessboard
        options={{
          position: fen,
          onPieceDrop: onPieceDrop,
          onSquareClick: onSquareClick,
          boardOrientation: boardOrientation,
          allowDragging: true,
          squareStyles: selectedSquare
            ? {
                [selectedSquare]: {
                  backgroundColor: "rgba(255, 255, 0, 0.4)",
                },
              }
            : {},
        }}
      />
    </div>
  )
}
