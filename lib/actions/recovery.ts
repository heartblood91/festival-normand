"use server"

import { revalidatePath } from "next/cache"
import { requireRole } from "@/lib/rbac"
import { fetchDirectusEvents } from "@/lib/directus/client"
import { importDirectusEvents } from "@/lib/directus/import"
import { directusEdition, directusTourinsoftId } from "@/lib/directus/map"
import type { DirectusEvent } from "@/lib/directus/types"

// Each import geocodes, translates and may download photos: keep a click short.
const BATCH_SIZE = 20

export type RecoveryActionResult = {
  success: boolean
  message: string
  created?: number
  failed?: number
}

const ofEdition = (events: DirectusEvent[], year: string) =>
  events.filter((event) => event.status === "published" && directusEdition(event) === year)

const plural = (count: number, word: string) => `${count} ${word}${count > 1 ? "s" : ""}`

/** Dry run against v1 (public GETs): what this database is missing, nothing written. */
export const previewLegacyRecovery = async (year: string) => {
  await requireRole("EDITOR")
  const events = await fetchDirectusEvents()
  const years = [
    ...new Set(
      events
        .filter((event) => event.status === "published")
        .map(directusEdition)
        .filter((value): value is string => Boolean(value))
    ),
  ].sort((a, b) => b.localeCompare(a))
  const report = await importDirectusEvents(ofEdition(events, year), {
    publish: false,
    downloadPhotos: false,
    translate: false,
    dryRun: true,
    limit: Infinity,
  })
  return { year, years, ...report }
}

/** Creates the ticked v1 sites as drafts. Never updates, unpublishes or deletes. */
export const recoverLegacyEvents = async (
  _previous: RecoveryActionResult | null,
  formData: FormData
): Promise<RecoveryActionResult> => {
  try {
    await requireRole("EDITOR")

    const year = String(formData.get("year") ?? "")
    if (!/^\d{4}$/.test(year)) throw new Error("Édition invalide.")
    const ids = new Set(formData.getAll("tourinsoftId").map(String).filter(Boolean))
    if (ids.size === 0) return { success: false, message: "Cochez au moins un site." }
    if (ids.size > BATCH_SIZE) {
      return {
        success: false,
        message: `${BATCH_SIZE} sites au plus par import : décochez-en ${ids.size - BATCH_SIZE}.`,
      }
    }

    const selected = ofEdition(await fetchDirectusEvents(), year).filter((event) =>
      ids.has(directusTourinsoftId(event))
    )
    const report = await importDirectusEvents(selected, {
      publish: false,
      downloadPhotos: formData.get("photos") === "on",
      translate: true,
      dryRun: false,
      limit: BATCH_SIZE,
    })
    revalidatePath("/[locale]/admin", "layout")

    const parts = [
      `${plural(report.created, "site")} importé${report.created > 1 ? "s" : ""} en brouillon`,
    ]
    const known =
      report.knownById + Object.values(report.knownBySite).reduce((a, b) => a + (b ?? 0), 0)
    if (known) parts.push(`${known} déjà présent${known > 1 ? "s" : ""}`)
    if (report.failed) parts.push(`${plural(report.failed, "échec")}`)
    return {
      success: report.failed === 0,
      message: `${parts.join(", ")}.`,
      created: report.created,
      failed: report.failed,
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "La récupération a échoué.",
    }
  }
}
