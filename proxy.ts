import { auth } from "@/lib/auth/config"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  const isAuthPage = nextUrl.pathname.startsWith("/sign-in") || nextUrl.pathname.startsWith("/sign-up")
  const isProtectedPage =
    nextUrl.pathname.startsWith("/play") ||
    nextUrl.pathname.startsWith("/puzzles") ||
    nextUrl.pathname.startsWith("/learn") ||
    nextUrl.pathname.startsWith("/profile") ||
    nextUrl.pathname.startsWith("/analysis")

  if (isAuthPage) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/play", nextUrl))
    }
    return NextResponse.next()
  }

  if (isProtectedPage && !isLoggedIn) {
    return NextResponse.redirect(new URL("/sign-in", nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
