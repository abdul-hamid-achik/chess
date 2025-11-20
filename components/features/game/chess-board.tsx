"use client"

import { Chessboard } from "react-chessboard"
import type { Chess } from "chess.js"

interface ChessBoardProps {
  game: Chess
  fen: string
  onMove: (move: { from: string; to: string; promotion?: string }) => boolean
  boardOrientation?: "white" | "black"
}

export function ChessBoard({ game, fen, onMove, boardOrientation = "white" }: ChessBoardProps) {
  function onPieceDrop(sourceSquare: string, targetSquare: string) {
    const move = {
      from: sourceSquare,
      to: targetSquare,
      promotion: "q", // always promote to queen for simplicity
    }

    return onMove(move)
  }

  return (
    <div className="w-full h-full">
      {/* @ts-ignore */}
      {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
      <Chessboard
        // @ts-ignore
        position={fen}
        onPieceDrop={onPieceDrop}
        boardOrientation={boardOrientation}
        arePiecesDraggable={true}
      />
    </div>
  )
}
