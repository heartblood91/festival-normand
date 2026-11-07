import type { SyncStatus } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { fetchSyndication } from "@/lib/tourinsoft/client"
import { mapOffer, type MappedOffer, type MappedPhoto } from "@/lib/tourinsoft/map"
import type { TourinsoftOffer } from "@/lib/tourinsoft/types"
import { uploadImageFromUrl } from "@/lib/storage"
import { isAiConfigured, translateText } from "@/lib/ai/openrouter"
import { geocodeNormandyAddress } from "@/lib/geo/geocode"
import { isInNormandyBounds } from "@/lib/geo/normandy"

export const TOURINSOFT_SOURCE = "tourinsoft"

// A run that never finished (crash, redeploy) stops blocking new runs after this.
const STALE_RUN_MS = 30 * 60 * 1000

export type SyncTrigger = "cron" | "scheduler" | "manual" | "cli"

export type SyncStats = {
  total: number
  created: number
  updated: number
  skipped: number
  failed: number
}

export type SyncRunResult =
  | { status: "skipped"; reason: "already-running" }
  | { status: SyncStatus; runId: string; stats: SyncStats; error?: string }

type PersistedPhoto = { url: string; credit: string | null; title: string | null; order: number }

// Download an offer's photos onto our own storage. A failed photo is skipped,
// not fatal — the event keeps whatever photos succeeded.
const persistPhotos = async (photos: MappedPhoto[]): Promise<PersistedPhoto[]> => {
  const settled = await Promise.all(
    photos.map(async (photo): Promise<PersistedPhoto | null> => {
      try {
        const url = await uploadImageFromUrl(photo.url, "cover")
        return { url, credit: photo.credit, title: photo.title, order: photo.order }
      } catch (error) {
        console.error(`Tourinsoft photo download failed (${photo.url}):`, error)
        return null
      }
    })
  )
  return settled
    .filter((photo): photo is PersistedPhoto => photo !== null)
    .sort((a, b) => a.order - b.order)
}

// Tourinsoft is French-only. A failed or unconfigured translation is non-fatal:
// the EN field stays as it was and /en falls back to FR.
const translateToEn = async (text: string | null): Promise<string | null> => {
  if (!text || !isAiConfigured()) return null
  try {
    return await translateText(text, "fr", "en")
  } catch (error) {
    console.error("Tourinsoft EN translation failed:", error)
    return null
  }
}

type TranslatableField = "title" | "description" | "pricing"

type CurrentTexts = {
  titleFr: string
  titleEn: string | null
  descriptionFr: string
  descriptionEn: string | null
  pricingFr: string | null
  pricingEn: string | null
}

type EnglishFields = {
  titleEn?: string | null
  descriptionEn?: string | null
  pricingEn?: string | null
}

// Only (re)translate a field when its French source changed or no English exists,
// so manual EN corrections survive unrelated upstream updates.
export const translateChangedFields = async (
  mapped: Pick<MappedOffer, "titleFr" | "descriptionFr" | "pricingFr">,
  current: CurrentTexts | null
): Promise<EnglishFields> => {
  const fields: TranslatableField[] = ["title", "description", "pricing"]
  const entries = await Promise.all(
    fields.map(async (field) => {
      const fr = mapped[`${field}Fr`]
      const currentFr = current?.[`${field}Fr`] ?? null
      const currentEn = current?.[`${field}En`] ?? null
      if (current && fr === currentFr && currentEn) return null
      const en = await translateToEn(fr)
      // Keep the previous translation when the new one could not be produced.
      if (en === null && current && fr === currentFr) return null
      return [`${field}En`, en] as const
    })
  )
  return Object.fromEntries(entries.filter((entry) => entry !== null)) as EnglishFields
}

const withGeocodedCoordinates = async (mapped: MappedOffer): Promise<MappedOffer> => {
  if (isInNormandyBounds(mapped)) return mapped

  const coordinates = await geocodeNormandyAddress(mapped)
  return coordinates ? { ...mapped, ...coordinates } : mapped
}

// Two offers can share a title ("Visite nocturne"): suffix the slug instead of
// failing the create on the unique constraint.
export const ensureUniqueSlug = async (base: string): Promise<string> => {
  const taken = await prisma.event.findMany({
    where: { slug: { startsWith: base } },
    select: { slug: true },
  })
  const slugs = new Set(taken.map((event) => event.slug))
  if (!slugs.has(base)) return base
  let index = 2
  while (slugs.has(`${base}-${index}`)) index++
  return `${base}-${index}`
}

// New offer → published. Visibility before the festival is governed by the
// per-department embargo, not by this flag.
const createEvent = async (mapped: MappedOffer): Promise<void> => {
  const { photos: rawPhotos, slug, ...data } = mapped
  const [photos, en, uniqueSlug] = await Promise.all([
    persistPhotos(rawPhotos),
    translateChangedFields(mapped, null),
    ensureUniqueSlug(slug),
  ])
  await prisma.event.create({
    data: {
      ...data,
      ...en,
      slug: uniqueSlug,
      published: true,
      publishedAt: new Date(),
      coverImage: photos[0]?.url ?? null,
      photos: { create: photos },
    },
  })
}

