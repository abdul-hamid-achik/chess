"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award } from "lucide-react"

interface LeaderboardPlayer {
  rank: number
  id: string
  name: string | null
  email: string
  rating: number
  gamesPlayed: number
  wins: number
  losses: number
  draws: number
  winRate: number
}

interface LeaderboardTableProps {
  players: LeaderboardPlayer[]
  currentUserId?: string
}

export function LeaderboardTable({ players, currentUserId }: LeaderboardTableProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />
      default:
        return <span className="text-muted-foreground font-semibold">{rank}</span>
    }
  }

  const getRatingBadge = (rating: number) => {
    if (rating >= 2400) return { label: "Master", variant: "default" as const }
    if (rating >= 2200) return { label: "Expert", variant: "secondary" as const }
    if (rating >= 2000) return { label: "Advanced", variant: "outline" as const }
    if (rating >= 1800) return { label: "Intermediate", variant: "outline" as const }
    return { label: "Beginner", variant: "outline" as const }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-3xl flex items-center gap-2">
          <Trophy className="w-8 h-8 text-yellow-500" />
          Leaderboard
        </CardTitle>
        <CardDescription>Top players ranked by ELO rating</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16 text-center">Rank</TableHead>
                <TableHead>Player</TableHead>
                <TableHead className="text-center">Rating</TableHead>
                <TableHead className="text-center">Games</TableHead>
                <TableHead className="text-center">Win Rate</TableHead>
                <TableHead className="text-center">W / L / D</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {players.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No players yet. Be the first to play!
                  </TableCell>
                </TableRow>
              ) : (
                players.map((player) => {
                  const isCurrentUser = currentUserId === player.id
                  const ratingBadge = getRatingBadge(player.rating)

                  return (
                    <TableRow
                      key={player.id}
                      className={isCurrentUser ? "bg-accent/50 font-semibold" : ""}
                    >
                      <TableCell className="text-center">{getRankIcon(player.rank)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{player.name || player.email}</span>
                          {isCurrentUser && (
                            <Badge variant="default" className="text-xs">
                              You
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-bold text-lg">{player.rating}</span>
                          <Badge variant={ratingBadge.variant} className="text-xs">
                            {ratingBadge.label}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{player.gamesPlayed}</TableCell>
                      <TableCell className="text-center">
                        {player.gamesPlayed > 0 ? (
                          <span
                            className={
                              player.winRate >= 60
                                ? "text-green-600 font-semibold"
                                : player.winRate >= 40
                                ? "text-yellow-600"
                                : "text-red-600"
                            }
                          >
                            {player.winRate}%
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        {player.gamesPlayed > 0 ? (
                          <span className="text-muted-foreground">
                            <span className="text-green-600 font-semibold">{player.wins}</span> /{" "}
                            <span className="text-red-600 font-semibold">{player.losses}</span> /{" "}
                            <span className="text-gray-600">{player.draws}</span>
                          </span>
                        ) : (
                          <span className="text-muted-foreground">- / - / -</span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
