import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@prisma/client", () => {
  const MockPrismaClient = vi.fn()
  return { PrismaClient: MockPrismaClient }
})

vi.mock("@prisma/adapter-pg", () => {
  const MockPrismaPg = vi.fn()
  return { PrismaPg: MockPrismaPg }
})

describe("Prisma client singleton", () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it("exports a prisma client instance", async () => {
    const { prisma } = await import("./prisma")
    expect(prisma).toBeDefined()
  })

  it("returns the same instance on multiple imports", async () => {
    const first = await import("./prisma")
    const second = await import("./prisma")
    expect(first.prisma).toBe(second.prisma)
  })

  it("stores the instance on globalThis in non-production", async () => {
    vi.stubEnv("NODE_ENV", "development")

    vi.resetModules()
    await import("./prisma")

    const globalForPrisma = globalThis as unknown as {
      prisma: unknown
    }
    expect(globalForPrisma.prisma).toBeDefined()

    vi.unstubAllEnvs()
  })
})
