// Recovery import of legacy v1 events into the new site's database. Never
// updates, unpublishes or deletes: it only creates what the target is missing.
import type { Department } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { createEventFromOffer, withGeocodedCoordinates } from "@/lib/tourinsoft/sync"
import type { MappedOffer } from "@/lib/tourinsoft/map"
import { mapDirectusEvent, toMatchSource } from "./map"
import { matchSources, type MatchVia } from "./match"
import type { DirectusEvent } from "./types"

export type DirectusImportOptions = {
  publish: boolean
  downloadPhotos: boolean
  translate: boolean
  dryRun: boolean
  limit: number
}

export type DirectusImportReport = {
  total: number
  knownById: number
  knownBySite: Partial<Record<MatchVia, number>>
  created: number
  failed: number
  planned: {
    tourinsoftId: string
    title: string
    city: string
    department: Department
    dateStart: string
  }[]
}

// Dedupe on the target first by Tourinsoft id (both sites import the same
// feed), then by site (title, commune, place) for events created by hand.
export const importDirectusEvents = async (
  events: DirectusEvent[],
  options: DirectusImportOptions
): Promise<DirectusImportReport> => {
  const report: DirectusImportReport = {
    total: events.length,
    knownById: 0,
    knownBySite: {},
    created: 0,
    failed: 0,
    planned: [],
  }

  const existing = await prisma.event.findMany({
    select: {
      id: true,
      tourinsoftId: true,
      titleFr: true,
      slug: true,
      city: true,
      latitude: true,
      longitude: true,
      dateStart: true,
    },
  })
  const knownIds = new Set(existing.map((event) => event.tourinsoftId).filter(Boolean))

  const fresh: { event: DirectusEvent; offer: MappedOffer }[] = []
  for (const event of events) {
    try {
      const offer = mapDirectusEvent(event)
      if (knownIds.has(offer.tourinsoftId)) {
        report.knownById++
        continue
      }
      knownIds.add(offer.tourinsoftId)
      fresh.push({ event, offer })
    } catch (error) {
      report.failed++
      console.error(
        `Directus event ${event.id} skipped:`,
        error instanceof Error ? error.message : error
      )
    }
  }

  const matches = matchSources(
    fresh.map(({ event }) => toMatchSource(event)),
    existing.map((event) => ({ ...event, title: event.titleFr }))
  )

  for (const [index, { offer }] of fresh.entries()) {
    const match = matches[index]
    if (match) {
      report.knownBySite[match.via] = (report.knownBySite[match.via] ?? 0) + 1
      continue
    }
    if (report.created + report.planned.length >= options.limit) continue
    if (options.dryRun) {
      report.planned.push({
        tourinsoftId: offer.tourinsoftId,
        title: offer.titleFr,
        city: offer.city,
        department: offer.department,
        dateStart: offer.dateStart.toISOString(),
      })
      continue
    }
    try {
      await createEventFromOffer(await withGeocodedCoordinates(offer), {
        published: options.publish,
        downloadPhotos: options.downloadPhotos,
        translate: options.translate,
      })
      report.created++
    } catch (error) {
      report.failed++
      console.error(`Directus event ${offer.tourinsoftId} import failed:`, error)
    }
  }

  return report
}
