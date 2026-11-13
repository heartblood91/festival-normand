import { describe, it, expect, vi, beforeEach } from "vitest"

const { mockPrisma, mockRequireRole, mockFetchPublicPage } = vi.hoisted(() => ({
  mockPrisma: {
    event: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    eventAssociation: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    $transaction: vi.fn(),
  },
  mockRequireRole: vi.fn(),
  mockFetchPublicPage: vi.fn(),
}))

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }))
vi.mock("@/lib/rbac", () => ({ requireRole: mockRequireRole }))
vi.mock("next/cache", () => ({ revalidatePath: vi.fn(), updateTag: vi.fn() }))
vi.mock("@/lib/events/fetch-public-page", () => ({ fetchPublicPage: mockFetchPublicPage }))

import {
  addAssociation,
  deleteAssociation,
  findMissingSocialLinks,
  findSocialLinks,
  getEventCommunity,
  saveSocialLinks,
  updateAssociation,
} from "./community"

const SITE_HTML = `<a href="https://www.facebook.com/chateau.exemple/">Facebook</a>
<a href="https://instagram.com/chateau_exemple?igsh=1">Instagram</a>
<a href="https://www.facebook.com/sharer/sharer.php?u=x">Partager</a>`

beforeEach(() => {
  vi.clearAllMocks()
  mockRequireRole.mockResolvedValue({ id: "u1", role: "EDITOR" })
  mockPrisma.event.findUnique.mockResolvedValue({ slug: "chateau", website: "https://chateau.fr" })
  mockPrisma.eventAssociation.findFirst.mockResolvedValue({ order: 2 })
  mockPrisma.eventAssociation.update.mockResolvedValue({ eventId: "e1" })
  mockPrisma.eventAssociation.delete.mockResolvedValue({ eventId: "e1" })
  mockPrisma.$transaction.mockResolvedValue([])
})

describe("community actions", () => {
  it("requires an editor before touching the database", async () => {
    mockRequireRole.mockRejectedValue(new Error("Forbidden"))

    await expect(getEventCommunity("e1")).rejects.toThrow("Forbidden")
    expect((await saveSocialLinks("e1", ["https://facebook.com/a"])).success).toBe(false)
    expect((await findSocialLinks("e1")).success).toBe(false)
    expect((await findMissingSocialLinks()).success).toBe(false)
    expect((await addAssociation("e1", { name: "Amis", url: "", logo: "" })).success).toBe(false)
    expect((await updateAssociation("a1", { name: "Amis", url: "", logo: "" })).success).toBe(false)
    expect((await deleteAssociation("a1")).success).toBe(false)
    expect(mockPrisma.event.update).not.toHaveBeenCalled()
    expect(mockFetchPublicPage).not.toHaveBeenCalled()
    expect(mockPrisma.eventAssociation.create).not.toHaveBeenCalled()
    expect(mockPrisma.eventAssociation.delete).not.toHaveBeenCalled()
  })

  it("saves normalized, deduplicated social pages and drops empty rows", async () => {
    const result = await saveSocialLinks("e1", [
      "https://www.facebook.com/chateau/",
      " ",
      "http://facebook.com/chateau",
    ])

    expect(result.success).toBe(true)
    expect(mockPrisma.event.update).toHaveBeenCalledWith({
      where: { id: "e1" },
      data: { socialLinks: ["https://facebook.com/chateau"] },
    })
  })

  it("rejects links that are not a social page", async () => {
    const result = await saveSocialLinks("e1", ["https://chateau.fr", "https://x.com/chateau"])

    expect(result.success).toBe(false)
    expect(result.errors?.socialLinks).toEqual(["Lien non reconnu : https://chateau.fr"])
    expect(mockPrisma.event.update).not.toHaveBeenCalled()
  })

  it("suggests the pages found on the official website without saving them", async () => {
    mockFetchPublicPage.mockResolvedValue({ url: "https://chateau.fr/", html: SITE_HTML })

    const result = await findSocialLinks("e1")

    expect(result.success).toBe(true)
    expect(result.links).toHaveLength(2)
    expect(mockPrisma.event.update).toHaveBeenCalledWith({
      where: { id: "e1" },
      data: { socialLinksCheckedAt: expect.any(Date) },
    })
  })

  it("explains when the site has no official website", async () => {
    mockPrisma.event.findUnique.mockResolvedValue({ website: null })

    const result = await findSocialLinks("e1")

    expect(result.success).toBe(false)
    expect(mockFetchPublicPage).not.toHaveBeenCalled()
  })

  it("bulk search saves found pages and marks every site of the batch as searched", async () => {
    mockPrisma.event.findMany.mockResolvedValue([
      { id: "e1", slug: "a", website: "https://a.fr" },
      { id: "e2", slug: "b", website: "https://b.fr" },
    ])
    mockFetchPublicPage
      .mockResolvedValueOnce({ url: "https://a.fr/", html: SITE_HTML })
      .mockRejectedValueOnce(new Error("timeout"))
    mockPrisma.event.count.mockResolvedValue(3)

    const result = await findMissingSocialLinks()

    expect(result).toMatchObject({ success: true, processed: 2, found: 1, remaining: 3 })
    expect(mockPrisma.event.update).toHaveBeenCalledWith({
      where: { id: "e1" },
      data: { socialLinksCheckedAt: expect.any(Date), socialLinks: expect.any(Array) },
    })
    expect(mockPrisma.event.update).toHaveBeenCalledWith({
      where: { id: "e2" },
      data: { socialLinksCheckedAt: expect.any(Date) },
    })
  })

  it("appends an association after the last one, without empty optional fields", async () => {
    const result = await addAssociation("e1", { name: "  Les Amis du château ", url: "", logo: "" })

    expect(result.success).toBe(true)
    expect(mockPrisma.eventAssociation.create).toHaveBeenCalledWith({
      data: { name: "Les Amis du château", url: null, logo: null, eventId: "e1", order: 3 },
    })
  })

  it("rejects an invalid association link or logo", async () => {
    const result = await addAssociation("e1", {
      name: "Amis",
      url: "javascript:alert(1)",
      logo: "https://evil.example/logo.png",
    })

    expect(result.success).toBe(false)
    expect(Object.keys(result.errors ?? {})).toEqual(expect.arrayContaining(["url", "logo"]))
    expect(mockPrisma.eventAssociation.create).not.toHaveBeenCalled()
  })

  it("updates and deletes an association", async () => {
    expect(
      (
        await updateAssociation("a1", {
          name: "Amis",
          url: "https://amis.fr",
          logo: "/uploads/logo.webp",
        })
      ).success
    ).toBe(true)
    expect(mockPrisma.eventAssociation.update).toHaveBeenCalledWith({
      where: { id: "a1" },
      data: { name: "Amis", url: "https://amis.fr", logo: "/uploads/logo.webp" },
      select: { eventId: true },
    })
    expect((await deleteAssociation("a1")).success).toBe(true)
  })
})
