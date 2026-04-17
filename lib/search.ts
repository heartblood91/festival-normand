import { prisma } from "@/lib/prisma"

type SearchableTable = "events" | "news"

type SearchColumn = {
  table: SearchableTable
  columns: string[]
}

const EVENT_SEARCH_COLUMNS: SearchColumn = {
  table: "events",
  columns: ["title_fr", "title_en", "city", "location"],
}

const NEWS_SEARCH_COLUMNS: SearchColumn = {
  table: "news",
  columns: ["title_fr", "title_en"],
}

/**
 * Search for matching record IDs using PostgreSQL unaccent() for accent-insensitive search.
 * Falls back to ILIKE if unaccent is not available.
 */
const searchIds = async (config: SearchColumn, search: string): Promise<string[]> => {
  const conditions = config.columns.map((col) => `unaccent(${col}) ILIKE unaccent($1)`).join(" OR ")

  const query = `SELECT id FROM ${config.table} WHERE ${conditions}`
  const pattern = `%${search}%`

  const results = await prisma.$queryRawUnsafe<{ id: string }[]>(query, pattern)
  return results.map((r) => r.id)
}

export const searchEventIds = (search: string) => searchIds(EVENT_SEARCH_COLUMNS, search)

export const searchNewsIds = (search: string) => searchIds(NEWS_SEARCH_COLUMNS, search)
