import type React from "react"
import Link from "next/link"
import { Home, Puzzle, GraduationCap, Settings, User, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  return (
    <div className={cn("pb-12 min-h-screen w-64 border-r bg-card", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="flex items-center gap-2 px-4 mb-6">
            <div className="w-8 h-8 bg-primary text-primary-foreground flex items-center justify-center rounded">♟</div>
            <h2 className="text-xl font-bold tracking-tight">ChessClone</h2>
          </div>
          <div className="space-y-1">
            <Link href="/play">
              <button className="w-full flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors justify-start">
                <Home className="h-5 w-5" />
                Play
              </button>
            </Link>
            <Link href="/puzzles">
              <button className="w-full flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors justify-start">
                <Puzzle className="h-5 w-5" />
                Puzzles
              </button>
            </Link>
            <Link href="/learn">
              <button className="w-full flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors justify-start">
                <GraduationCap className="h-5 w-5" />
                Learn
              </button>
            </Link>
            <Link href="/analysis">
              <button className="w-full flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors justify-start">
                <BarChart3 className="h-5 w-5" />
                Analysis
              </button>
            </Link>
          </div>
        </div>
      </div>
      <div className="absolute bottom-4 px-4 w-full space-y-1">
        <Link href="/profile">
          <button className="w-full flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors justify-start">
            <User className="h-5 w-5" />
            Profile
          </button>
        </Link>
      </div>
    </div>
  )
}
