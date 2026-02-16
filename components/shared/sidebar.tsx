import type React from "react"
import { Home, Puzzle, GraduationCap, User, BarChart3, LogIn, UserPlus, Users, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"
import { auth } from "@/lib/auth/config"
import { NavLink } from "./nav-links"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export async function Sidebar({ className }: SidebarProps) {
  const session = await auth()

  return (
    <div className={cn("pb-4 min-h-screen w-64 border-r bg-card flex flex-col", className)}>
      <div className="space-y-4 py-4 flex-1">
        <div className="px-3 py-2">
          <div className="flex items-center gap-2 px-4 mb-6">
            <div className="w-8 h-8 bg-primary text-primary-foreground flex items-center justify-center rounded">
              ♟
            </div>
            <h2 className="text-xl font-bold tracking-tight">Chess</h2>
          </div>
          <div className="space-y-1">
            <NavLink href="/play" label="Play" icon={Home} />
            <NavLink href="/play-pvp" label="Play Online" icon={Users} />
            <NavLink href="/puzzles" label="Puzzles" icon={Puzzle} />
            <NavLink href="/learn" label="Learn" icon={GraduationCap} />
            <NavLink href="/analysis" label="Analysis" icon={BarChart3} />
            <NavLink href="/leaderboard" label="Leaderboard" icon={Trophy} />
          </div>
        </div>
      </div>

      <div className="px-3 py-2 space-y-1">
        {session ? (
          <NavLink href="/profile" label="Profile" icon={User} />
        ) : (
          <>
            <NavLink href="/sign-in" label="Sign In" icon={LogIn} />
            <NavLink href="/sign-up" label="Sign Up" icon={UserPlus} />
          </>
        )}
      </div>
    </div>
  )
}
