import { auth } from "@/lib/auth/config"
import { redirect } from "next/navigation"
import { getLeaderboard, getUserRank } from "@/lib/actions/leaderboard"
import { LeaderboardTable } from "@/components/features/leaderboard/leaderboard-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Award, Target } from "lucide-react"

export default async function LeaderboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/sign-in")
  }

  const leaderboardResult = await getLeaderboard(100)

  if (leaderboardResult.error || !leaderboardResult.leaderboard) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <p className="text-center text-muted-foreground">Failed to load leaderboard</p>
      </div>
    )
  }

  const userRankResult = await getUserRank(session.user.id)

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">Leaderboard</h1>
        <p className="text-muted-foreground">
          Compete with players worldwide and climb the ranks
        </p>
      </div>

      {userRankResult.success && userRankResult.stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Rank</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">#{userRankResult.rank}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Rating: {userRankResult.rating}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Games Played</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{userRankResult.stats.gamesPlayed}</div>
              <div className="text-xs text-muted-foreground mt-1 space-x-1">
                <span className="text-green-600">{userRankResult.stats.wins}W</span>
                <span className="text-red-600">{userRankResult.stats.losses}L</span>
                <span className="text-gray-600">{userRankResult.stats.draws}D</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {userRankResult.stats.winRate}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {userRankResult.stats.gamesPlayed > 0
                  ? "Based on completed games"
                  : "Play games to track"}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <LeaderboardTable
        players={leaderboardResult.leaderboard}
        currentUserId={session.user.id}
      />
    </div>
  )
}
