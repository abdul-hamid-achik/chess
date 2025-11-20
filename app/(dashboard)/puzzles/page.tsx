import { auth } from "@/lib/auth/config"
import { redirect } from "next/navigation"
import { Puzzle } from "lucide-react"
import { PuzzleTrainer } from "@/components/features/puzzles/puzzle-trainer"

export default async function PuzzlesPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/sign-in")
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Puzzle className="h-8 w-8" />
          <div>
            <h1 className="text-3xl font-bold">Chess Puzzles</h1>
            <p className="text-muted-foreground">
              Solve tactical puzzles to improve your chess skills
            </p>
          </div>
        </div>

        <PuzzleTrainer />
      </div>
    </div>
  )
}
