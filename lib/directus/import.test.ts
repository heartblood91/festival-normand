import { describe, it, expect, vi, beforeEach } from "vitest"
import type { DirectusEvent } from "./types"

const { mockPrisma, mockCreate } = vi.hoisted(() => ({
  mockPrisma: { event: { findMany: vi.fn() } },
  mockCreate: vi.fn(),
}))

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }))
vi.mock("@/lib/tourinsoft/sync", () => ({
  createEventFromOffer: mockCreate,
  withGeocodedCoordinates: async <T>(mapped: T) => mapped,
}))

import { importDirectusEvents } from "./import"

const v1 = (id: string, title: string, overrides: Partial<DirectusEvent> = {}): DirectusEvent => ({
  id,
  status: "published",
  title,
  departement: "Eure",
  datehorairess: [{ Datedebut: "2026-05-29T00:00:00" }],
  lieu_principaux: [{ Lieuprincipal: "AGY" }],
  geo: { type: "Point", coordinates: [1.0, 49.0] },
  syndic_object_id: `FMANOR${id}`,
  ...overrides,
})

const existing = (overrides: Record<string, unknown>) => ({
  id: "e1",
  tourinsoftId: null,
  titleFr: "Autre",
  slug: "autre",
  city: "Ailleurs",
  latitude: null,
  longitude: null,
  dateStart: new Date("2026-05-28T22:00:00Z"),
  ...overrides,
})

const defaults = {
  publish: false,
  downloadPhotos: false,
  translate: false,
  dryRun: false,
  limit: Infinity,
}

describe("importDirectusEvents", () => {
  beforeEach(() => {
    mockPrisma.event.findMany.mockReset()
    mockCreate.mockReset()
  })

  it("skips events already known by Tourinsoft id or by site, and creates the rest as drafts", async () => {
    mockPrisma.event.findMany.mockResolvedValue([
      existing({ id: "a", tourinsoftId: "FMANOR1" }),
      existing({ id: "b", titleFr: "Lumières à Agy", slug: "lumieres-a-agy", city: "Agy" }),
    ])
    const report = await importDirectusEvents(
      [v1("1", "Déjà importé"), v1("2", "Lumières à Agy"), v1("3", "Concert à Agy", { geo: null })],
      defaults
    )
    expect(report).toMatchObject({
      total: 3,
      knownById: 1,
      knownBySite: { "title+commune": 1 },
      created: 1,
      failed: 0,
    })
    expect(mockCreate).toHaveBeenCalledTimes(1)
    expect(mockCreate.mock.calls[0][0]).toMatchObject({
      tourinsoftId: "FMANOR3",
      titleFr: "Concert à Agy",
    })
    expect(mockCreate.mock.calls[0][1]).toEqual({
      published: false,
      downloadPhotos: false,
      translate: false,
    })
  })

  it("writes nothing in dry-run mode and lists what it would create", async () => {
    mockPrisma.event.findMany.mockResolvedValue([])
    const report = await importDirectusEvents([v1("1", "Lumières à Agy")], {
      ...defaults,
      dryRun: true,
    })
    expect(mockCreate).not.toHaveBeenCalled()
    expect(report.created).toBe(0)
    expect(report.planned).toEqual([
      {
        tourinsoftId: "FMANOR1",
        title: "Lumières à Agy",
        city: "Agy",
        department: "EURE",
        dateStart: new Date("2026-05-29T00:00:00").toISOString(),
      },
    ])
  })

  it("creates a record listed twice in v1 only once", async () => {
    mockPrisma.event.findMany.mockResolvedValue([])
    const report = await importDirectusEvents(
      [v1("1", "Lumières à Agy"), v1("1", "Lumières à Agy")],
      defaults
    )
    expect(report.created).toBe(1)
  })

  it("respects the limit and counts failures without stopping", async () => {
    mockPrisma.event.findMany.mockResolvedValue([])
    mockCreate.mockRejectedValueOnce(new Error("boom")).mockResolvedValue(undefined)
    const report = await importDirectusEvents(
      [
        v1("1", "Un", { geo: null }),
        v1("2", "Deux", { geo: null }),
        v1("3", "Trois", { geo: null }),
      ],
      { ...defaults, limit: 1 }
    )
    expect(report).toMatchObject({ created: 1, failed: 1 })
    expect(mockCreate).toHaveBeenCalledTimes(2)
  })

  it("reports v1 records without a title or a date as failures", async () => {
    mockPrisma.event.findMany.mockResolvedValue([])
    const report = await importDirectusEvents(
      [v1("1", "Sans date", { datehorairess: [] })],
      defaults
    )
    expect(report).toMatchObject({ failed: 1, created: 0 })
  })
})
