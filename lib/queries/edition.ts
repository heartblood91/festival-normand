import { Prisma } from "@prisma/client"
import { cachedQuery } from "@/lib/cache"
import { prisma } from "@/lib/prisma"
import {
  DEFAULT_EDITION_SETTINGS,
  buildEdition,
  type Edition,
  type EditionSettings,
} from "@/lib/festival/edition"

const toIsoDate = (date: Date) => date.toISOString().slice(0, 10)

const isMissingTable = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021"

/** Saved settings of the latest edition, or the code default. */
export const getEditionSettings = async (): Promise<EditionSettings> => {
  try {
    const row = await prisma.edition.findFirst({ orderBy: { year: "desc" } })
    if (!row) return DEFAULT_EDITION_SETTINGS
    return {
      year: row.year,
      dateStart: toIsoDate(row.dateStart),
      dateEnd: toIsoDate(row.dateEnd),
      bilanFrom: row.bilanFrom ? toIsoDate(row.bilanFrom) : null,
    }
  } catch (error) {
    // A deploy whose migration has not run yet keeps serving the default edition.
    if (isMissingTable(error)) return DEFAULT_EDITION_SETTINGS
    throw error
  }
}

export const getCurrentEdition = async (): Promise<Edition> =>
  cachedQuery(async () => buildEdition(await getEditionSettings()), ["current-edition"], {
    revalidate: 3600,
    tags: ["edition"],
  })()
