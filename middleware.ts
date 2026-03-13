import { NextRequest, NextResponse } from "next/server"
import { getSessionCookie } from "better-auth/cookies"

export const middleware = (request: NextRequest) => {
  const { pathname } = request.nextUrl

  // Allow access to login page and auth API routes
  if (pathname === "/admin/login" || pathname.startsWith("/api/auth")) {
    return NextResponse.next()
  }

  // Protect all /admin routes
  const sessionCookie = getSessionCookie(request)

  if (!sessionCookie) {
    const loginUrl = new URL("/admin/login", request.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
