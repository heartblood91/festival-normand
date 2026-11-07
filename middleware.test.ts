import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("next-intl/middleware", () => ({
  default: () => (request: { nextUrl: { pathname: string } }) => {
    const { NextResponse } = require("next/server")
    const response = NextResponse.next()
    response.headers.set("x-middleware-rewrite", request.nextUrl.pathname)
    return response
  },
}))

vi.mock("@/lib/i18n/config", () => ({
  locales: ["fr", "en"],
  defaultLocale: "fr",
}))

import { middleware } from "./middleware"
import { NextRequest } from "next/server"

const createRequest = (path: string, sessionCookie?: string) => {
  const request = new NextRequest(new URL(path, "http://localhost:3010"))
  if (sessionCookie) request.cookies.set(sessionCookie, "valid-session-token")
  return request
}

describe("admin route middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("redirects to login when no session cookie on /fr/admin", () => {
    const response = middleware(createRequest("/fr/admin"))

    expect(response.status).toBe(307)
    expect(response.headers.get("location")).toContain("/fr/admin/login")
  })

  it("redirects to login when no session cookie on /fr/admin/events", () => {
    const response = middleware(createRequest("/fr/admin/events"))

    expect(response.status).toBe(307)
    expect(response.headers.get("location")).toContain("/fr/admin/login")
  })

  it("allows access to /fr/admin/login without session", () => {
    const response = middleware(createRequest("/fr/admin/login"))

    expect(response.status).toBe(200)
  })

  it("allows access to /api/auth routes without session", () => {
    const response = middleware(createRequest("/api/auth/sign-in/magic-link"))

    expect(response.status).toBe(200)
  })

  it("allows access to /fr/admin when session cookie exists", () => {
    const response = middleware(createRequest("/fr/admin", "better-auth.session_token"))

    expect(response.status).toBe(200)
  })

  it("allows access to /en/admin/events with the secure session cookie", () => {
    const response = middleware(createRequest("/en/admin/events", "__Secure-better-auth.session_token"))

    expect(response.status).toBe(200)
  })
})
