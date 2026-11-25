import { Prisma } from "@prisma/client"
import { cachedQuery } from "@/lib/cache"
import { prisma } from "@/lib/prisma"
import {
  PASS_SETTINGS_KEY,
  parsePassSettings,
  type PassPatrimoineSettings,
} from "@/lib/site-settings/pass-patrimoine"

const isMissingTable = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021"

/** Raw JSON of a settings group; null when the row (or the table) does not exist yet. */
const readSiteSetting = async (key: string): Promise<unknown> => {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key } })
    return row?.value ?? null
  } catch (error) {
    // A deploy whose migration has not run yet keeps every feature off.
    if (isMissingTable(error)) return null
    throw error
  }
}

/** Uncached: the admin form must show what is saved right now. */
export const getPassSettingsForAdmin = async (): Promise<PassPatrimoineSettings> =>
  parsePassSettings(await readSiteSetting(PASS_SETTINGS_KEY))

export const getPassSettings = async (): Promise<PassPatrimoineSettings> =>
  cachedQuery(getPassSettingsForAdmin, ["site-settings", PASS_SETTINGS_KEY], {
    revalidate: 300,
    tags: ["settings"],
  })()
