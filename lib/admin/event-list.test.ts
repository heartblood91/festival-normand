import { describe, it, expect } from "vitest"
import {
  buildListUrl,
  eventListOrderBy,
  eventListWhere,
  parseEventListParams,
  publishBlocker,
} from "./event-list"

const TODAY = new Date("2027-05-22T00:00:00.000Z")

describe("parseEventListParams", () => {
  it("keeps known values and drops unknown ones", () => {
    expect(
      parseEventListParams({
        status: "published",
        when: "past",
        todo: "missing-gps",
        sort: "date-asc",
        source: "nope",
        page: "3",
        search: " Caen ",
      })
    ).toEqual({
      status: "published",
      when: "past",
      todo: "missing-gps",
      sort: "date-asc",
      page: 3,
      search: "Caen",
    })
  })

  it("falls back to page 1 for invalid pages", () => {
    expect(parseEventListParams({ page: "-2" }).page).toBe(1)
    expect(parseEventListParams({ page: "abc" }).page).toBe(1)
  })
})

describe("eventListWhere", () => {
  it("is empty without filters", () => {
    expect(eventListWhere({}, TODAY)).toEqual({})
  })

  it("combines simple filters", () => {
    expect(
      eventListWhere(
        { status: "published", department: "ORNE", featured: "true", source: "manual" },
        TODAY
      )
    ).toEqual({ published: true, department: "ORNE", featured: true, tourinsoftId: null })
  })

  it("splits upcoming and past on the end date, or the start date when there is none", () => {
    expect(eventListWhere({ when: "upcoming" }, TODAY)).toEqual({
      AND: [{ OR: [{ dateEnd: { gte: TODAY } }, { dateEnd: null, dateStart: { gte: TODAY } }] }],
    })
    expect(eventListWhere({ when: "past" }, TODAY)).toEqual({
      AND: [{ OR: [{ dateEnd: { lt: TODAY } }, { dateEnd: null, dateStart: { lt: TODAY } }] }],
    })
  })

  it("finds events to fix", () => {
    expect(eventListWhere({ todo: "missing-alt" }, TODAY)).toEqual({
      AND: [
        { coverImage: { not: null } },
        { OR: [{ coverImageAltFr: null }, { coverImageAltFr: "" }] },
      ],
    })
    expect(eventListWhere({ todo: "missing-gps" }, TODAY)).toEqual({
      AND: [{ OR: [{ latitude: null }, { longitude: null }] }],
    })
    expect(eventListWhere({ todo: "missing-en" }, TODAY).AND).toHaveLength(1)
  })

  it("restricts to the search matches", () => {
    expect(eventListWhere({ status: "draft" }, TODAY, ["a", "b"])).toEqual({
      published: false,
      publishedAt: null,
      unpublishedAt: null,
      id: { in: ["a", "b"] },
    })
  })
})

describe("eventListOrderBy", () => {
  it("defaults to the most recently created", () => {
    expect(eventListOrderBy(undefined)).toEqual([{ createdAt: "desc" }])
  })

  it("sorts by event date or title", () => {
    expect(eventListOrderBy("date-asc")).toEqual([{ dateStart: "asc" }, { titleFr: "asc" }])
    expect(eventListOrderBy("date-desc")).toEqual([{ dateStart: "desc" }, { titleFr: "asc" }])
    expect(eventListOrderBy("title")).toEqual([{ titleFr: "asc" }])
  })
})

describe("buildListUrl", () => {
  const current = { search: "Caen", status: "published", source: "tourinsoft", page: 4 }

  it("keeps every filter and resets the page on change", () => {
    expect(buildListUrl("/admin/events", current, { sort: "title" })).toBe(
      "/admin/events?search=Caen&status=published&source=tourinsoft&sort=title"
    )
  })

  it("drops cleared and default values", () => {
    expect(buildListUrl("/admin/events", current, { search: "", status: "all" })).toBe(
      "/admin/events?source=tourinsoft"
    )
  })

  it("keeps the filters when paginating", () => {
    expect(buildListUrl("/admin/events", current, { page: 2 })).toBe(
      "/admin/events?search=Caen&status=published&source=tourinsoft&page=2"
    )
    expect(buildListUrl("/admin/events", current, { page: 1 })).toBe(
      "/admin/events?search=Caen&status=published&source=tourinsoft"
    )
  })
})

describe("publishBlocker", () => {
  const ok = { coverImage: null, coverImageAltFr: null, descriptionFr: "<p>Texte</p>" }

  it("accepts an event without images to describe", () => {
    expect(publishBlocker(ok)).toBeNull()
    expect(publishBlocker({ ...ok, coverImage: "/a.jpg", coverImageAltFr: "Nef" })).toBeNull()
  })

  it("names the missing alt", () => {
    expect(publishBlocker({ ...ok, coverImage: "/a.jpg" })).toBe(
      "image de couverture sans texte alternatif"
    )
    expect(publishBlocker({ ...ok, descriptionFr: '<img src="/b.jpg">' })).toBe(
      "1 image(s) sans texte alternatif dans le contenu"
    )
  })
})
