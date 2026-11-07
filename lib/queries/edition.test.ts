import { describe, it, expect, vi, beforeEach } from "vitest"
import { Prisma } from "@prisma/client"
import { prismaMock } from "@/lib/test-utils"

vi.mock("next/cache", () => ({ unstable_cache: (fn: () => unknown) => fn }))
vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }))

import { getCurrentEdition, getEditionSettings } from "./edition"

beforeEach(() => {
  prismaMock.edition.findFirst.mockReset()
})

describe("getCurrentEdition", () => {
  it("falls back to the 2027 default when no edition was saved", async () => {
    prismaMock.edition.findFirst.mockResolvedValue(null)
    const edition = await getCurrentEdition()
    expect(edition.year).toBe(2027)
    expect(edition.nights.map((night) => night.date)).toEqual([
      "2027-05-21",
      "2027-05-22",
      "2027-05-23",
    ])
  })

  it("uses the saved edition with the highest year", async () => {
    prismaMock.edition.findFirst.mockResolvedValue({
      year: 2028,
      dateStart: new Date("2028-05-26T00:00:00Z"),
      dateEnd: new Date("2028-05-27T00:00:00Z"),
      bilanFrom: new Date("2028-06-01T00:00:00Z"),
      updatedAt: new Date(),
    })
    const edition = await getCurrentEdition()
    expect(prismaMock.edition.findFirst).toHaveBeenCalledWith({ orderBy: { year: "desc" } })
    expect(edition).toMatchObject({ year: 2028, dateStart: "2028-05-26", bilanFrom: "2028-06-01" })
    expect(edition.nights).toHaveLength(2)
  })

  it("falls back to the default while the editions table is not migrated yet", async () => {
    prismaMock.edition.findFirst.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("missing table", {
        code: "P2021",
        clientVersion: "test",
      })
    )
    expect((await getEditionSettings()).year).toBe(2027)
  })

  it("does not hide other database errors", async () => {
    prismaMock.edition.findFirst.mockRejectedValue(new Error("connection refused"))
    await expect(getEditionSettings()).rejects.toThrow("connection refused")
  })
})