// Known offer that changed upstream → overwrite Tourinsoft-owned fields. The slug
// is frozen (stable URLs) and `published` is never touched: editors unpublish,
// the sync never deletes nor unpublishes.
const updateEvent = async (mapped: MappedOffer, eventId: string): Promise<void> => {
  const { photos: rawPhotos, slug: _frozenSlug, ...data } = mapped
  const current = await prisma.event.findUniqueOrThrow({
    where: { id: eventId },
    select: {
      titleFr: true,
      titleEn: true,
      descriptionFr: true,
      descriptionEn: true,
      pricingFr: true,
      pricingEn: true,
    },
  })
  const [photos, en] = await Promise.all([
    persistPhotos(rawPhotos),
    translateChangedFields(mapped, current),
  ])
  await prisma.$transaction([
    prisma.photo.deleteMany({ where: { eventId } }),
    prisma.event.update({
      where: { id: eventId },
      data: {
        ...data,
        ...en,
        coverImage: photos[0]?.url ?? null,
        photos: { create: photos },
      },
    }),
  ])
}

// Reconcile the feed with our DB by `tourinsoftId`:
//   unknown → create · changed (Updated newer) → overwrite · unchanged → skip
// Events missing from the feed are left untouched.
// `limit` caps create+update operations per run (skips are free).
export const reconcileOffers = async (
  offers: TourinsoftOffer[],
  limit: number = Infinity
): Promise<SyncStats> => {
  const existing = await prisma.event.findMany({
    where: { tourinsoftId: { not: null } },
    select: { id: true, tourinsoftId: true, tourinsoftUpdatedAt: true },
  })
  const byTourinsoftId = new Map(existing.map((event) => [event.tourinsoftId, event]))

  const stats: SyncStats = { total: offers.length, created: 0, updated: 0, skipped: 0, failed: 0 }

  for (const offer of offers) {
    if (stats.created + stats.updated >= limit) break
    try {
      const mapped = await withGeocodedCoordinates(mapOffer(offer))
      const current = byTourinsoftId.get(mapped.tourinsoftId)
      if (!current) {
        await createEvent(mapped)
        stats.created++
      } else if (
        current.tourinsoftUpdatedAt &&
        mapped.tourinsoftUpdatedAt &&
        mapped.tourinsoftUpdatedAt <= current.tourinsoftUpdatedAt
      ) {
        stats.skipped++
      } else {
        await updateEvent(mapped, current.id)
        stats.updated++
      }
    } catch (error) {
      stats.failed++
      console.error(`Tourinsoft sync failed for ${offer.SyndicObjectID}:`, error)
    }
  }

  return stats
}

const statusFromStats = (stats: SyncStats): SyncStatus => {
  if (stats.failed === 0) return "SUCCESS"
  return stats.created + stats.updated + stats.skipped > 0 ? "PARTIAL" : "FAILED"
}

// Records the run in `sync_runs` and refuses to overlap with a live run, so the
// Vercel cron, the self-hosted scheduler and manual calls can coexist safely.
export const runTourinsoftSync = async ({
  trigger,
  limit = Infinity,
  fetchOffers = fetchSyndication,
}: {
  trigger: SyncTrigger
  limit?: number
  fetchOffers?: () => Promise<TourinsoftOffer[]>
}): Promise<SyncRunResult> => {
  const running = await prisma.syncRun.findFirst({
    where: {
      source: TOURINSOFT_SOURCE,
      status: "RUNNING",
      startedAt: { gt: new Date(Date.now() - STALE_RUN_MS) },
    },
    select: { id: true },
  })
  if (running) return { status: "skipped", reason: "already-running" }

  const run = await prisma.syncRun.create({
    data: { source: TOURINSOFT_SOURCE, trigger },
    select: { id: true },
  })

  try {
    const offers = await fetchOffers()
    const stats = await reconcileOffers(offers, limit)
    const status = statusFromStats(stats)
    await prisma.syncRun.update({
      where: { id: run.id },
      data: { ...stats, status, finishedAt: new Date() },
    })
    return { status, runId: run.id, stats }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    await prisma.syncRun.update({
      where: { id: run.id },
      data: { status: "FAILED", finishedAt: new Date(), error: message.slice(0, 500) },
    })
    const stats: SyncStats = { total: 0, created: 0, updated: 0, skipped: 0, failed: 0 }
    return { status: "FAILED", runId: run.id, stats, error: message }
  }
}

export type SyncRunSummary = {
  status: SyncStatus
  trigger: string
  startedAt: Date
  finishedAt: Date | null
  total: number
  created: number
  updated: number
  skipped: number
  failed: number
}

export const getLastTourinsoftRun = async (): Promise<SyncRunSummary | null> =>
  prisma.syncRun.findFirst({
    where: { source: TOURINSOFT_SOURCE },
    orderBy: { startedAt: "desc" },
    select: {
      status: true,
      trigger: true,
      startedAt: true,
      finishedAt: true,
      total: true,
      created: true,
      updated: true,
      skipped: true,
      failed: true,
    },
  })
