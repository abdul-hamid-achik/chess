"use client"

import { useState, useRef, useEffect } from "react"
import { Chess } from "chess.js"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeft,
  BookmarkPlus,
  BookmarkCheck,
  BookmarkX,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Trophy,
  Zap,
  GitBranch,
} from "lucide-react"
import { ChessBoard } from "@/components/features/game/chess-board"
import {
  addToRepertoire,
  removeFromRepertoire,
  updateOpeningNotes,
  getUserOpenings,
} from "@/lib/actions/openings"
import { toast } from "sonner"

interface Opening {
  id: string
  name: string
  eco: string | null
  moves: string[]
  fen: string
  description: string | null
  variations: Array<{ name: string; moves: string[] }> | null
  popularity?: number
  difficultyLevel?: string
  themes?: string[]
  winRate?: number | null
  drawRate?: number | null
  lossRate?: number | null
  createdAt: Date
}

interface OpeningDetailViewProps {
  opening: Opening
  userId: string
  inRepertoire: {
    white: boolean
    black: boolean
    whiteId?: string
    blackId?: string
  }
}

export function OpeningDetailView({ opening, userId, inRepertoire: initialRepertoire }: OpeningDetailViewProps) {
  const router = useRouter()
  const [currentFen, setCurrentFen] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0)
  const [selectedColor, setSelectedColor] = useState<"w" | "b">("w")
  const [notes, setNotes] = useState("")
  const [userNotes, setUserNotes] = useState<{ white: string; black: string }>({ white: "", black: "" })
  const [inRepertoire, setInRepertoire] = useState(initialRepertoire)
  const [saving, setSaving] = useState(false)
  const gameRef = useRef(new Chess())

  useEffect(() => {
    // Reset board and play moves up to current index
    const game = new Chess()
    const moves = opening.moves.slice(0, currentMoveIndex)

    for (const move of moves) {
      try {
        game.move(move)
      } catch (_error) {
        console.error("Invalid move:", move, _error)
        break
      }
    }

    setCurrentFen(game.fen())
    gameRef.current = game
  }, [currentMoveIndex, opening.moves])

  useEffect(() => {
    // Load user notes if in repertoire
    loadUserNotes()
  }, [userId, opening.id])

  const loadUserNotes = async () => {
    const result = await getUserOpenings()
    if (result.success && result.openings) {
      const whiteOpening = result.openings.find(
        (o) => o.openingId === opening.id && o.color === "w"
      )
      const blackOpening = result.openings.find(
        (o) => o.openingId === opening.id && o.color === "b"
      )
      setUserNotes({
        white: whiteOpening?.notes || "",
        black: blackOpening?.notes || "",
      })
    }
  }

  const handlePreviousMove = () => {
    if (currentMoveIndex > 0) {
      setCurrentMoveIndex(currentMoveIndex - 1)
    }
  }

  const handleNextMove = () => {
    if (currentMoveIndex < opening.moves.length) {
      setCurrentMoveIndex(currentMoveIndex + 1)
    }
  }

  const handleResetPosition = () => {
    setCurrentMoveIndex(0)
  }

  const handleJumpToMove = (index: number) => {
    setCurrentMoveIndex(index + 1)
  }

  const handleAddToRepertoire = async () => {
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
        setInRepertoire((prev) => ({
          ...prev,
          [selectedColor === "w" ? "white" : "black"]: true,
          [selectedColor === "w" ? "whiteId" : "blackId"]: result.userOpening?.id,
        }))
        await loadUserNotes()
      }
    } catch (_error) {
      toast.error("Failed to add to repertoire")
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveFromRepertoire = async () => {
    const userOpeningId = selectedColor === "w" ? inRepertoire.whiteId : inRepertoire.blackId
    if (!userOpeningId) return

    setSaving(true)
    try {
      const result = await removeFromRepertoire(userOpeningId)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`Removed from ${selectedColor === "w" ? "White" : "Black"} repertoire`)
        setInRepertoire((prev) => ({
          ...prev,
          [selectedColor === "w" ? "white" : "black"]: false,
          [selectedColor === "w" ? "whiteId" : "blackId"]: undefined,
        }))
      }
    } catch (_error) {
      toast.error("Failed to remove from repertoire")
    } finally {
      setSaving(false)
    }
  }

  const handleSaveNotes = async () => {
    const userOpeningId = selectedColor === "w" ? inRepertoire.whiteId : inRepertoire.blackId
    if (!userOpeningId) return

    setSaving(true)
    try {
      const result = await updateOpeningNotes(userOpeningId, notes)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Notes updated!")
        setUserNotes((prev) => ({
          ...prev,
          [selectedColor === "w" ? "white" : "black"]: notes,
        }))
      }
    } catch (_error) {
      toast.error("Failed to update notes")
    } finally {
      setSaving(false)
    }
  }

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "intermediate":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "advanced":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "master":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const isInRepertoireForColor = selectedColor === "w" ? inRepertoire.white : inRepertoire.black

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 py-4">
        <div className="container mx-auto">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push("/learn")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Learn
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{opening.name}</h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {opening.eco && (
                  <Badge variant="outline" className="font-mono">
                    {opening.eco}
                  </Badge>
                )}
                {opening.difficultyLevel && (
                  <Badge className={getDifficultyColor(opening.difficultyLevel)}>
                    {opening.difficultyLevel}
                  </Badge>
                )}
                {opening.themes?.map((theme) => (
                  <Badge key={theme} variant="secondary">
                    {theme}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Chessboard and Controls (2/3) */}
          <div className="lg:col-span-2 space-y-6">

            {/* Chessboard */}
            <Card>
              <CardContent className="p-6">
                <div className="w-full aspect-square max-w-2xl mx-auto">
                  <ChessBoard
                    options={{
                      position: currentFen,
                      allowDragging: false,
                      boardOrientation: "white",
                    }}
                  />
                </div>

                {/* Move Navigation */}
                <div className="flex items-center justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleResetPosition}
                    disabled={currentMoveIndex === 0}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePreviousMove}
                    disabled={currentMoveIndex === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleNextMove}
                    disabled={currentMoveIndex >= opening.moves.length}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Move List */}
            <Card>
              <CardHeader>
                <CardTitle>Main Line</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {opening.moves.map((move, index) => (
                    <Badge
                      key={index}
                      variant={index < currentMoveIndex ? "default" : "outline"}
                      className="font-mono cursor-pointer hover:bg-primary/80"
                      onClick={() => handleJumpToMove(index)}
                    >
                      {index % 2 === 0 && `${Math.floor(index / 2) + 1}. `}
                      {move}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Variations */}
            {opening.variations && opening.variations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GitBranch className="h-5 w-5" />
                    Variations ({opening.variations.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {opening.variations.map((variation, index) => (
                    <div key={index} className="space-y-2">
                      <h4 className="font-semibold text-sm">{variation.name}</h4>
                      <div className="flex flex-wrap gap-1">
                        {variation.moves.map((move, moveIndex) => (
                          <Badge key={moveIndex} variant="secondary" className="font-mono text-xs">
                            {moveIndex % 2 === 0 && `${Math.floor(moveIndex / 2) + 1}. `}
                            {move}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Details and Actions (1/3) */}
          <div className="space-y-6">
            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {opening.popularity !== undefined && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      Popularity
                    </div>
                    <span className="font-semibold">{opening.popularity}</span>
                  </div>
                )}
                {opening.winRate !== null && opening.winRate !== undefined && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <Trophy className="h-4 w-4 text-green-600" />
                      Win Rate
                    </div>
                    <span className="font-semibold text-green-600">
                      {Math.round(opening.winRate * 100)}%
                    </span>
                  </div>
                )}
                {opening.drawRate !== null && opening.drawRate !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Draw Rate</span>
                    <span className="font-semibold">
                      {Math.round(opening.drawRate * 100)}%
                    </span>
                  </div>
                )}
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Moves</span>
                  <span className="font-semibold">{opening.moves.length}</span>
                </div>
                {opening.variations && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Variations</span>
                    <span className="font-semibold">{opening.variations.length}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Description */}
            {opening.description && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {opening.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Repertoire Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Add to Repertoire</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    variant={selectedColor === "w" ? "default" : "outline"}
                    onClick={() => setSelectedColor("w")}
                    className="flex-1"
                    size="sm"
                  >
                    {inRepertoire.white && <BookmarkCheck className="h-4 w-4 mr-2" />}
                    White
                  </Button>
                  <Button
                    variant={selectedColor === "b" ? "default" : "outline"}
                    onClick={() => setSelectedColor("b")}
                    className="flex-1"
                    size="sm"
                  >
                    {inRepertoire.black && <BookmarkCheck className="h-4 w-4 mr-2" />}
                    Black
                  </Button>
                </div>

                {isInRepertoireForColor ? (
                  <div className="space-y-3">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={notes || userNotes[selectedColor === "w" ? "white" : "black"]}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add your notes about this opening..."
                      rows={4}
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleSaveNotes} disabled={saving} className="flex-1">
                        Save Notes
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleRemoveFromRepertoire}
                        disabled={saving}
                      >
                        <BookmarkX className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Label htmlFor="notes">Notes (optional)</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add your notes about this opening..."
                      rows={4}
                    />
                    <Button onClick={handleAddToRepertoire} disabled={saving} className="w-full">
                      <BookmarkPlus className="h-4 w-4 mr-2" />
                      Add to Repertoire
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
