"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getPuzzle, getUserPuzzleStats } from "@/lib/actions/puzzles"
import { PuzzleSolver } from "./puzzle-solver"
import { Trophy, Target, TrendingUp, Loader2 } from "lucide-react"
import type { Puzzle } from "@/lib/db/schema"

type Difficulty = "easy" | "medium" | "hard" | "all"

export function PuzzleTrainer() {
  const [currentPuzzle, setCurrentPuzzle] = useState<Puzzle | null>(null)
  const [difficulty, setDifficulty] = useState<Difficulty>("all")
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalPuzzles: 0,
    totalSolved: 0,
    totalAttempts: 0,
    accuracy: 0,
    rating: 800,
  })

  useEffect(() => {
    loadPuzzle()
    loadStats()
  }, [difficulty])

  const loadPuzzle = async () => {
    setLoading(true)
    const response = await getPuzzle(difficulty)

    if (response.success && response.puzzle) {
      setCurrentPuzzle(response.puzzle)
    }

    setLoading(false)
  }

  const loadStats = async () => {
    const response = await getUserPuzzleStats()

    if (response.success && response.stats) {
      setStats(response.stats)
    }
  }

  const handlePuzzleComplete = () => {
    // Load next puzzle and refresh stats
    loadPuzzle()
    loadStats()
  }

  const handleDifficultyChange = (newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Progress</CardTitle>
          <CardDescription>Track your puzzle solving statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Puzzles Solved</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalSolved}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalPuzzles} attempted
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.accuracy}%</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalAttempts} total attempts
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Puzzle Rating</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.rating}</div>
                <p className="text-xs text-muted-foreground">Estimated</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Difficulty</CardTitle>
                <Badge variant="outline">{difficulty}</Badge>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-1">
                  <Button
                    variant={difficulty === "easy" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleDifficultyChange("easy")}
                    className="w-full"
                  >
                    Easy
                  </Button>
                  <Button
                    variant={difficulty === "medium" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleDifficultyChange("medium")}
                    className="w-full"
                  >
                    Medium
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-4 flex gap-2">
            <Button
              variant={difficulty === "all" ? "default" : "outline"}
              onClick={() => handleDifficultyChange("all")}
            >
              All Levels
            </Button>
            <Button
              variant={difficulty === "hard" ? "default" : "outline"}
              onClick={() => handleDifficultyChange("hard")}
            >
              Hard
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Loading puzzle...</p>
            </div>
          </CardContent>
        </Card>
      ) : currentPuzzle ? (
        <PuzzleSolver puzzle={currentPuzzle} onPuzzleComplete={handlePuzzleComplete} />
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">
              No puzzles available for this difficulty. Try a different level!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
