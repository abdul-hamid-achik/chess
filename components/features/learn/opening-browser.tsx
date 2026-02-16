"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, BookOpen, Loader2 } from "lucide-react"
import { getAllOpenings } from "@/lib/actions/openings"

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

interface OpeningBrowserProps {
  onOpeningClick?: (_opening: Opening) => void
  userRepertoireIds?: string[]
}

export function OpeningBrowser({ onOpeningClick, userRepertoireIds = [] }: OpeningBrowserProps) {
  const [openings, setOpenings] = useState<Opening[]>([])
  const [filteredOpenings, setFilteredOpenings] = useState<Opening[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [colorFilter, setColorFilter] = useState<"all" | "w" | "b">("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOpenings()
  }, [])

  useEffect(() => {
    filterOpenings()
  }, [searchTerm, colorFilter, openings])

  const loadOpenings = async () => {
    setLoading(true)
    try {
      const result = await getAllOpenings()
      if (result.success && result.openings) {
        setOpenings(result.openings)
        setFilteredOpenings(result.openings)
      }
    } catch (error) {
      console.error("Error loading openings:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterOpenings = () => {
    let filtered = openings

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (opening) =>
          opening.name.toLowerCase().includes(search) ||
          opening.eco?.toLowerCase().includes(search) ||
          opening.description?.toLowerCase().includes(search)
      )
    }

    // Apply color filter (basic heuristic based on first move)
    if (colorFilter !== "all") {
      filtered = filtered.filter((opening) => {
        const firstMove = opening.moves[0]
        if (!firstMove) return true

        // Simple heuristic: White openings start with moves like e4, d4, Nf3, c4, etc.
        // Black openings start with moves like c5, e6, Nf6, etc. (responses to e4/d4)
        if (colorFilter === "w") {
          // White openings typically have just one move
          return opening.moves.length === 1 ||
                 (opening.moves.length <= 3 && !["c5", "e5", "c6", "e6", "d5", "Nf6", "g6"].includes(firstMove))
        } else {
          // Black openings have responses
          return opening.moves.length >= 2 && ["c5", "e5", "c6", "e6", "d5", "Nf6", "g6", "d6"].includes(firstMove)
        }
      })
    }

    setFilteredOpenings(filtered)
  }

  const getColorByFirstMove = (moves: string[]): "white" | "black" | "both" => {
    if (moves.length === 0) return "both"
    const firstMove = moves[0]

    // If it's a single move opening (like "e4" or "d4"), it's for White
    if (moves.length === 1) return "white"

    // Check if it starts with common Black first moves
    if (["c5", "e5", "c6", "e6", "d5", "Nf6", "g6", "d6"].includes(firstMove)) {
      return "black"
    }

    return "white"
  }

  const isInRepertoire = (openingId: string) => {
    return userRepertoireIds.includes(openingId)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search openings by name, ECO code, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={colorFilter === "all" ? "default" : "outline"}
            onClick={() => setColorFilter("all")}
            size="sm"
          >
            All
          </Button>
          <Button
            variant={colorFilter === "w" ? "default" : "outline"}
            onClick={() => setColorFilter("w")}
            size="sm"
          >
            White
          </Button>
          <Button
            variant={colorFilter === "b" ? "default" : "outline"}
            onClick={() => setColorFilter("b")}
            size="sm"
          >
            Black
          </Button>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredOpenings.length} of {openings.length} openings
      </div>

      {/* Openings Grid */}
      {filteredOpenings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No openings found</p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3">
          {filteredOpenings.map((opening) => {
            const color = getColorByFirstMove(opening.moves)
            const inRepertoire = isInRepertoire(opening.id)

            return (
              <Card
                key={opening.id}
                className="cursor-pointer hover:border-primary transition-all hover:shadow-lg"
                onClick={() => onOpeningClick?.(opening)}
              >
                <CardHeader className="pb-1.5">
                  <div className="flex items-start justify-between gap-1.5">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm leading-tight mb-1">
                        {opening.name}
                      </CardTitle>
                      <div className="flex items-center gap-1 flex-wrap">
                        {opening.eco && (
                          <Badge variant="secondary" className="text-xs font-mono">
                            {opening.eco}
                          </Badge>
                        )}
                        {color === "white" && (
                          <Badge variant="outline" className="text-xs">⚪ White</Badge>
                        )}
                        {color === "black" && (
                          <Badge variant="outline" className="text-xs">⚫ Black</Badge>
                        )}
                        {opening.difficultyLevel && (
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              opening.difficultyLevel === "beginner" ? "border-green-500 text-green-600 dark:text-green-400" :
                              opening.difficultyLevel === "intermediate" ? "border-blue-500 text-blue-600 dark:text-blue-400" :
                              opening.difficultyLevel === "advanced" ? "border-orange-500 text-orange-600 dark:text-orange-400" :
                              "border-purple-500 text-purple-600 dark:text-purple-400"
                            }`}
                          >
                            {opening.difficultyLevel}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {inRepertoire && (
                      <Badge variant="default" className="shrink-0 text-xs">
                        ✓ Saved
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-1.5">
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-snug">
                    {opening.description || "No description available."}
                  </p>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <span className="font-medium">{opening.moves.length}</span> moves
                      </span>
                      {opening.variations && opening.variations.length > 0 && (
                        <span className="flex items-center gap-1">
                          <span className="font-medium">{opening.variations.length}</span> variations
                        </span>
                      )}
                    </div>
                  </div>

                  {opening.themes && opening.themes.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {opening.themes.slice(0, 3).map((theme) => (
                        <Badge key={theme} variant="secondary" className="text-xs">
                          {theme}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
