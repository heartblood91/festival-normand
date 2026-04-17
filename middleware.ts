import createMiddleware from "next-intl/middleware"
import { NextRequest, NextResponse } from "next/server"

const locales = ["fr", "en"] as const
const defaultLocale = "fr"

const SESSION_COOKIE_NAMES = [
  "better-auth.session_token",
  "__Secure-better-auth.session_token",
]

const hasSessionCookie = (request: NextRequest): boolean =>
  SESSION_COOKIE_NAMES.some((name) => request.cookies.has(name))

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
})

export const middleware = (request: NextRequest) => {
  const { pathname } = request.nextUrl

  // Skip static assets and API routes
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/images/") ||
    pathname.startsWith("/videos/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  // Run i18n middleware first (handles locale detection + redirect)
  const response = intlMiddleware(request)

  // After i18n redirect, check admin auth
  const resolvedPathname = response.headers.get("x-middleware-rewrite") || request.nextUrl.pathname

  // Extract locale-prefixed admin path
  const adminMatch = resolvedPathname.match(/^\/(fr|en)\/admin/)
  if (adminMatch) {
    const locale = adminMatch[1]
    const isLoginPage = resolvedPathname === `/${locale}/admin/login`

    if (!isLoginPage) {
      if (!hasSessionCookie(request)) {
        const loginUrl = new URL(`/${locale}/admin/login`, request.url)
        loginUrl.searchParams.set("callbackUrl", pathname)
        return NextResponse.redirect(loginUrl)
      }
    }
  }

  return response
}

export const config = {
  matcher: ["/((?!api|_next|images|videos|.*\\..*).*)"],
}
