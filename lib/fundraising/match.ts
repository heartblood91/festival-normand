import type { FondationProject } from "@/lib/fundraising/fondation"

/** Provisional radius: a collect this close is likely the same site or its village. */
export const DEFAULT_RADIUS_KM = 10
export const DEFAULT_SUGGESTION_LIMIT = 3

type Point = { latitude: number; longitude: number }

export type MatchableEvent = {
  city: string
  postalCode: string
  latitude: number | null
  longitude: number | null
}

export type CollecteSuggestion = {
  project: FondationProject
  reason: "commune" | "distance"
  distanceKm: number | null
}

const EARTH_RADIUS_KM = 6371

const toRadians = (degrees: number) => (degrees * Math.PI) / 180

export const distanceKm = (a: Point, b: Point) => {
  const dLat = toRadians(b.latitude - a.latitude)
  const dLng = toRadians(b.longitude - a.longitude)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(a.latitude)) * Math.cos(toRadians(b.latitude)) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h))
}

export const normalizeCommune = (city: string) =>
  city
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\bsaint(e?)\b/g, "st$1")
    .trim()

const pointOf = (value: { latitude: number | null; longitude: number | null }) =>
  value.latitude !== null && value.longitude !== null && (value.latitude || value.longitude)
    ? { latitude: value.latitude, longitude: value.longitude }
    : null

/**
 * Collects worth proposing for one event: same commune (checked against the
 * department, communes share names across France) first, then by distance.
 */
export const suggestCollectes = (
  event: MatchableEvent,
  projects: FondationProject[],
  { radiusKm = DEFAULT_RADIUS_KM, limit = DEFAULT_SUGGESTION_LIMIT } = {}
): CollecteSuggestion[] => {
  const commune = normalizeCommune(event.city)
  const department = event.postalCode.slice(0, 2)
  const origin = pointOf(event)

  return projects
    .flatMap((project): CollecteSuggestion[] => {
      const target = pointOf(project)
      const km = origin && target ? distanceKm(origin, target) : null
      const sameCommune =
        !!commune &&
        normalizeCommune(project.city) === commune &&
        project.departmentCode === department
      if (sameCommune) return [{ project, reason: "commune", distanceKm: km }]
      if (km !== null && km <= radiusKm) return [{ project, reason: "distance", distanceKm: km }]
      return []
    })
    .sort(
      (a, b) =>
        Number(a.reason !== "commune") - Number(b.reason !== "commune") ||
        (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity)
    )
    .slice(0, limit)
}
