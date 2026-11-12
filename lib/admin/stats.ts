import type { Category, Department } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { publicEventWhere } from "@/lib/queries/visibility"

// Internal helper for the admin stats page; the page checks the role first.

const DEPARTMENTS: Department[] = ["CALVADOS", "EURE", "MANCHE", "ORNE", "SEINE_MARITIME"]
const CATEGORIES: Category[] = ["ILLUMINATIONS", "EXPOSITIONS", "ANIMATIONS", "VISITES"]

export const getSiteStats = async (now: Date = new Date()) => {
  const visible = await publicEventWhere(now)
  const count = (where: object = {}) => prisma.event.count({ where: { AND: [visible, where] } })

  const [
    total,
    byDepartment,
    byCategory,
    withPhoto,
    withEnglish,
    withGps,
    withCommunity,
    reviews,
    pendingReviews,
    surveys,
    galleryPhotos,
  ] = await Promise.all([
    count(),
    prisma.event.groupBy({ by: ["department"], where: visible, _count: { _all: true } }),
    prisma.event.groupBy({ by: ["category"], where: visible, _count: { _all: true } }),
    count({ OR: [{ coverImage: { not: null } }, { photos: { some: {} } }] }),
    count({ titleEn: { not: null }, descriptionEn: { not: null } }),
    count({ latitude: { not: null }, longitude: { not: null } }),
    count({ OR: [{ socialLinks: { isEmpty: false } }, { associations: { some: {} } }] }),
    prisma.eventReview.aggregate({
      where: { status: "APPROVED" },
      _count: { _all: true },
      _avg: { rating: true },
    }),
    prisma.eventReview.count({ where: { status: "PENDING" } }),
    prisma.survey.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, titleFr: true, published: true, _count: { select: { responses: true } } },
    }),
    prisma.galleryPhoto.count(),
  ])

  const departmentCount = new Map(byDepartment.map((row) => [row.department, row._count._all]))
  const categoryCount = new Map(byCategory.map((row) => [row.category, row._count._all]))

  return {
    total,
    byDepartment: DEPARTMENTS.map((key) => ({ key, count: departmentCount.get(key) ?? 0 })),
    byCategory: CATEGORIES.map((key) => ({ key, count: categoryCount.get(key) ?? 0 })),
    completeness: { withPhoto, withEnglish, withGps, withCommunity },
    reviews: {
      published: reviews._count._all,
      average: reviews._avg.rating,
      pending: pendingReviews,
    },
    surveys: surveys.map((survey) => ({
      id: survey.id,
      title: survey.titleFr,
      published: survey.published,
      responses: survey._count.responses,
    })),
    galleryPhotos,
  }
}

export type SiteStats = Awaited<ReturnType<typeof getSiteStats>>
