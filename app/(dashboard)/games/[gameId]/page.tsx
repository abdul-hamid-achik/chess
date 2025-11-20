import { auth } from "@/lib/auth/config"
import { getGameById } from "@/lib/actions/games"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GameReplay } from "@/components/features/game/game-replay"
import { formatDistanceToNow } from "date-fns"
import { Trophy, Clock, Target, Flag } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default async function GameViewerPage({
  params,
}: {
  params: Promise<{ gameId: string }>
}) {
  const session = await auth()
  const { gameId } = await params

  if (!session?.user) {
    redirect("/sign-in")
  }

  const gameResponse = await getGameById(gameId)

  if (gameResponse.error || !gameResponse.game) {
    notFound()
  }

  const game = gameResponse.game

  const resultBadge = {
    win: { variant: "default" as const, text: "Victory", class: "bg-green-600 hover:bg-green-700" },
    loss: { variant: "destructive" as const, text: "Defeat", class: "" },
    draw: { variant: "secondary" as const, text: "Draw", class: "" },
  }[game.result as "win" | "loss" | "draw"]

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/profile">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Game Replay</h1>
            <p className="text-muted-foreground">
              Played {formatDistanceToNow(new Date(game.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <GameReplay
              moves={game.moves}
              playerColor={game.playerColor as "w" | "b"}
            />
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Game Result</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Result</span>
                  <Badge className={resultBadge.class} variant={resultBadge.variant}>
                    {resultBadge.text}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Reason</span>
                  <span className="text-sm text-muted-foreground">{game.endReason}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Game Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Target className="w-4 h-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Opponent</p>
                    <p className="text-sm text-muted-foreground">
                      Bot ({game.difficulty})
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Time Control</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {game.timeControl}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Flag className="w-4 h-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Your Color</p>
                    <p className="text-sm text-muted-foreground">
                      {game.playerColor === "w" ? "White" : "Black"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Trophy className="w-4 h-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Total Moves</p>
                    <p className="text-sm text-muted-foreground">
                      {game.moves.length} moves
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>PGN</CardTitle>
                <CardDescription>Portable Game Notation</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted p-3 rounded overflow-x-auto whitespace-pre-wrap">
                  {game.pgn}
                </pre>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
