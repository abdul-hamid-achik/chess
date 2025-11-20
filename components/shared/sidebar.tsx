import type React from "react"
import Link from "next/link"
import { Home, Puzzle, GraduationCap, User, BarChart3, LogIn, UserPlus } from "lucide-react"
import { cn } from "@/lib/utils"
import { auth } from "@/lib/auth/config"

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

      <div className="px-3 py-2 space-y-1">
        {session ? (
          <Link href="/profile">
            <button className="w-full flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors justify-start">
              <User className="h-5 w-5" />
              Profile
            </button>
          </Link>
        ) : (
          <>
            <Link href="/sign-in">
              <button className="w-full flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors justify-start">
                <LogIn className="h-5 w-5" />
                Sign In
              </button>
            </Link>
            <Link href="/sign-up">
              <button className="w-full flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors justify-start">
                <UserPlus className="h-5 w-5" />
                Sign Up
              </button>
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
