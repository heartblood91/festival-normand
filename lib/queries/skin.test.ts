import { describe, it, expect, vi, beforeEach } from "vitest"
import { Prisma } from "@prisma/client"
import { prismaMock } from "@/lib/test-utils"

vi.mock("next/cache", () => ({ unstable_cache: (fn: Function) => fn }))
vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }))

import { getActiveSkin } from "@/lib/queries/skin"

beforeEach(() => {
  vi.clearAllMocks()
})

describe("getActiveSkin", () => {
  it("asks only for themes shown this year that carry a skin", async () => {
    prismaMock.theme.findMany.mockResolvedValue([])

    await expect(getActiveSkin(2027)).resolves.toBeNull()
    expect(prismaMock.theme.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          skin: { not: null },
          OR: [{ years: { isEmpty: true } }, { years: { has: 2027 } }],
        },
      })
    )
  })

  it("returns the first theme whose skin still exists in the code", async () => {
    prismaMock.theme.findMany.mockResolvedValue([
      { slug: "old", skin: "removed-skin", skinLogo: null },
      { slug: "millenaire", skin: "millennium", skinLogo: "/uploads/logo.png" },
    ])

    await expect(getActiveSkin(2027)).resolves.toEqual({
      key: "millennium",
      themeSlug: "millenaire",
      logo: "/uploads/logo.png",
    })
  })

  it("renders the regular site when the migration has not run", async () => {
    prismaMock.theme.findMany.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("column missing", {
        code: "P2022",
        clientVersion: "test",
      })
    )

    await expect(getActiveSkin(2027)).resolves.toBeNull()
  })

  it("does not hide other database errors", async () => {
    prismaMock.theme.findMany.mockRejectedValue(new Error("connection refused"))

    await expect(getActiveSkin(2027)).rejects.toThrow("connection refused")
  })
})
