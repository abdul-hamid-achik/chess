"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GraduationCap } from "lucide-react"
import { OpeningBrowser } from "@/components/features/learn/opening-browser"
import { UserRepertoire } from "@/components/features/learn/user-repertoire"
import { getUserOpenings, getOpeningStats } from "@/lib/actions/openings"
import { useRouter } from "next/navigation"

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

export default function LearnPage() {
  const router = useRouter()
  const [userRepertoireIds, setUserRepertoireIds] = useState<string[]>([])
  const [repertoireRefresh] = useState(0)
  const [stats, setStats] = useState({
    totalOpenings: 0,
    whiteOpenings: 0,
    blackOpenings: 0,
  })

  useEffect(() => {
    loadUserRepertoire()
    loadStats()
  }, [repertoireRefresh])

  const loadUserRepertoire = async () => {
    const result = await getUserOpenings()
    if (result.success && result.openings) {
      const ids = result.openings.map((o) => o.openingId)
      setUserRepertoireIds(ids)
    }
  }

  const loadStats = async () => {
    const result = await getOpeningStats()
    if (result.success && result.stats) {
      setStats({
        totalOpenings: result.stats.totalOpenings,
        whiteOpenings: result.stats.whiteOpenings,
        blackOpenings: result.stats.blackOpenings,
      })
    }
  }

  const handleOpeningClick = (opening: Pick<Opening, "id">) => {
    // Navigate to detail page
    router.push(`/learn/${opening.id}`)
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">Learn Chess</h1>
              <p className="text-sm text-muted-foreground">Master openings and build your repertoire</p>
            </div>
          </div>

          {/* Stats Summary */}
          {stats.totalOpenings > 0 && (
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{stats.totalOpenings}</div>
                    <div className="text-xs text-muted-foreground">In Repertoire</div>
                  </div>
                  <div className="h-10 w-px bg-border" />
                  <div className="flex gap-3 text-sm">
                    <div className="flex flex-col items-center">
                      <span className="font-semibold">{stats.whiteOpenings}</span>
                      <span className="text-xs text-muted-foreground">White</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="font-semibold">{stats.blackOpenings}</span>
                      <span className="text-xs text-muted-foreground">Black</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Full Width Layout */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="browse" className="h-full flex flex-col">
          <div className="border-b px-6 pt-4 pb-3">
            <TabsList className="grid w-full max-w-md grid-cols-2 h-10">
              <TabsTrigger value="browse" className="text-sm">Browse All</TabsTrigger>
              <TabsTrigger value="repertoire" className="text-sm">
                My Repertoire {stats.totalOpenings > 0 && `(${stats.totalOpenings})`}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="browse" className="flex-1 px-4 py-4 mt-0 overflow-y-auto">
            <div className="mx-auto max-w-[1920px]">
              <OpeningBrowser
                onOpeningClick={handleOpeningClick}
                userRepertoireIds={userRepertoireIds}
              />
            </div>
          </TabsContent>

          <TabsContent value="repertoire" className="flex-1 px-4 py-4 mt-0 overflow-y-auto">
            <div className="mx-auto max-w-[1920px]">
              <UserRepertoire
                onOpeningClick={handleOpeningClick}
                refreshTrigger={repertoireRefresh}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
