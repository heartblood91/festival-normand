import { cachedQuery } from "@/lib/cache"

// Internal PostHog read client for the admin stats page; not a server action.
// Needs a personal API key with the "query:read" scope, never the public
// project token used by the browser.

const DEFAULT_API_HOST = "https://eu.posthog.com"
const REQUEST_TIMEOUT_MS = 10_000
export const AUDIENCE_DAYS = 30

type HogQLResponse = { results?: unknown[][] }

const config = () => {
  const apiKey = process.env.POSTHOG_PERSONAL_API_KEY?.trim()
  const projectId = process.env.POSTHOG_PROJECT_ID?.trim()
  if (!apiKey || !projectId || !/^\d+$/.test(projectId)) return null
  const host = (process.env.POSTHOG_API_HOST?.trim() || DEFAULT_API_HOST).replace(/\/+$/, "")
  return { apiKey, projectId, host }
}

export const isPostHogStatsConfigured = () => config() !== null

const runQuery = async (query: string): Promise<unknown[][]> => {
  const settings = config()
  if (!settings) throw new Error("PostHog stats not configured")
  const response = await fetch(`${settings.host}/api/projects/${settings.projectId}/query/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${settings.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: { kind: "HogQLQuery", query } }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    cache: "no-store",
  })
  if (!response.ok) throw new Error(`PostHog query failed (${response.status})`)
  const data = (await response.json()) as HogQLResponse
  return Array.isArray(data.results) ? data.results : []
}

// Public pages only: editors browsing the admin are not the audience.
const PAGEVIEWS = `event = '$pageview'
  AND timestamp >= now() - INTERVAL ${AUDIENCE_DAYS} DAY
  AND properties.$pathname NOT LIKE '%/admin%'`

const toNumber = (value: unknown) => (typeof value === "number" ? value : Number(value) || 0)
const toText = (value: unknown) => (typeof value === "string" ? value : "")

export type AudienceStats = {
  pageviews: number
  visitors: number
  daily: { day: string; views: number }[]
  topPages: { path: string; views: number }[]
  referrers: { domain: string; views: number }[]
}

const fetchAudience = async (): Promise<AudienceStats> => {
  const [totals, daily, topPages, referrers] = await Promise.all([
    runQuery(`SELECT count(), count(DISTINCT person_id) FROM events WHERE ${PAGEVIEWS}`),
    runQuery(
      `SELECT toString(toDate(timestamp, 'Europe/Paris')) AS day, count() FROM events
       WHERE ${PAGEVIEWS} GROUP BY day ORDER BY day`
    ),
    runQuery(
      `SELECT properties.$pathname AS path, count() AS views FROM events
       WHERE ${PAGEVIEWS} GROUP BY path ORDER BY views DESC LIMIT 10`
    ),
    runQuery(
      `SELECT properties.$referring_domain AS domain, count() AS views FROM events
       WHERE ${PAGEVIEWS} GROUP BY domain ORDER BY views DESC LIMIT 8`
    ),
  ])
  return {
    pageviews: toNumber(totals[0]?.[0]),
    visitors: toNumber(totals[0]?.[1]),
    daily: daily.map(([day, views]) => ({ day: toText(day), views: toNumber(views) })),
    topPages: topPages.map(([path, views]) => ({ path: toText(path), views: toNumber(views) })),
    referrers: referrers.map(([domain, views]) => ({
      domain: toText(domain),
      views: toNumber(views),
    })),
  }
}

/** Last 30 days of public audience, cached for an hour; null when unavailable. */
export const getAudienceStats = async (): Promise<AudienceStats | null> => {
  if (!isPostHogStatsConfigured()) return null
  try {
    return await cachedQuery(fetchAudience, ["posthog-audience", String(AUDIENCE_DAYS)], {
      revalidate: 3600,
      tags: ["analytics"],
    })()
  } catch {
    return null
  }
}

/** Fills the days without any visit so the chart keeps a regular time axis. */
export const fillDays = (daily: AudienceStats["daily"], today: string, days = AUDIENCE_DAYS) => {
  const views = new Map(daily.map((row) => [row.day, row.views]))
  const end = new Date(`${today}T12:00:00Z`)
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(end)
    date.setUTCDate(end.getUTCDate() - (days - 1 - index))
    const day = date.toISOString().slice(0, 10)
    return { day, views: views.get(day) ?? 0 }
  })
}
