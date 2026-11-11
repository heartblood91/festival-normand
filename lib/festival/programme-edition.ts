import type { Prisma } from "@prisma/client"

/** Which events the public programme lists: the current edition, earlier ones, or both. */
export type ProgrammeEdition = "current" | "past" | "all"

const EDITIONS: ProgrammeEdition[] = ["current", "past", "all"]

export const parseProgrammeEdition = (value: string | undefined): ProgrammeEdition | undefined =>
  EDITIONS.find((edition) => edition === value)

/**
 * Provisional default (design audit #8): the current edition. PROGRAMME_DEFAULT_EDITION=all
 * restores the former mixed list without a deploy of code.
 */
export const defaultProgrammeEdition = (): ProgrammeEdition =>
  parseProgrammeEdition(process.env.PROGRAMME_DEFAULT_EDITION) === "all" ? "all" : "current"

// The festival runs in May: an event belongs to the edition of its start year.
const editionStart = (year: number) => new Date(`${year}-01-01T00:00:00`)

/** Filter for one edition; null when every edition is listed. */
export const programmeEditionWhere = (
  edition: ProgrammeEdition,
  year: number
): Prisma.EventWhereInput | null => {
  if (edition === "current") {
    return { dateStart: { gte: editionStart(year) } }
  }
  if (edition === "past") return { dateStart: { lt: editionStart(year) } }
  return null
}

/** Year of the earlier edition an event belongs to, or null when it is current. */
export const archivedEditionYear = (
  dateStart: string | Date,
  year: number
): number | null => {
  const start = new Date(dateStart)
  return start < editionStart(year) ? start.getFullYear() : null
}
