import { describe, it, expect, vi, beforeEach } from "vitest"

const { mockPrisma, mockRequireRole } = vi.hoisted(() => ({
  mockPrisma: {
    event: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      count: vi.fn(),
    },
    $queryRawUnsafe: vi.fn().mockResolvedValue([]),
  },
  mockRequireRole: vi.fn(),
}))

// Default: an authenticated EDITOR. Implementation survives clearAllMocks.
mockRequireRole.mockResolvedValue({
  id: "admin-1",
  name: "Admin",
  email: "admin@test.fr",
  role: "ADMIN",
})

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }))
vi.mock("@/lib/rbac", () => ({
  requireRole: mockRequireRole,
  getAuthenticatedUser: mockRequireRole,
}))

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

import * as eventActions from "./events"

const {
  createEvent,
  updateEvent,
  unpublishEvents,
  publishEvents,
  setEventsFeatured,
  getAdminEvents,
  getAdminEventById,
} = eventActions

const createFormData = (data: Record<string, string>): FormData => {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value)
  })
  return formData
}

const validEventData = {
  titleFr: "Festival de Lumières à Caen",
  titleEn: "",
  slug: "festival-de-lumieres-a-caen",
  descriptionFr: "Un magnifique événement de mise en lumière du patrimoine caennais.",
  descriptionEn: "",
  location: "Château de Caen",
  city: "Caen",
  postalCode: "14000",
  department: "CALVADOS",
  category: "ILLUMINATIONS",
  dateStart: "2026-05-29",
  dateEnd: "",
  timeStart: "20:00",
  timeEnd: "23:00",
  pricingFr: "Gratuit",
  pricingEn: "",
  organizer: "Ville de Caen",
  email: "contact@caen.fr",
  phone: "",
  website: "",
  latitude: "49.1844",
  longitude: "-0.3706",
  coverImage: "",
  featured: "false",
  accessible: "true",
  published: "true",
}

describe("createEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("creates event successfully with valid data", async () => {
    mockPrisma.event.findUnique.mockResolvedValue(null)
    mockPrisma.event.create.mockResolvedValue({
      id: "test-id",
      slug: "festival-de-lumieres-a-caen",
    })

    const result = await createEvent(createFormData(validEventData))

    expect(result.success).toBe(true)
    expect(result.eventId).toBe("test-id")
    expect(mockPrisma.event.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          titleFr: "Festival de Lumières à Caen",
          slug: "festival-de-lumieres-a-caen",
          department: "CALVADOS",
          category: "ILLUMINATIONS",
          accessible: true,
        }),
      })
    )
  })

  it("connects the ticked themes on creation", async () => {
    mockPrisma.event.findUnique.mockResolvedValue(null)
    mockPrisma.event.create.mockResolvedValue({ id: "new", slug: "x" })

    await createEvent(createFormData({ ...validEventData, themeIds: "t1" }))

    expect(mockPrisma.event.create.mock.calls[0][0].data.themes).toEqual({
      connect: [{ id: "t1" }],
    })
  })

  it("returns validation errors for invalid data", async () => {
    const result = await createEvent(
      createFormData({ ...validEventData, titleFr: "ab", descriptionFr: "short" })
    )

    expect(result.success).toBe(false)
    expect(result.errors).toBeDefined()
    expect(result.errors?.titleFr).toBeDefined()
    expect(result.errors?.descriptionFr).toBeDefined()
  })

  it("returns error for duplicate slug", async () => {
    mockPrisma.event.findUnique.mockResolvedValue({ id: "existing-id" })

    const result = await createEvent(createFormData(validEventData))

    expect(result.success).toBe(false)
    expect(result.errors?.slug).toBeDefined()
    expect(mockPrisma.event.create).not.toHaveBeenCalled()
  })

  it("handles database errors gracefully", async () => {
    mockPrisma.event.findUnique.mockResolvedValue(null)
    mockPrisma.event.create.mockRejectedValue(new Error("DB error"))

    const result = await createEvent(createFormData(validEventData))

    expect(result.success).toBe(false)
    expect(result.message).toContain("erreur")
  })
})

