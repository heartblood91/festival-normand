import type { Prisma } from "@prisma/client"

/** A theme without years is shown every edition; otherwise only the listed years. */
export const isThemeActive = (years: readonly number[], year: number) =>
  years.length === 0 || years.includes(year)

export const activeThemeWhere = (year: number): Prisma.ThemeWhereInput => ({
  OR: [{ years: { isEmpty: true } }, { years: { has: year } }],
})

const YEAR = /^\d{4}$/

/** "2027, 2028" → [2027, 2028]; null when a token is not a plausible festival year. */
export const parseThemeYears = (input: string): number[] | null => {
  const tokens = input
    .split(/[\s,;]+/)
    .map((token) => token.trim())
    .filter(Boolean)
  if (!tokens.every((token) => YEAR.test(token))) return null
  const years = tokens.map(Number)
  if (!years.every((year) => year >= 2009 && year <= 2100)) return null
  return [...new Set(years)].sort((a, b) => a - b)
}
