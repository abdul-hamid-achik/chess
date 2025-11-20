"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GraduationCap } from "lucide-react"
import { OpeningBrowser } from "@/components/features/learn/opening-browser"
import { OpeningDetail } from "@/components/features/learn/opening-detail"
import { UserRepertoire } from "@/components/features/learn/user-repertoire"
import { getUserOpenings, getOpeningStats } from "@/lib/actions/openings"

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

export default function LearnPage() {
  const [selectedOpening, setSelectedOpening] = useState<Opening | null>(null)
  const [openDetailDialog, setOpenDetailDialog] = useState(false)
  const [userRepertoireIds, setUserRepertoireIds] = useState<string[]>([])
  const [repertoireRefresh, setRepertoireRefresh] = useState(0)
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

  const handleSelectOpening = (opening: Opening) => {
    setSelectedOpening(opening)
    setOpenDetailDialog(true)
  }

  const handleRepertoireChange = () => {
    setRepertoireRefresh((prev) => prev + 1)
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-8 w-8" />
            <div>
              <h1 className="text-3xl font-bold">Learn Chess</h1>
              <p className="text-muted-foreground">Master openings and improve your game</p>
            </div>
          </div>

          {/* Stats Summary */}
          {stats.totalOpenings > 0 && (
            <Card className="min-w-[200px]">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.totalOpenings}</div>
                  <div className="text-xs text-muted-foreground">
                    Openings in Repertoire
                  </div>
                  <div className="flex justify-center gap-4 mt-2 text-xs">
                    <span>⚪ {stats.whiteOpenings}</span>
                    <span>⚫ {stats.blackOpenings}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="browse" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="browse">Browse Openings</TabsTrigger>
            <TabsTrigger value="repertoire">
              My Repertoire {stats.totalOpenings > 0 && `(${stats.totalOpenings})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Opening Library</CardTitle>
                <CardDescription>
                  Explore 70+ chess openings and add them to your repertoire
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OpeningBrowser
                  onSelectOpening={handleSelectOpening}
                  userRepertoireIds={userRepertoireIds}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="repertoire" className="mt-6">
            <UserRepertoire
              onOpeningClick={handleSelectOpening}
              refreshTrigger={repertoireRefresh}
            />
          </TabsContent>
        </Tabs>

        {/* Opening Detail Dialog */}
        <OpeningDetail
          opening={selectedOpening}
          open={openDetailDialog}
          onOpenChange={setOpenDetailDialog}
          onRepertoireChange={handleRepertoireChange}
        />
      </div>
    </div>
  )
}
