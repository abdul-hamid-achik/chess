"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { BookmarkPlus, BookmarkCheck, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react"
import { ChessBoard } from "@/components/features/game/chess-board"
import { Chess } from "chess.js"
import { addToRepertoire, removeFromRepertoire, isInRepertoire } from "@/lib/actions/openings"
import { toast } from "sonner"

interface Opening {
  id: string
  name: string
  eco: string | null
  moves: string[]
  fen: string
  description: string | null
  variations: Array<{ name: string; moves: string[] }> | null
  createdAt: Date
}

interface OpeningDetailProps {
  opening: Opening | null
  open: boolean
  onOpenChange: (_open: boolean) => void
  onRepertoireChange?: () => void
}

export function OpeningDetail({ opening, open, onOpenChange, onRepertoireChange }: OpeningDetailProps) {
  const [game, setGame] = useState<Chess>(new Chess())
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0)
  const [selectedColor, setSelectedColor] = useState<"w" | "b">("w")
  const [notes, setNotes] = useState("")
  const [inRepertoire, setInRepertoire] = useState<{ white: boolean; black: boolean, whiteId?: string, blackId?: string }>({
    white: false,
    black: false,
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (opening) {
      resetPosition()
      checkRepertoire()
    }
  }, [opening])

  const resetPosition = () => {
    if (!opening) return

    const newGame = new Chess()
    setGame(newGame)
    setCurrentMoveIndex(0)
  }

  const checkRepertoire = async () => {
    if (!opening) return

    const [whiteCheck, blackCheck] = await Promise.all([
      isInRepertoire(opening.id, "w"),
      isInRepertoire(opening.id, "b"),
    ])

    setInRepertoire({
      white: whiteCheck.isInRepertoire,
      black: blackCheck.isInRepertoire,
      whiteId: whiteCheck.userOpeningId,
      blackId: blackCheck.userOpeningId,
    })
  }

  const makeMove = (moveIndex: number) => {
    if (!opening) return

    const newGame = new Chess()

    // Make all moves up to and including the target index
    for (let i = 0; i <= moveIndex && i < opening.moves.length; i++) {
      try {
        newGame.move(opening.moves[i])
      } catch (error) {
        console.error("Invalid move:", opening.moves[i], error)
        break
      }
    }

    setGame(newGame)
    setCurrentMoveIndex(moveIndex)
  }

  const handlePrevious = () => {
    if (currentMoveIndex > 0) {
      makeMove(currentMoveIndex - 1)
    } else {
      resetPosition()
    }
  }

  const handleNext = () => {
    if (opening && currentMoveIndex < opening.moves.length - 1) {
      makeMove(currentMoveIndex + 1)
    }
  }

  const handleReset = () => {
    resetPosition()
  }

  const handleAddToRepertoire = async () => {
    if (!opening) return

    setSaving(true)
    try {
      const result = await addToRepertoire({
        openingId: opening.id,
        color: selectedColor,
        notes: notes.trim() || undefined,
      })

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`Added to ${selectedColor === "w" ? "White" : "Black"} repertoire!`)
        await checkRepertoire()
        onRepertoireChange?.()
      }
    } catch (_error) {
      toast.error("Failed to add to repertoire")
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveFromRepertoire = async () => {
    if (!opening) return

    const userOpeningId = selectedColor === "w" ? inRepertoire.whiteId : inRepertoire.blackId
    if (!userOpeningId) return

    setSaving(true)
    try {
      const result = await removeFromRepertoire(userOpeningId)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`Removed from ${selectedColor === "w" ? "White" : "Black"} repertoire`)
        await checkRepertoire()
        onRepertoireChange?.()
      }
    } catch (_error) {
      toast.error("Failed to remove from repertoire")
    } finally {
      setSaving(false)
    }
  }

  if (!opening) return null

  const isCurrentColorInRepertoire = selectedColor === "w" ? inRepertoire.white : inRepertoire.black

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle className="text-2xl">{opening.name}</DialogTitle>
            {opening.eco && (
              <Badge variant="secondary" className="text-base">
                {opening.eco}
              </Badge>
            )}
          </div>
          <DialogDescription>{opening.description}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          {/* Left Column: Chessboard */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <ChessBoard
                  fen={game.fen()}
                  onMove={() => false}
                  boardOrientation="white"
                />
              </CardContent>
            </Card>

            {/* Move Controls */}
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleReset}
                disabled={currentMoveIndex === 0}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrevious}
                disabled={currentMoveIndex < 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground min-w-[100px] text-center">
                {currentMoveIndex >= 0 ? `Move ${currentMoveIndex + 1}/${opening.moves.length}` : "Starting position"}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNext}
                disabled={currentMoveIndex >= opening.moves.length - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Move List */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Main Line</h4>
                <div className="flex flex-wrap gap-2">
                  {opening.moves.map((move, index) => (
                    <Button
                      key={index}
                      variant={index === currentMoveIndex ? "default" : "outline"}
                      size="sm"
                      onClick={() => makeMove(index)}
                      className="min-w-[60px]"
                    >
                      {Math.floor(index / 2) + 1}
                      {index % 2 === 0 ? "." : "..."} {move}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Details and Actions */}
          <div className="space-y-4">
            {/* Variations */}
            {opening.variations && opening.variations.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-3">Popular Variations</h4>
                  <div className="space-y-3">
                    {opening.variations.map((variation, index) => (
                      <div key={index} className="p-3 bg-muted rounded-lg">
                        <p className="font-medium text-sm mb-1">{variation.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {variation.moves.join(" ")}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Separator />

            {/* Add to Repertoire */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3">Add to Repertoire</h4>

                {/* Color Selection */}
                <div className="mb-4">
                  <Label className="mb-2 block">Play as</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={selectedColor === "w" ? "default" : "outline"}
                      onClick={() => setSelectedColor("w")}
                      className="flex-1"
                      disabled={saving}
                    >
                      White {inRepertoire.white && <BookmarkCheck className="ml-2 h-4 w-4" />}
                    </Button>
                    <Button
                      variant={selectedColor === "b" ? "default" : "outline"}
                      onClick={() => setSelectedColor("b")}
                      className="flex-1"
                      disabled={saving}
                    >
                      Black {inRepertoire.black && <BookmarkCheck className="ml-2 h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Notes */}
                {!isCurrentColorInRepertoire && (
                  <div className="mb-4">
                    <Label htmlFor="notes" className="mb-2 block">
                      Notes (optional)
                    </Label>
                    <Textarea
                      id="notes"
                      placeholder="Add personal notes about this opening..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      disabled={saving}
                    />
                  </div>
                )}

                {/* Action Button */}
                {isCurrentColorInRepertoire ? (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleRemoveFromRepertoire}
                    disabled={saving}
                  >
                    <BookmarkCheck className="mr-2 h-4 w-4" />
                    Remove from {selectedColor === "w" ? "White" : "Black"} Repertoire
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    onClick={handleAddToRepertoire}
                    disabled={saving}
                  >
                    <BookmarkPlus className="mr-2 h-4 w-4" />
                    Add to {selectedColor === "w" ? "White" : "Black"} Repertoire
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* FEN Position */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2 text-sm">FEN Position</h4>
                <code className="text-xs bg-muted p-2 rounded block break-all">
                  {game.fen()}
                </code>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