describe("updateEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("updates event successfully", async () => {
    mockPrisma.event.findFirst.mockResolvedValue(null)
    mockPrisma.event.update.mockResolvedValue({
      id: "test-id",
      slug: "festival-de-lumieres-a-caen",
    })

    const result = await updateEvent("test-id", createFormData(validEventData))

    expect(result.success).toBe(true)
    expect(mockPrisma.event.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "test-id" },
      })
    )
  })

  it("replaces the themes with the ticked ones", async () => {
    mockPrisma.event.findFirst.mockResolvedValue(null)
    mockPrisma.event.update.mockResolvedValue({ id: "test-id", slug: "x" })

    await updateEvent("test-id", createFormData({ ...validEventData, themeIds: "t1,t2" }))
    expect(mockPrisma.event.update.mock.calls[0][0].data.themes).toEqual({
      set: [{ id: "t1" }, { id: "t2" }],
    })

    await updateEvent("test-id", createFormData({ ...validEventData, themeIds: "" }))
    expect(mockPrisma.event.update.mock.calls[1][0].data.themes).toEqual({ set: [] })
  })

  it("leaves the themes alone when the form has no theme field", async () => {
    mockPrisma.event.findFirst.mockResolvedValue(null)
    mockPrisma.event.update.mockResolvedValue({ id: "test-id", slug: "x" })

    await updateEvent("test-id", createFormData(validEventData))

    expect(mockPrisma.event.update.mock.calls[0][0].data).not.toHaveProperty("themes")
  })

  it("saves the collect link, and clears its title and image with it", async () => {
    mockPrisma.event.findFirst.mockResolvedValue(null)
    mockPrisma.event.update.mockResolvedValue({ id: "test-id", slug: "x" })
    const collect = {
      fundraisingUrl: "https://www.fondation-patrimoine.org/les-projets/abbaye/123",
      fundraisingTitle: "Abbaye aux Hommes",
      fundraisingImage: "https://strapi-upload.cdn.fondation-patrimoine.org/thumb.jpg",
    }

    await updateEvent("test-id", createFormData({ ...validEventData, ...collect }))
    expect(mockPrisma.event.update.mock.calls[0][0].data).toMatchObject(collect)

    await updateEvent(
      "test-id",
      createFormData({ ...validEventData, ...collect, fundraisingUrl: "" })
    )
    expect(mockPrisma.event.update.mock.calls[1][0].data).toMatchObject({
      fundraisingUrl: null,
      fundraisingTitle: null,
      fundraisingImage: null,
    })

    // A form without the collect field (bulk tools) keeps the attached collect.
    await updateEvent("test-id", createFormData(validEventData))
    expect(mockPrisma.event.update.mock.calls[2][0].data).not.toHaveProperty("fundraisingUrl")
  })

  it("returns error for duplicate slug on different event", async () => {
    mockPrisma.event.findFirst.mockResolvedValue({ id: "other-id" })

    const result = await updateEvent("test-id", createFormData(validEventData))

    expect(result.success).toBe(false)
    expect(result.errors?.slug).toBeDefined()
  })

  it("returns validation errors for invalid data", async () => {
    const result = await updateEvent("test-id", createFormData({ ...validEventData, city: "" }))

    expect(result.success).toBe(false)
    expect(result.errors?.city).toBeDefined()
  })
})

describe("unpublishEvents", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("unpublishes the published events among the selection, keeping every row", async () => {
    mockPrisma.event.findMany.mockResolvedValue([{ slug: "a" }, { slug: "b" }])
    mockPrisma.event.updateMany.mockResolvedValue({ count: 2 })

    const result = await unpublishEvents(["1", "2", "3"])

    expect(result).toEqual({ success: true, message: "2 événements dépubliés." })
    expect(mockPrisma.event.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ["1", "2", "3"] }, published: true },
      data: { published: false, unpublishedAt: expect.any(Date) },
    })
  })

  it("refuses an empty selection", async () => {
    const result = await unpublishEvents([])

    expect(result.success).toBe(false)
    expect(mockPrisma.event.updateMany).not.toHaveBeenCalled()
  })

  it("handles database errors gracefully", async () => {
    mockPrisma.event.findMany.mockResolvedValue([])
    mockPrisma.event.updateMany.mockRejectedValue(new Error("down"))

    const result = await unpublishEvents(["1"])

    expect(result.success).toBe(false)
    expect(result.message).toContain("erreur")
  })

  it("exposes no way to delete an event", () => {
    expect(Object.keys(eventActions).filter((name) => /delete/i.test(name))).toEqual([])
  })
})

const draft = (
  id: string,
  titleFr: string,
  cover: Partial<Record<string, string | null>> = {}
) => ({
  id,
  slug: id,
  titleFr,
  coverImage: null,
  coverImageAltFr: null,
  descriptionFr: "<p>Texte</p>",
  descriptionEn: null,
  ...cover,
})

describe("publishEvents", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("publishes the drafts that pass the alt checks and names the others", async () => {
    mockPrisma.event.findMany.mockResolvedValue([
      draft("1", "Église"),
      draft("2", "Abbaye", { coverImage: "/c.jpg", coverImageAltFr: "" }),
    ])
    mockPrisma.event.updateMany.mockResolvedValue({ count: 1 })

    const result = await publishEvents(["1", "2"])

    expect(mockPrisma.event.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: { in: ["1", "2"] }, published: false } })
    )
    expect(mockPrisma.event.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ["1"] }, published: false },
      data: { published: true, publishedAt: expect.any(Date), unpublishedAt: null },
    })
    expect(result).toEqual({
      success: true,
      message:
        "1 événement publié. Non publié(s) : Abbaye (image de couverture sans texte alternatif).",
    })
  })

  it("fails when nothing can be published", async () => {
    mockPrisma.event.findMany.mockResolvedValue([draft("2", "Abbaye", { coverImage: "/c.jpg" })])

    const result = await publishEvents(["2"])

    expect(result.success).toBe(false)
    expect(result.message).toContain("Abbaye")
    expect(mockPrisma.event.updateMany).not.toHaveBeenCalled()
  })

  it("checks the role before reading", async () => {
    mockRequireRole.mockRejectedValueOnce(new Error("Unauthorized"))

    const result = await publishEvents(["1"])

    expect(result.success).toBe(false)
    expect(mockPrisma.event.findMany).not.toHaveBeenCalled()
  })
})

