import { describe, it, expect, vi, beforeEach } from "vitest"

const { prismaMock } = vi.hoisted(() => {
  const mockMethods = () => ({
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
    count: vi.fn(),
    upsert: vi.fn(),
    updateMany: vi.fn(),
  })

  return {
    prismaMock: {
      event: mockMethods(),
      news: mockMethods(),
      partner: mockMethods(),
      page: mockMethods(),
      adminUser: mockMethods(),
      user: mockMethods(),
      session: mockMethods(),
      account: mockMethods(),
      verification: mockMethods(),
      $connect: vi.fn(),
      $disconnect: vi.fn(),
      $transaction: vi.fn(),
    },
  }
})

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }))

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: vi.fn().mockResolvedValue({ id: "test-id" }) }
  },
}))

import { auth } from "./auth"

describe("auth admin restriction hook", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("blocks sign-in for non-registered emails", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null)

    const response = await auth.api.signInMagicLink({
      body: { email: "hacker@evil.com" },
      headers: new Headers(),
    }).catch((e: Error) => e)

    expect(response).toBeInstanceOf(Error)
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { email: "hacker@evil.com" },
      select: { role: true },
    })
  })

  it("allows sign-in for registered users", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      role: "ADMIN",
    })

    const response = await auth.api.signInMagicLink({
      body: { email: "admin@pierresenlumieres.fr" },
      headers: new Headers(),
    }).catch((e: Error) => e)

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { email: "admin@pierresenlumieres.fr" },
      select: { role: true },
    })

    // If it gets past the hook, the error should NOT be about authorization
    if (response instanceof Error) {
      expect(response.message).not.toContain("not authorized")
    }
  })
})
