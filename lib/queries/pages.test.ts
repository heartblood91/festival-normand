import { describe, it, expect, vi, beforeEach } from "vitest"
import { prismaMock } from "@/lib/test-utils"

vi.mock("next/cache", () => ({
  unstable_cache: (fn: Function) => fn,
}))

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}))

import { getPageBySlug } from "@/lib/queries/pages"

beforeEach(() => {
  vi.clearAllMocks()
})

const mockPage = {
  id: "1",
  titleFr: "Le Festival Pierres en Lumières",
  titleEn: null,
  slug: "festival",
  contentFr: "# Le Festival\n\nContenu du festival.",
  contentEn: null,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-03-01"),
}

describe("getPageBySlug", () => {
  it("returns page by slug", async () => {
    prismaMock.page.findUnique.mockResolvedValue(mockPage)

    const result = await getPageBySlug("festival", "fr")

    expect(result).not.toBeNull()
    expect(prismaMock.page.findUnique).toHaveBeenCalledWith({
      where: { slug: "festival" },
      select: expect.objectContaining({
        id: true,
        slug: true,
        titleFr: true,
        titleEn: true,
        contentFr: true,
        contentEn: true,
        createdAt: true,
        updatedAt: true,
      }),
    })
  })

  it("returns null for non-existent slug", async () => {
    prismaMock.page.findUnique.mockResolvedValue(null)

    const result = await getPageBySlug("non-existent", "fr")

    expect(result).toBeNull()
  })
})
