"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, Home, Puzzle, GraduationCap, User, BarChart3, LogIn, UserPlus, Users, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

interface MobileNavProps {
  isAuthenticated: boolean
}

const navItems = [
  { href: "/play", label: "Play", icon: Home },
  { href: "/play-pvp", label: "Play Online", icon: Users },
  { href: "/puzzles", label: "Puzzles", icon: Puzzle },
  { href: "/learn", label: "Learn", icon: GraduationCap },
  { href: "/analysis", label: "Analysis", icon: BarChart3 },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
]

export function MobileNav({ isAuthenticated }: MobileNavProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-card border-b px-4 py-3 flex items-center gap-3">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="px-6 pt-6 pb-2">
            <SheetTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary text-primary-foreground flex items-center justify-center rounded">
                ♟
              </div>
              Chess
            </SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-1 px-3 py-2">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} onClick={() => setOpen(false)}>
                <button
                  className={cn(
                    "w-full flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors justify-start",
                    pathname === href || pathname.startsWith(href + "/")
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </button>
              </Link>
            ))}
          </nav>
          <div className="mt-auto px-3 py-4 border-t space-y-1">
            {isAuthenticated ? (
              <Link href="/profile" onClick={() => setOpen(false)}>
                <button
                  className={cn(
                    "w-full flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors justify-start",
                    pathname === "/profile"
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <User className="h-5 w-5" />
                  Profile
                </button>
              </Link>
            ) : (
              <>
                <Link href="/sign-in" onClick={() => setOpen(false)}>
                  <button className="w-full flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors justify-start">
                    <LogIn className="h-5 w-5" />
                    Sign In
                  </button>
                </Link>
                <Link href="/sign-up" onClick={() => setOpen(false)}>
                  <button className="w-full flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors justify-start">
                    <UserPlus className="h-5 w-5" />
                    Sign Up
                  </button>
                </Link>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-primary text-primary-foreground flex items-center justify-center rounded text-xs">
          ♟
        </div>
        <span className="font-bold">Chess</span>
      </div>
    </div>
  )
}
