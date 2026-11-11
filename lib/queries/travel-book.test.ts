import { describe, it, expect, vi, beforeEach } from "vitest"
import { prismaMock } from "@/lib/test-utils"

vi.mock("next/cache", () => ({ unstable_cache: (fn: Function) => fn }))
vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }))

import { getTravelBook, getTravelBookEvents } from "@/lib/queries/travel-book"

beforeEach(() => {
  vi.clearAllMocks()
})

const row = {
  id: "e1",
  titleFr: "Château illuminé",
  titleEn: "Castle in lights",
  slug: "chateau",
  location: "Château",
  city: "Falaise",
  department: "CALVADOS",
  category: "ILLUMINATION",
  dateStart: new Date("2027-05-21T18:00:00.000Z"),
  dateEnd: null,
  timeStart: "21:00",
  timeEnd: null,
  coverImage: null,
  coverImageAltFr: null,
  coverImageAltEn: null,
  accessible: true,
  latitude: 48.89,
  longitude: -0.19,
  themes: [{ order: 0, color: "#d97706", markerImage: "/m.svg" }],
}

describe("getTravelBookEvents", () => {
  it("returns only public events among the requested ids, localized, with their map pin", async () => {
    prismaMock.event.findMany.mockResolvedValue([row])

    const events = await getTravelBookEvents(["e1", "e1", "bad id", "e2"], "en")

    expect(prismaMock.event.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ published: true, id: { in: ["e1", "e2"] } }),
      })
    )
    expect(events).toEqual([
      expect.objectContaining({
        id: "e1",
        title: "Castle in lights",
        dateStart: "2027-05-21T18:00:00.000Z",
        pin: { color: "#d97706", marker: "/m.svg" },
      }),
    ])
  })

  it("does not query the database for an empty selection", async () => {
    expect(await getTravelBookEvents([], "fr")).toEqual([])
    expect(prismaMock.event.findMany).not.toHaveBeenCalled()
  })
})

describe("getTravelBook", () => {
  it("looks up a valid UUID only", async () => {
    prismaMock.travelBook.findUnique.mockResolvedValue({ id: "x", eventIds: ["e1"] })

    expect(await getTravelBook("not-a-uuid")).toBeNull()
    expect(prismaMock.travelBook.findUnique).not.toHaveBeenCalled()

    const id = "3f0c2b1e-8d4a-4c6f-9b2e-1a2b3c4d5e6f"
    expect(await getTravelBook(id)).toEqual({ id: "x", eventIds: ["e1"] })
    expect(prismaMock.travelBook.findUnique).toHaveBeenCalledWith({
      where: { id },
      select: { id: true, eventIds: true },
    })
  })
})
