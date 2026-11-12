import { Prisma } from "@prisma/client"
import { cachedQuery } from "@/lib/cache"
import { prisma } from "@/lib/prisma"
import { activeThemeWhere } from "@/lib/themes/active"
import { isSkinKey, type SkinKey } from "@/lib/skins/registry"

export type ActiveSkin = { key: SkinKey; themeSlug: string; logo: string | null }

const isMissingColumn = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError &&
  (error.code === "P2021" || error.code === "P2022")

/**
 * Skin of the first theme shown this year that names a known skin. Runs in the
 * public layout, so a database not yet migrated renders the regular site.
 */
export const getActiveSkin = async (year: number): Promise<ActiveSkin | null> =>
  cachedQuery(
    async () => {
      try {
        const themes = await prisma.theme.findMany({
          where: { skin: { not: null }, ...activeThemeWhere(year) },
          orderBy: [{ order: "asc" }, { nameFr: "asc" }],
          select: { slug: true, skin: true, skinLogo: true },
        })
        const theme = themes.find((candidate) => isSkinKey(candidate.skin))
        return theme && isSkinKey(theme.skin)
          ? { key: theme.skin, themeSlug: theme.slug, logo: theme.skinLogo }
          : null
      } catch (error) {
        if (isMissingColumn(error)) return null
        throw error
      }
    },
    ["active-skin", String(year)],
    { revalidate: 300, tags: ["themes"] }
  )()
