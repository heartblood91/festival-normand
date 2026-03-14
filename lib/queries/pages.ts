import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"

export const getPageBySlug = async (slug: string) => {
  return unstable_cache(
    async () => {
      return prisma.page.findUnique({
        where: { slug },
      })
    },
    ["page", slug],
    { revalidate: 86400, tags: ["pages"] }
  )()
}

export type PageDetail = NonNullable<Awaited<ReturnType<typeof getPageBySlug>>>
