import { describe, it, expect, vi, beforeEach } from "vitest"
import { prismaMock } from "@/lib/test-utils"

vi.mock("next/cache", () => ({ unstable_cache: (fn: Function) => fn }))
vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }))

import { getFilterThemes, getHomeThemes } from "@/lib/queries/themes"
import { buildEdition, DEFAULT_EDITION_SETTINGS } from "@/lib/festival/edition"

beforeEach(() => {
  vi.clearAllMocks()
})

const millennium = {
  id: "t1",
  slug: "millennium",
  nameFr: "Millénaire",
  nameEn: "Millennium",
  descriptionFr: "Mille ans",
  descriptionEn: "A thousand years",
  color: "#d97706",
  markerImage: "/themes/millennium-marker.svg",
  order: 0,
}

describe("getFilterThemes", () => {
  it("lists only themes with at least one public event, localized", async () => {
    prismaMock.theme.findMany.mockResolvedValue([
      { ...millennium, _count: { events: 3 } },
      { ...millennium, id: "t2", slug: "empty", _count: { events: 0 } },
    ])

    const themes = await getFilterThemes("en")

    expect(themes).toEqual([{ slug: "millennium", name: "Millennium", color: "#d97706", count: 3 }])
    expect(prismaMock.theme.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.objectContaining({
          _count: { select: { events: { where: expect.objectContaining({ published: true }) } } },
        }),
      })
    )
  })
})

describe("getHomeThemes", () => {
  it("returns home themes with up to 3 public events of the edition", async () => {
    prismaMock.theme.findMany.mockResolvedValue([
      {
        ...millennium,
        events: [
          {
            id: "e1",
            titleFr: "Château de Falaise",
            titleEn: null,
            slug: "falaise",
            city: "Falaise",
            dateStart: new Date("2027-05-21T00:00:00Z"),
          },
        ],
      },
    ])
    const edition = buildEdition(DEFAULT_EDITION_SETTINGS)

    const themes = await getHomeThemes("fr", edition)

    expect(themes[0]).toMatchObject({
      slug: "millennium",
      name: "Millénaire",
      description: "Mille ans",
      markerImage: "/themes/millennium-marker.svg",
      events: [
        { slug: "falaise", title: "Château de Falaise", dateStart: "2027-05-21T00:00:00.000Z" },
      ],
    })
    const call = prismaMock.theme.findMany.mock.calls[0][0]
    expect(call.where).toEqual({
      showOnHome: true,
      OR: [{ years: { isEmpty: true } }, { years: { has: 2027 } }],
    })
    expect(call.select.events.take).toBe(3)
    expect(call.select.events.where).toMatchObject({
      published: true,
      dateStart: { gte: new Date("2027-01-01T00:00:00") },
    })
  })
})
