"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { joinQueue, leaveQueue } from "@/lib/actions/matchmaking"
import { toast } from "sonner"
import { Loader2, Zap, Clock, Timer } from "lucide-react"

export function MatchmakingModal() {
  const [searching, setSearching] = useState(false)
  const router = useRouter()

  const handleJoinQueue = async (timeControl: "bullet" | "blitz" | "rapid") => {
    setSearching(true)
    const result = await joinQueue(timeControl)

    if (result.error) {
      toast.error(result.error)
      setSearching(false)
      return
    }

    if (result.matched && result.gameId) {
      toast.success("Match found!")
      router.push(`/play-pvp/${result.gameId}`)
      return
    }

    // Poll for match
    const pollInterval = setInterval(async () => {
      const checkResult = await joinQueue(timeControl)
      if (checkResult.matched && checkResult.gameId) {
        clearInterval(pollInterval)
        toast.success("Match found!")
        router.push(`/play-pvp/${checkResult.gameId}`)
      }
    }, 2000)

    // Timeout after 60 seconds
    setTimeout(async () => {
      clearInterval(pollInterval)
      setSearching(false)
      await leaveQueue()
      toast.error("No opponent found. Try again!")
    }, 60000)
  }

  const handleCancelSearch = async () => {
    await leaveQueue()
    setSearching(false)
    toast.info("Search cancelled")
  }

  if (searching) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="p-12 text-center">
          <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-xl font-semibold mb-2">Searching for opponent...</p>
          <p className="text-sm text-muted-foreground mb-6">
            This may take up to 60 seconds
          </p>
          <Button onClick={handleCancelSearch} variant="outline">
            Cancel Search
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Play Online</CardTitle>
          <CardDescription>
            Choose your time control and find an opponent
          </CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:border-primary transition" onClick={() => handleJoinQueue("bullet")}>
            <CardContent className="p-6 text-center">
              <Zap className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
              <h3 className="text-xl font-bold mb-2">Bullet</h3>
              <p className="text-sm text-muted-foreground mb-2">1 minute</p>
              <p className="text-xs text-muted-foreground">Fast-paced games for quick thinking</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:border-primary transition" onClick={() => handleJoinQueue("blitz")}>
            <CardContent className="p-6 text-center">
              <Clock className="w-12 h-12 mx-auto mb-4 text-blue-500" />
              <h3 className="text-xl font-bold mb-2">Blitz</h3>
              <p className="text-sm text-muted-foreground mb-2">5 minutes</p>
              <p className="text-xs text-muted-foreground">Balanced games with time to think</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:border-primary transition" onClick={() => handleJoinQueue("rapid")}>
            <CardContent className="p-6 text-center">
              <Timer className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <h3 className="text-xl font-bold mb-2">Rapid</h3>
              <p className="text-sm text-muted-foreground mb-2">10 minutes</p>
              <p className="text-xs text-muted-foreground">More time for strategic play</p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}
