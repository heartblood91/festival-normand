import type { Category, Department, Prisma } from "@prisma/client"
import { missingAltMessage } from "@/lib/admin/alt-text"
import { toLocalDateInput } from "@/lib/admin/form-status"

const STATUSES = ["published", "draft", "depublished"] as const
const SOURCES = ["tourinsoft", "manual"] as const
const PERIODS = ["upcoming", "past"] as const
const TODOS = ["missing-en", "missing-alt", "missing-gps"] as const
const SORTS = ["date-asc", "date-desc", "title"] as const

export type EventListTodo = (typeof TODOS)[number]
export type EventListSort = (typeof SORTS)[number]

export type EventListParams = {
  search?: string
  status?: (typeof STATUSES)[number]
  department?: string
  category?: string
  featured?: "true" | "false"
  source?: (typeof SOURCES)[number]
  when?: (typeof PERIODS)[number]
  todo?: EventListTodo
  sort?: EventListSort
  page?: number
}

type RawParams = Record<string, string | undefined>

const pick = <T extends string>(allowed: readonly T[], value: string | undefined) =>
  allowed.includes(value as T) ? (value as T) : undefined

/** Normalizes the list's query string; unknown values are ignored. */
export const parseEventListParams = (raw: RawParams): EventListParams => {
  const page = Number.parseInt(raw.page ?? "", 10)
  const params: EventListParams = {
    search: raw.search?.trim() || undefined,
    status: pick(STATUSES, raw.status),
    department: raw.department || undefined,
    category: raw.category || undefined,
    featured: pick(["true", "false"], raw.featured),
    source: pick(SOURCES, raw.source),
    when: pick(PERIODS, raw.when),
    todo: pick(TODOS, raw.todo),
    sort: pick(SORTS, raw.sort),
    page: page > 0 ? page : 1,
  }
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined)
  ) as EventListParams
}

const blank = (field: "titleEn" | "descriptionEn" | "coverImageAltFr") => [
  { [field]: null },
  { [field]: "" },
]

const TODO_CLAUSES: Record<EventListTodo, Prisma.EventWhereInput[]> = {
  "missing-en": [{ OR: [...blank("titleEn"), ...blank("descriptionEn")] }],
  "missing-alt": [{ coverImage: { not: null } }, { OR: blank("coverImageAltFr") }],
  "missing-gps": [{ OR: [{ latitude: null }, { longitude: null }] }],
}

/** Today in Paris at UTC midnight, the convention of stored event dates. */
export const parisToday = (now = new Date()) => new Date(`${toLocalDateInput(now)}T00:00:00.000Z`)

/**
 * Prisma filter for the admin list and the dashboard counters. `today` is the
 * Paris calendar day at UTC midnight, like stored event dates.
 */
export const eventListWhere = (
  params: EventListParams,
  today: Date,
  searchIds?: string[]
): Prisma.EventWhereInput => {
  const where: Prisma.EventWhereInput = {}
  const and: Prisma.EventWhereInput[] = []

  if (params.status === "published") where.published = true
  if (params.status === "draft") {
    Object.assign(where, { published: false, publishedAt: null, unpublishedAt: null })
  }
  if (params.status === "depublished") {
    Object.assign(where, { published: false, unpublishedAt: { not: null } })
  }
  if (params.department) where.department = params.department as Department
  if (params.category) where.category = params.category as Category
  if (params.featured) where.featured = params.featured === "true"
  if (params.source === "tourinsoft") where.tourinsoftId = { not: null }
  if (params.source === "manual") where.tourinsoftId = null
  if (params.when) {
    const op = params.when === "upcoming" ? "gte" : "lt"
    and.push({
      OR: [{ dateEnd: { [op]: today } }, { dateEnd: null, dateStart: { [op]: today } }],
    })
  }
  if (params.todo) and.push(...TODO_CLAUSES[params.todo])
  if (searchIds) where.id = { in: searchIds }
  if (and.length) where.AND = and

  return where
}

export const eventListOrderBy = (
  sort: EventListSort | undefined
): Prisma.EventOrderByWithRelationInput[] => {
  switch (sort) {
    case "date-asc":
      return [{ dateStart: "asc" }, { titleFr: "asc" }]
    case "date-desc":
      return [{ dateStart: "desc" }, { titleFr: "asc" }]
    case "title":
      return [{ titleFr: "asc" }]
    default:
      return [{ createdAt: "desc" }]
  }
}

/**
 * List URL keeping every current filter. Any change returns to page 1 unless
 * the change is the page itself; empty and "all" values are dropped.
 */
export const buildListUrl = (
  baseUrl: string,
  current: Record<string, string | number | undefined>,
  changes: Record<string, string | number | undefined>
): string => {
  const merged = { ...current, page: undefined, ...changes }
  const query = new URLSearchParams()
  Object.entries(merged).forEach(([key, value]) => {
    if (value === undefined || value === "" || value === "all") return
    if (key === "page" && Number(value) <= 1) return
    query.set(key, String(value))
  })
  const qs = query.toString()
  return qs ? `${baseUrl}?${qs}` : baseUrl
}

/** Why bulk publishing must skip this event, or null when it may go live. */
export const publishBlocker = (event: {
  coverImage: string | null
  coverImageAltFr: string | null
  descriptionFr: string
  descriptionEn?: string | null
}): string | null => {
  if (event.coverImage && !event.coverImageAltFr?.trim()) {
    return "image de couverture sans texte alternatif"
  }
  return (
    missingAltMessage(event.descriptionFr) || missingAltMessage(event.descriptionEn ?? "") || null
  )
}
