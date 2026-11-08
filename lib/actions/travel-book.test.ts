import { describe, it, expect, vi, beforeEach } from "vitest"
import { prismaMock } from "@/lib/test-utils"

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }))

import { loadTravelBook, shareTravelBook } from "./travel-book"
import { travelBookKey } from "@/lib/travel-book/key"

beforeEach(() => {
  vi.clearAllMocks()
})

describe("shareTravelBook", () => {
  it("stores only public event ids and reuses the row of an identical selection", async () => {
    prismaMock.event.findMany.mockResolvedValue([{ id: "a" }, { id: "b" }])
    prismaMock.travelBook.upsert.mockResolvedValue({ id: "uuid-1" })

    const result = await shareTravelBook(["b", "a", "gone", "a"])

    expect(result).toEqual({ success: true, id: "uuid-1" })
    expect(prismaMock.event.findMany).toHaveBeenCalledWith({
      where: expect.objectContaining({ published: true, id: { in: ["a", "b", "gone"] } }),
      select: { id: true },
    })
    expect(prismaMock.travelBook.upsert).toHaveBeenCalledWith({
      where: { key: travelBookKey(["a", "b"]) },
      create: { key: travelBookKey(["a", "b"]), eventIds: ["a", "b"] },
      update: {},
      select: { id: true },
    })
  })

  it("refuses a selection without any public event", async () => {
    prismaMock.event.findMany.mockResolvedValue([])

    expect(await shareTravelBook(["gone"])).toEqual({ success: false })
    expect(await shareTravelBook("not a list")).toEqual({ success: false })
    expect(prismaMock.travelBook.upsert).not.toHaveBeenCalled()
  })

  it("reports a database failure without throwing", async () => {
    prismaMock.event.findMany.mockResolvedValue([{ id: "a" }])
    prismaMock.travelBook.upsert.mockRejectedValue(new Error("db down"))

    expect(await shareTravelBook(["a"])).toEqual({ success: false })
  })
})

describe("loadTravelBook", () => {
  it("falls back to French for an unknown locale and ignores non-list input", async () => {
    prismaMock.event.findMany.mockResolvedValue([])

    expect(await loadTravelBook("nope", "de")).toEqual([])
    expect(prismaMock.event.findMany).not.toHaveBeenCalled()

    await loadTravelBook(["a"], "de")
    expect(prismaMock.event.findMany).toHaveBeenCalledTimes(1)
  })
})
