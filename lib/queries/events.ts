import { prisma } from "@/lib/prisma"
import type { Department, Category, Prisma } from "@prisma/client"

const ITEMS_PER_PAGE = 12

export type EventFilters = {
  search?: string
  date?: string
  category?: Category
  department?: Department
  accessible?: boolean
  page?: number
}

export const getEvents = async (filters: EventFilters = {}) => {
  const { search, date, category, department, accessible, page = 1 } = filters
  const skip = (page - 1) * ITEMS_PER_PAGE

  const where: Prisma.EventWhereInput = {
    published: true,
  }

  if (category) {
    where.category = category
  }

  if (department) {
    where.department = department
  }

  if (accessible) {
    where.accessible = true
  }

  if (date) {
    const dateMap: Record<string, string> = {
      "29": "2026-05-29",
      "30": "2026-05-30",
      "31": "2026-05-31",
    }
    const dateStr = dateMap[date]
    if (dateStr) {
      const dayStart = new Date(`${dateStr}T00:00:00`)
      const dayEnd = new Date(`${dateStr}T23:59:59`)
      where.dateStart = { lte: dayEnd }
      where.OR = [
        { dateEnd: { gte: dayStart } },
        { dateEnd: null, dateStart: { gte: dayStart } },
      ]
    }
  }

  if (search) {
    const searchLower = search.toLowerCase()
    where.AND = [
      ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
      {
        OR: [
          { title: { contains: searchLower, mode: "insensitive" } },
          { city: { contains: searchLower, mode: "insensitive" } },
          { location: { contains: searchLower, mode: "insensitive" } },
        ],
      },
    ]
  }

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy: { dateStart: "asc" },
      skip,
      take: ITEMS_PER_PAGE,
      select: {
        id: true,
        title: true,
        slug: true,
        location: true,
        city: true,
        department: true,
        category: true,
        dateStart: true,
        timeStart: true,
        timeEnd: true,
        coverImage: true,
        accessible: true,
      },
    }),
    prisma.event.count({ where }),
  ])

  return {
    events,
    total,
    page,
    totalPages: Math.ceil(total / ITEMS_PER_PAGE),
    itemsPerPage: ITEMS_PER_PAGE,
  }
}

export type EventListItem = Awaited<ReturnType<typeof getEvents>>["events"][number]

export const getEventBySlug = async (slug: string) => {
  return prisma.event.findUnique({
    where: { slug, published: true },
  })
}

export type EventDetail = NonNullable<Awaited<ReturnType<typeof getEventBySlug>>>
