import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // For debugging
  console.log("Middleware - Path:", request.nextUrl.pathname)
  console.log("Middleware - Cookies:", request.cookies.getAll())

  const authCookie = request.cookies.get("auth")?.value
  const accessToken = request.cookies.get("accessToken")?.value

  // Paths that don't require authentication
  const publicPaths = ["/login", "/api/login", "/api/auth"]
  if (publicPaths.some((path) => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Check if user is authenticated
  if (!authCookie || !accessToken) {
    console.log("Middleware - No auth/token, redirecting to login")
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}

