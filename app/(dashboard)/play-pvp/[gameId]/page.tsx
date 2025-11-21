import { auth } from "@/lib/auth/config"
import { redirect } from "next/navigation"
import { getGame } from "@/lib/actions/pvp-games"
import { PvPGame } from "@/components/features/game/pvp-game"

export default async function GamePage({
  params,
}: {
  params: Promise<{ gameId: string }>
}) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/sign-in")
  }

  const { gameId } = await params
  const result = await getGame(gameId)

  if (result.error || !result.game || !result.opponent) {
    redirect("/play-pvp")
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-8">PvP Game</h1>
      <PvPGame game={result.game} opponent={result.opponent} userId={session.user.id} />
    </div>
  )
}
