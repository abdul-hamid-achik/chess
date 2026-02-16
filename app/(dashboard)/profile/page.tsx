import { auth } from "@/lib/auth/config"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Trophy, Target, TrendingUp } from "lucide-react"
import { redirect } from "next/navigation"
import { getUserGames, getUserStats } from "@/lib/actions/games"
import { getUserPuzzleStats } from "@/lib/actions/puzzles"
import { GameList } from "@/components/features/profile/game-list"
import { StatisticsSection } from "@/components/features/profile/statistics-section"

export default async function ProfilePage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/sign-in")
  }

  const { user } = session

  // Fetch user's games and stats
  const gamesResponse = await getUserGames(10)
  const statsResponse = await getUserStats()
  const puzzleStatsResponse = await getUserPuzzleStats()

  const games = gamesResponse.success ? gamesResponse.games : []
  const stats = statsResponse.success ? statsResponse.stats : {
    totalGames: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    winRate: 0
  }
  const puzzleStats = puzzleStatsResponse.success ? puzzleStatsResponse.stats : {
    totalPuzzles: 0,
    totalSolved: 0,
    totalAttempts: 0,
    accuracy: 0,
    rating: 800
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary text-primary-foreground flex items-center justify-center rounded-full text-2xl">
            {user.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{user.name}</h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rating</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.rating}</div>
              <p className="text-xs text-muted-foreground">Current rating</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Games Played</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalGames}</div>
              <p className="text-xs text-muted-foreground">
                {stats.wins}W / {stats.losses}L / {stats.draws}D
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.winRate}%</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Puzzles Solved</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{puzzleStats.totalSolved}</div>
              <p className="text-xs text-muted-foreground">
                {puzzleStats.accuracy}% accuracy • {puzzleStats.rating} rating
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Games</CardTitle>
            <CardDescription>Your last 10 games</CardDescription>
          </CardHeader>
          <CardContent>
            <GameList games={games} />
          </CardContent>
        </Card>

        <StatisticsSection />
      </div>
    </div>
  )
}
