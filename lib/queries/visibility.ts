import type { Department, Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"

export const getEmbargoedDepartments = async (now: Date = new Date()): Promise<Department[]> => {
  const settings = await prisma.departmentSetting.findMany({
    where: { publishFrom: { gt: now } },
    select: { department: true },
  })
  return settings.map((setting) => setting.department)
}

// Base filter of every public event query. Before a department's publication
// date (M1 embargo), its upcoming Tourinsoft imports stay hidden; manual events
// and past editions are unaffected. Wrapped in AND so callers can still spread
// their own NOT/OR conditions.
export const publicEventWhere = async (now: Date = new Date()): Promise<Prisma.EventWhereInput> => {
  const embargoed = await getEmbargoedDepartments(now)
  if (embargoed.length === 0) return { published: true }
  return {
    published: true,
    AND: [
      {
        NOT: {
          tourinsoftId: { not: null },
          department: { in: embargoed },
          dateStart: { gte: now },
        },
      },
    ],
  }
}
