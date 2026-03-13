import { describe, it, expect, vi, beforeEach } from "vitest"
import { prismaMock } from "@/lib/test-utils"

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}))

import { getPageBySlug } from "@/lib/queries/pages"

beforeEach(() => {
  vi.clearAllMocks()
})

const mockPage = {
  id: "1",
  title: "Le Festival Pierres en Lumières",
  slug: "festival",
  content: "# Le Festival\n\nContenu du festival.",
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-03-01"),
}

describe("getPageBySlug", () => {
  it("returns page by slug", async () => {
    prismaMock.page.findUnique.mockResolvedValue(mockPage)

    const result = await getPageBySlug("festival")

    expect(result).toEqual(mockPage)
    expect(prismaMock.page.findUnique).toHaveBeenCalledWith({
      where: { slug: "festival" },
    })
  })

  it("returns null for non-existent slug", async () => {
    prismaMock.page.findUnique.mockResolvedValue(null)

    const result = await getPageBySlug("non-existent")

    expect(result).toBeNull()
  })
})
