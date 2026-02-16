"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Brain } from "lucide-react"
import { GameListForAnalysis } from "@/components/features/analysis/game-list-for-analysis"
import { getAnalyzableGames, getUnanalyzedGames, getAnalyzedGames } from "@/lib/actions/analysis"
import type { GameWithAnalysis } from "@/types/analysis"

export default function AnalysisPage() {
  const [allGames, setAllGames] = useState<GameWithAnalysis[]>([])
  const [analyzedGames, setAnalyzedGames] = useState<GameWithAnalysis[]>([])
  const [unanalyzedGames, setUnanalyzedGames] = useState<GameWithAnalysis[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshTrigger, _setRefreshTrigger] = useState(0)

  useEffect(() => {
    loadGames()
  }, [refreshTrigger])

  const loadGames = async () => {
    setLoading(true)
    try {
      const [allResult, analyzedResult, unanalyzedResult] = await Promise.all([
        getAnalyzableGames(),
        getAnalyzedGames(),
        getUnanalyzedGames(),
      ])

      if (allResult.success && allResult.games) {
        setAllGames(allResult.games)
      }

      if (analyzedResult.success && analyzedResult.games) {
        setAnalyzedGames(analyzedResult.games)
      }

      if (unanalyzedResult.success && unanalyzedResult.games) {
        setUnanalyzedGames(unanalyzedResult.games)
      }
    } catch (error) {
      console.error("Error loading games:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="h-8 w-8" />
            <div>
              <h1 className="text-3xl font-bold">Game Analysis</h1>
              <p className="text-muted-foreground">
                Analyze your games with Chess-API.com powered engine
              </p>
            </div>
          </div>

          {/* Stats Summary */}
          {!loading && allGames.length > 0 && (
            <Card className="min-w-[200px]">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{allGames.length}</div>
                  <div className="text-xs text-muted-foreground">Total Games</div>
                  <div className="flex justify-center gap-4 mt-2 text-xs">
                    <span className="text-green-500">✓ {analyzedGames.length} analyzed</span>
                    <span className="text-muted-foreground">
                      • {unanalyzedGames.length} to analyze
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="all">
              All Games {allGames.length > 0 && `(${allGames.length})`}
            </TabsTrigger>
            <TabsTrigger value="to-analyze">
              To Analyze {unanalyzedGames.length > 0 && `(${unanalyzedGames.length})`}
            </TabsTrigger>
            <TabsTrigger value="analyzed">
              Analyzed {analyzedGames.length > 0 && `(${analyzedGames.length})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <GameListForAnalysis
              games={allGames}
              loading={loading}

            />
          </TabsContent>

          <TabsContent value="to-analyze" className="mt-6">
            {!loading && unanalyzedGames.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center h-64">
                  <Brain className="h-12 w-12 text-green-500 mb-4" />
                  <p className="text-lg font-medium mb-2">All games analyzed!</p>
                  <p className="text-sm text-muted-foreground text-center">
                    Play more games to analyze them
                  </p>
                </CardContent>
              </Card>
            ) : (
              <GameListForAnalysis
                games={unanalyzedGames}
                loading={loading}
  
              />
            )}
          </TabsContent>

          <TabsContent value="analyzed" className="mt-6">
            {!loading && analyzedGames.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center h-64">
                  <Brain className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">No analyzed games yet</p>
                  <p className="text-sm text-muted-foreground text-center">
                    Analyze some games to see detailed breakdowns
                  </p>
                </CardContent>
              </Card>
            ) : (
              <GameListForAnalysis
                games={analyzedGames}
                loading={loading}
  
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
