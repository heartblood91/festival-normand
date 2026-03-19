import { cachedQuery } from "@/lib/cache"
import { prisma } from "@/lib/prisma"
import { localizeEntity } from "@/lib/i18n/db"
import type { Locale } from "@/lib/i18n/config"

export const getPageBySlug = async (slug: string, locale: Locale = "fr") => {
  return cachedQuery(
    async () => {
      const page = await prisma.page.findUnique({
        where: { slug },
        select: {
          id: true,
          slug: true,
          titleFr: true,
          titleEn: true,
          contentFr: true,
          contentEn: true,
          createdAt: true,
          updatedAt: true,
        },
      })
      if (!page) return null
      return {
        ...localizeEntity(page, locale, ["title", "content"]),
        createdAt: page.createdAt.toISOString(),
        updatedAt: page.updatedAt.toISOString(),
      }
    },
    ["page", slug, locale],
    { revalidate: 86400, tags: ["pages"] }
  )()
}

export type PageDetail = NonNullable<Awaited<ReturnType<typeof getPageBySlug>>>
