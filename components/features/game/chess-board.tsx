"use client"

import { useState } from "react"
import { Chessboard } from "react-chessboard"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

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

type PromotionPiece = "n" | "b" | "r" | "q"

const PROMOTION_PIECES: { piece: PromotionPiece; label: string; unicode: string }[] = [
  { piece: "q", label: "Queen", unicode: "♛" },
  { piece: "r", label: "Rook", unicode: "♜" },
  { piece: "b", label: "Bishop", unicode: "♝" },
  { piece: "n", label: "Knight", unicode: "♞" },
]

export function ChessBoard({ fen, onMove, boardOrientation = "white", options }: ChessBoardProps) {
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null)
  const [pendingPromotion, setPendingPromotion] = useState<{ from: string; to: string } | null>(null)
  const [showPromotionDialog, setShowPromotionDialog] = useState(false)
  const [isWhiteTurn, setIsWhiteTurn] = useState(true)

  const position = options?.position || fen || "start"
  const orientation = options?.boardOrientation || boardOrientation
  const allowDragging = options?.allowDragging !== false && !!onMove

  function onPieceDrop({ piece, sourceSquare, targetSquare }: { piece?: unknown; sourceSquare: string; targetSquare: string | null }) {
    if (!targetSquare || !onMove) return false

    const pieceStr = piece as string
    const isPawnPromotion = pieceStr?.endsWith("P") && (targetSquare.startsWith("8") || targetSquare.startsWith("1"))

    if (isPawnPromotion) {
      setIsWhiteTurn(pieceStr?.startsWith("w"))
      setPendingPromotion({ from: sourceSquare, to: targetSquare })
      setShowPromotionDialog(true)
      return false
    }

    const move = {
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    }

    const result = onMove(move)
    setSelectedSquare(null)
    return result
  }

  function handlePromotionSelect(piece: PromotionPiece) {
    if (!pendingPromotion || !onMove) return

    const move = {
      from: pendingPromotion.from,
      to: pendingPromotion.to,
      promotion: piece,
    }

    onMove(move)
    setPendingPromotion(null)
    setShowPromotionDialog(false)
    setSelectedSquare(null)
  }

  function onSquareClick({ piece, square }: { piece?: unknown; square: string }) {
    if (!onMove) return

    if (selectedSquare === null) {
      setSelectedSquare(square)
    } else {
      const pieceStr = piece as string
      const isPawnPromotion = pieceStr?.endsWith("P") && (square.startsWith("8") || square.startsWith("1"))

      if (isPawnPromotion) {
        const fromPiece = document.querySelector(`[data-square="${selectedSquare}"]`)?.getAttribute("data-piece")
        setIsWhiteTurn(fromPiece?.startsWith("w") ?? true)
        setPendingPromotion({ from: selectedSquare, to: square })
        setShowPromotionDialog(true)
        return
      }

      const move = {
        from: selectedSquare,
        to: square,
        promotion: "q",
      }

      const result = onMove(move)

      if (!result) {
        setSelectedSquare(square)
      } else {
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
      <Dialog open={showPromotionDialog} onOpenChange={setShowPromotionDialog}>
        <DialogContent className="sm:max-w-[200px] p-4">
          <div className="text-center mb-4">
            <h3 className="font-semibold">Promote to</h3>
          </div>
          <div className="flex justify-center gap-2">
            {PROMOTION_PIECES.map(({ piece, label, unicode }) => (
              <DialogTrigger asChild key={piece}>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-14 h-14 text-2xl"
                  onClick={() => handlePromotionSelect(piece)}
                  title={label}
                >
                  <span className={isWhiteTurn ? "text-white" : "text-black"}>{unicode}</span>
                </Button>
              </DialogTrigger>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
