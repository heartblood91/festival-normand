import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("next-intl/middleware", () => ({
  default: () => (request: { nextUrl: { pathname: string } }) => {
    const { NextResponse } = require("next/server")
    const response = NextResponse.next()
    response.headers.set("x-middleware-rewrite", request.nextUrl.pathname)
    return response
  },
}))

vi.mock("better-auth/cookies", () => ({
  getSessionCookie: vi.fn(),
}))

vi.mock("@/lib/i18n/config", () => ({
  locales: ["fr", "en"],
  defaultLocale: "fr",
}))

import { middleware } from "./middleware"
import { getSessionCookie } from "better-auth/cookies"
import { NextRequest } from "next/server"

const mockGetSessionCookie = vi.mocked(getSessionCookie)

const createRequest = (path: string) => new NextRequest(new URL(path, "http://localhost:3010"))

describe("admin route middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("redirects to login when no session cookie on /fr/admin", () => {
    mockGetSessionCookie.mockReturnValue(null)

    const response = middleware(createRequest("/fr/admin"))

    expect(response.status).toBe(307)
    expect(response.headers.get("location")).toContain("/fr/admin/login")
  })

  it("redirects to login when no session cookie on /fr/admin/events", () => {
    mockGetSessionCookie.mockReturnValue(null)

    const response = middleware(createRequest("/fr/admin/events"))

    expect(response.status).toBe(307)
    expect(response.headers.get("location")).toContain("/fr/admin/login")
  })

  it("allows access to /fr/admin/login without session", () => {
    mockGetSessionCookie.mockReturnValue(null)

    const response = middleware(createRequest("/fr/admin/login"))

    expect(response.status).toBe(200)
  })

  it("allows access to /api/auth routes without session", () => {
    mockGetSessionCookie.mockReturnValue(null)

    const response = middleware(createRequest("/api/auth/sign-in/magic-link"))

    expect(response.status).toBe(200)
  })

  it("allows access to /fr/admin when session cookie exists", () => {
    mockGetSessionCookie.mockReturnValue("valid-session-token")

    const response = middleware(createRequest("/fr/admin"))

    expect(response.status).toBe(200)
  })

  it("allows access to /en/admin/events when session cookie exists", () => {
    mockGetSessionCookie.mockReturnValue("valid-session-token")

    const response = middleware(createRequest("/en/admin/events"))

    expect(response.status).toBe(200)
  })
})
