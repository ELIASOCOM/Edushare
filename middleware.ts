import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protected routes that require authentication
  const protectedRoutes = ["/upload", "/profile", "/favorites", "/settings", "/admin"]
  const isProtectedRoute = protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route))

  // If accessing a protected route without authentication, redirect to login
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL("/auth/login", req.url)
    redirectUrl.searchParams.set("redirectTo", req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Special handling for admin routes
  if (req.nextUrl.pathname.startsWith("/admin") && session) {
    try {
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

      // If user is not admin, redirect to home
      if (profile?.role !== "admin") {
        return NextResponse.redirect(new URL("/", req.url))
      }
    } catch (error) {
      console.error("Error checking admin status:", error)
      return NextResponse.redirect(new URL("/", req.url))
    }
  }

  // If accessing auth pages while authenticated, redirect to home
  if (req.nextUrl.pathname.startsWith("/auth") && session) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  return res
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
