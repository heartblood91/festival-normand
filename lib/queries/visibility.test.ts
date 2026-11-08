import { describe, it, expect, vi, beforeEach } from "vitest"

const { findMany } = vi.hoisted(() => ({ findMany: vi.fn() }))
vi.mock("@/lib/prisma", () => ({ prisma: { departmentSetting: { findMany } } }))

import { getEmbargoedDepartments, publicEventWhere } from "./visibility"

const now = new Date("2027-02-01T10:00:00Z")

describe("department embargo", () => {
  beforeEach(() => {
    findMany.mockReset()
  })

  it("only lists departments whose publication date is still in the future", async () => {
    findMany.mockResolvedValue([{ department: "CALVADOS" }])
    expect(await getEmbargoedDepartments(now)).toEqual(["CALVADOS"])
    expect(findMany).toHaveBeenCalledWith({
      where: { publishFrom: { gt: now } },
      select: { department: true },
    })
  })

  it("is just `published` when no department is embargoed", async () => {
    findMany.mockResolvedValue([])
    expect(await publicEventWhere(now)).toEqual({ published: true })
  })

  it("hides upcoming Tourinsoft events of embargoed departments only", async () => {
    findMany.mockResolvedValue([{ department: "CALVADOS" }, { department: "ORNE" }])
    expect(await publicEventWhere(now)).toEqual({
      published: true,
      AND: [
        {
          NOT: {
            tourinsoftId: { not: null },
            department: { in: ["CALVADOS", "ORNE"] },
            dateStart: { gte: now },
          },
        },
      ],
    })
  })
})
