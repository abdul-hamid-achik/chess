import { auth } from "@/lib/auth/config"
import { redirect } from "next/navigation"
import { MatchmakingModal } from "@/components/features/matchmaking/matchmaking-modal"

export default async function PlayPvPPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/sign-in")
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <MatchmakingModal />
    </div>
  )
}
