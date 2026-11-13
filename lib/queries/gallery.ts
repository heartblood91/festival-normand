import { cachedQuery } from "@/lib/cache"
import { prisma } from "@/lib/prisma"
import type { Locale } from "@/lib/i18n/config"

export type PublicGalleryPhoto = {
  id: string
  url: string
  alt: string
  credit: string | null
}

// A photo without a text alternative is a draft: it never reaches the public site.
const published = { altFr: { not: "" } }

/** Years that have at least one published photo, most recent first. */
export const getGalleryYears = cachedQuery(
  async (): Promise<number[]> => {
    const rows = await prisma.galleryPhoto.groupBy({
      by: ["year"],
      where: published,
      orderBy: { year: "desc" },
    })
    return rows.map((row) => row.year)
  },
  ["gallery-years"],
  { revalidate: 86400, tags: ["gallery"] }
)

export const getGalleryPhotos = (year: number, locale: Locale, limit?: number) =>
  cachedQuery(
    async (): Promise<PublicGalleryPhoto[]> => {
      const photos = await prisma.galleryPhoto.findMany({
        where: { year, ...published },
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        take: limit,
        select: { id: true, url: true, altFr: true, altEn: true, credit: true },
      })
      return photos.map((photo) => ({
        id: photo.id,
        url: photo.url,
        alt: locale === "en" && photo.altEn ? photo.altEn : photo.altFr,
        credit: photo.credit,
      }))
    },
    ["gallery-photos", String(year), locale, String(limit ?? "all")],
    { revalidate: 86400, tags: ["gallery"] }
  )()
