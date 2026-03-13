import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("better-auth/cookies", () => ({
  getSessionCookie: vi.fn(),
}))

import { middleware } from "./middleware"
import { getSessionCookie } from "better-auth/cookies"
import { NextRequest } from "next/server"

const mockGetSessionCookie = vi.mocked(getSessionCookie)

const createRequest = (path: string) => {
  return new NextRequest(new URL(path, "http://localhost:3010"))
}

describe("admin route middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("redirects to login when no session cookie on /admin", () => {
    mockGetSessionCookie.mockReturnValue(null)

    const response = middleware(createRequest("/admin"))

    expect(response.status).toBe(307)
    expect(response.headers.get("location")).toContain("/admin/login")
    expect(response.headers.get("location")).toContain("callbackUrl=%2Fadmin")
  })

  it("redirects to login when no session cookie on /admin/events", () => {
    mockGetSessionCookie.mockReturnValue(null)

    const response = middleware(createRequest("/admin/events"))

    expect(response.status).toBe(307)
    expect(response.headers.get("location")).toContain("/admin/login")
    expect(response.headers.get("location")).toContain("callbackUrl=%2Fadmin%2Fevents")
  })

  it("allows access to /admin/login without session", () => {
    mockGetSessionCookie.mockReturnValue(null)

    const response = middleware(createRequest("/admin/login"))

    expect(response.status).toBe(200)
  })

  it("allows access to /api/auth routes without session", () => {
    mockGetSessionCookie.mockReturnValue(null)

    const response = middleware(createRequest("/api/auth/sign-in/magic-link"))

    expect(response.status).toBe(200)
  })

  it("allows access to /admin when session cookie exists", () => {
    mockGetSessionCookie.mockReturnValue("valid-session-token")

    const response = middleware(createRequest("/admin"))

    expect(response.status).toBe(200)
  })

  it("allows access to /admin/events when session cookie exists", () => {
    mockGetSessionCookie.mockReturnValue("valid-session-token")

    const response = middleware(createRequest("/admin/events"))

    expect(response.status).toBe(200)
  })
})
