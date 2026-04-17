import { describe, it, expect, vi, beforeEach } from "vitest"

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    event: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    $queryRawUnsafe: vi.fn().mockResolvedValue([]),
  },
}))

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }))

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

import { createEvent, updateEvent, deleteEvent, getAdminEvents, getAdminEventById } from "./events"

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

describe("deleteEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("deletes event successfully", async () => {
    mockPrisma.event.delete.mockResolvedValue({
      id: "test-id",
      slug: "festival-de-lumieres-a-caen",
    })

    const result = await deleteEvent("test-id")

    expect(result.success).toBe(true)
    expect(mockPrisma.event.delete).toHaveBeenCalledWith({
      where: { id: "test-id" },
    })
  })

  it("handles database errors gracefully", async () => {
    mockPrisma.event.delete.mockRejectedValue(new Error("Not found"))

    const result = await deleteEvent("test-id")

    expect(result.success).toBe(false)
    expect(result.message).toContain("erreur")
  })
})

describe("getAdminEvents", () => {
  beforeEach(() => {
    vi.clearAllMocks()
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
        orderBy: { createdAt: "desc" },
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
    })
  })

  it("returns null for non-existent event", async () => {
    mockPrisma.event.findUnique.mockResolvedValue(null)

    const result = await getAdminEventById("non-existent")

    expect(result).toBeNull()
  })
})
