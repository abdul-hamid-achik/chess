"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Gamepad2 } from "lucide-react"
import type { Game } from "@/lib/db/schema"

interface GameListProps {
  games: Game[]
}

export function GameList({ games }: GameListProps) {
  if (games.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Gamepad2 className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-lg font-medium mb-2">No games played yet</p>
        <p className="text-sm text-muted-foreground mb-4">
          Start playing to see your game history here
        </p>
        <Button asChild>
          <Link href="/play">Play a Game</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {games.map((game) => {
        const resultBadge = {
          win: { variant: "default" as const, text: "Won", class: "bg-green-600 hover:bg-green-700" },
          loss: { variant: "destructive" as const, text: "Lost", class: "" },
          draw: { variant: "secondary" as const, text: "Draw", class: "" },
        }[game.result] ?? { variant: "secondary" as const, text: game.result, class: "" }

        return (
          <Link key={game.id} href={`/games/${game.id}`}>
            <Card className="hover:bg-accent transition-colors cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <Badge className={resultBadge.class} variant={resultBadge.variant}>
                          {resultBadge.text}
                        </Badge>
                        <span className="text-sm font-medium">vs Bot ({game.difficulty})</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <span>
                          {game.endReason}
                        </span>
                        <span>•</span>
                        <span className="capitalize">{game.timeControl}</span>
                        <span>•</span>
                        <span>{game.moves.length} moves</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(game.createdAt), { addSuffix: true })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