describe("setEventsFeatured", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("features or unfeatures the selection", async () => {
    mockPrisma.event.findMany.mockResolvedValue([{ slug: "a" }])
    mockPrisma.event.updateMany.mockResolvedValue({ count: 2 })

    const result = await setEventsFeatured(["1", "2"], true)

    expect(mockPrisma.event.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ["1", "2"] } },
      data: { featured: true },
    })
    expect(result).toEqual({ success: true, message: "2 événements mis à la une." })
  })

  it("checks the role before writing", async () => {
    mockRequireRole.mockRejectedValueOnce(new Error("Unauthorized"))

    const result = await setEventsFeatured(["1"], false)

    expect(result.success).toBe(false)
    expect(mockPrisma.event.updateMany).not.toHaveBeenCalled()
  })
})

describe("getAdminEvents", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it.each([
    ["tourinsoft", { tourinsoftId: { not: null } }],
    ["manual", { tourinsoftId: null }],
  ] as const)("filters by source %s", async (source, where) => {
    mockPrisma.event.count.mockResolvedValue(0)
    mockPrisma.event.findMany.mockResolvedValue([])

    await getAdminEvents({ source })

    expect(mockPrisma.event.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where,
        select: expect.objectContaining({ tourinsoftId: true, tourinsoftUpdatedAt: true }),
      })
    )
  })

  it("returns all events without search", async () => {
    const mockEvents = [
      { id: "1", titleFr: "Event 1" },
      { id: "2", titleFr: "Event 2" },
    ]
    mockPrisma.event.count.mockResolvedValue(2)
    mockPrisma.event.findMany.mockResolvedValue(mockEvents)

    const result = await getAdminEvents()

    expect(result).toEqual({
      items: mockEvents,
      total: 2,
      page: 1,
      totalPages: 1,
    })
    expect(mockPrisma.event.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {},
        orderBy: [{ createdAt: "desc" }],
      })
    )
  })

  it("filters events by search query via unaccent", async () => {
    mockPrisma.event.count.mockResolvedValue(0)
    mockPrisma.event.findMany.mockResolvedValue([])
    mockPrisma.$queryRawUnsafe.mockResolvedValue([{ id: "match-1" }])

    await getAdminEvents({ search: "Caen" })

    expect(mockPrisma.$queryRawUnsafe).toHaveBeenCalledWith(
      expect.stringContaining("unaccent"),
      "%Caen%"
    )
    expect(mockPrisma.event.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: { in: ["match-1"] },
        }),
      })
    )
  })
})

describe("getAdminEventById", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns event by id", async () => {
    const mockEvent = { id: "test-id", titleFr: "Test Event" }
    mockPrisma.event.findUnique.mockResolvedValue(mockEvent)

    const result = await getAdminEventById("test-id")

    expect(result).toEqual(mockEvent)
    expect(mockPrisma.event.findUnique).toHaveBeenCalledWith({
      where: { id: "test-id" },
      include: { themes: { select: { id: true } } },
    })
  })

  it("returns null for non-existent event", async () => {
    mockPrisma.event.findUnique.mockResolvedValue(null)

    const result = await getAdminEventById("non-existent")

    expect(result).toBeNull()
  })
})

describe("auth guards", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRequireRole.mockResolvedValue({
      id: "admin-1",
      name: "Admin",
      email: "admin@test.fr",
      role: "ADMIN",
    })
  })

  it("createEvent does not touch the DB when the caller is unauthenticated", async () => {
    mockRequireRole.mockRejectedValueOnce(new Error("Unauthorized: not authenticated"))

    const result = await createEvent(createFormData(validEventData))

    expect(result.success).toBe(false)
    expect(mockPrisma.event.create).not.toHaveBeenCalled()
  })

  it("unpublishEvents does not touch the DB when the caller is unauthenticated", async () => {
    mockRequireRole.mockRejectedValueOnce(new Error("Unauthorized: not authenticated"))

    const result = await unpublishEvents(["any-id"])

    expect(result.success).toBe(false)
    expect(mockPrisma.event.updateMany).not.toHaveBeenCalled()
  })

  it("getAdminEvents throws when the caller is unauthenticated", async () => {
    mockRequireRole.mockRejectedValueOnce(new Error("Unauthorized: not authenticated"))

    await expect(getAdminEvents()).rejects.toThrow("Unauthorized")
    expect(mockPrisma.event.findMany).not.toHaveBeenCalled()
  })
})
