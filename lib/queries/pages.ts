import { prisma } from "@/lib/prisma"

export const getPageBySlug = async (slug: string) => {
  return prisma.page.findUnique({
    where: { slug },
  })
}

export type PageDetail = NonNullable<Awaited<ReturnType<typeof getPageBySlug>>>
