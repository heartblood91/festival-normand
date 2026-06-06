import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { fetchSyndication } from "@/lib/tourinsoft/client"
import { mapOffer, type MappedOffer, type MappedPhoto } from "@/lib/tourinsoft/map"
import type { TourinsoftOffer } from "@/lib/tourinsoft/types"
import { uploadImageFromUrl } from "@/lib/storage"
import { translateContent } from "@/lib/actions/translate"

export const maxDuration = 300

// Vercel Cron sends `Authorization: Bearer ${CRON_SECRET}` automatically; the
// manual bootstrap call uses the same bearer.
const isAuthorized = (request: NextRequest): boolean => {
  const secret = process.env.CRON_SECRET
  return Boolean(secret) && request.headers.get("authorization") === `Bearer ${secret}`
}

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

// Tourinsoft is French-only. Auto-translate to EN via the LLM; a failed call is
// non-fatal — the field stays null and the site falls back to FR on /en.
const translateToEn = async (text: string | null): Promise<string | null> => {
  if (!text) return null
  try {
    return await translateContent(text, "fr", "en")
  } catch (error) {
    console.error("Tourinsoft EN translation failed:", error)
    return null
  }
}

type EnglishFields = { titleEn: string | null; descriptionEn: string | null; pricingEn: string | null }

const translateEvent = async (mapped: MappedOffer): Promise<EnglishFields> => {
  const [titleEn, descriptionEn, pricingEn] = await Promise.all([
    translateToEn(mapped.titleFr),
    translateToEn(mapped.descriptionFr),
    translateToEn(mapped.pricingFr),
  ])
  return { titleEn, descriptionEn, pricingEn }
}

// New offer → published immediately (no human validation).
const createEvent = async (mapped: MappedOffer): Promise<void> => {
  const { photos: rawPhotos, ...data } = mapped
  const [photos, en] = await Promise.all([persistPhotos(rawPhotos), translateEvent(mapped)])
  await prisma.event.create({
    data: {
      ...data,
      ...en,
      published: true,
      coverImage: photos[0]?.url ?? null,
      photos: { create: photos },
    },
  })
}

// Known offer that changed upstream → overwrite Tourinsoft-owned fields (even if
// edited locally). slug is frozen at creation (stable URLs) and `published` is
// left to the admin; photos and EN translations are regenerated wholesale.
const updateEvent = async (mapped: MappedOffer, eventId: string): Promise<void> => {
  const { photos: rawPhotos, slug: _frozenSlug, ...data } = mapped
  const [photos, en] = await Promise.all([persistPhotos(rawPhotos), translateEvent(mapped)])
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

type SyncStats = { total: number; created: number; updated: number; skipped: number; failed: number }

// Reconcile the feed with our DB by `tourinsoftId`:
//   unknown → create (published) · changed (Updated newer) → overwrite · unchanged → skip
// `limit` caps create+update operations per run (skips are free) — handy for bootstrap tests.
const reconcileOffers = async (offers: TourinsoftOffer[], limit: number): Promise<SyncStats> => {
  const existing = await prisma.event.findMany({
    where: { tourinsoftId: { not: null } },
    select: { id: true, tourinsoftId: true, tourinsoftUpdatedAt: true },
  })
  const byTourinsoftId = new Map(existing.map((event) => [event.tourinsoftId, event]))

  const stats: SyncStats = { total: offers.length, created: 0, updated: 0, skipped: 0, failed: 0 }

  for (const offer of offers) {
    if (stats.created + stats.updated >= limit) break
    try {
      const mapped = mapOffer(offer)
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

// Idempotent and re-callable, so it serves both the daily cron and the bootstrap.
// GET because Vercel Cron triggers endpoints with GET; idempotence keeps it safe.
export const GET = async (request: NextRequest) => {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const limitParam = Number(new URL(request.url).searchParams.get("limit"))
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? limitParam : Infinity

  const offers = await fetchSyndication()
  const stats = await reconcileOffers(offers, limit)

  return NextResponse.json(stats)
}
