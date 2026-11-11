import type { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { correctImportedTexts } from "@/lib/ai/correct-texts"
import { translateChangedFields } from "@/lib/tourinsoft/sync"

// Imported events (Tourinsoft or v1 recovery) whose texts were never proofread.
const PENDING: Prisma.EventWhereInput = { tourinsoftId: { not: null }, textsCorrectedAt: null }

export type TextCorrectionReport = {
  corrected: number
  unchanged: number
  failed: number
  remaining: number
  slugs: string[]
}

export const countPendingTextCorrections = () => prisma.event.count({ where: PENDING })

/**
 * Proofreads the next `limit` imported events. The current text is corrected,
 * not the source, so an editor's earlier changes are kept; the source stays as
 * imported for the sync to compare against. A model error leaves the event
 * pending for the next batch.
 */
export const correctPendingTexts = async (limit: number): Promise<TextCorrectionReport> => {
  const events = await prisma.event.findMany({
    where: PENDING,
    orderBy: [{ dateStart: "asc" }, { id: "asc" }],
    take: limit,
    select: {
      id: true,
      slug: true,
      titleFr: true,
      titleEn: true,
      descriptionFr: true,
      descriptionEn: true,
      pricingFr: true,
      pricingEn: true,
      sourceTitleFr: true,
      sourceDescriptionFr: true,
    },
  })

  const report: TextCorrectionReport = {
    corrected: 0,
    unchanged: 0,
    failed: 0,
    remaining: 0,
    slugs: [],
  }

  for (const event of events) {
    try {
      const corrected = await correctImportedTexts({
        title: event.titleFr,
        description: event.descriptionFr,
      })
      const texts = { titleFr: corrected.title, descriptionFr: corrected.description }
      const changed =
        texts.titleFr !== event.titleFr || texts.descriptionFr !== event.descriptionFr
      const en = changed
        ? await translateChangedFields({ ...texts, pricingFr: event.pricingFr }, event)
        : {}
      await prisma.event.update({
        where: { id: event.id },
        data: {
          ...texts,
          ...en,
          sourceTitleFr: event.sourceTitleFr ?? event.titleFr,
          sourceDescriptionFr: event.sourceDescriptionFr ?? event.descriptionFr,
          textsCorrectedAt: new Date(),
        },
      })
      if (changed) {
        report.corrected++
        report.slugs.push(event.slug)
      } else {
        report.unchanged++
      }
    } catch (error) {
      report.failed++
      console.error(`Text correction failed for event ${event.id}:`, error)
    }
  }

  report.remaining = await countPendingTextCorrections()
  return report
}
