"use client"

import { useState } from "react"
import { Chessboard } from "react-chessboard"

interface ChessBoardProps {
  fen?: string
  onMove?: (_move: { from: string; to: string; promotion?: string }) => boolean
  boardOrientation?: "white" | "black"
  options?: {
    position?: string
    allowDragging?: boolean
    boardOrientation?: "white" | "black"
  }
}

export function ChessBoard({ fen, onMove, boardOrientation = "white", options }: ChessBoardProps) {
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null)

  // Support both direct props and options object
  const position = options?.position || fen || "start"
  const orientation = options?.boardOrientation || boardOrientation
  const allowDragging = options?.allowDragging !== false && !!onMove

  function onPieceDrop({ sourceSquare, targetSquare }: { piece?: unknown; sourceSquare: string; targetSquare: string | null }) {
    if (!targetSquare || !onMove) return false

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
    if (!onMove) return

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
          position: position,
          onPieceDrop: allowDragging ? onPieceDrop : undefined,
          onSquareClick: allowDragging ? onSquareClick : undefined,
          boardOrientation: orientation,
          allowDragging: allowDragging,
          squareStyles: selectedSquare && allowDragging
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
