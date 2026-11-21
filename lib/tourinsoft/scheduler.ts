import { prisma } from "@/lib/prisma"
import { runTourinsoftSync, TOURINSOFT_SOURCE } from "@/lib/tourinsoft/sync"

const MINUTE_MS = 60 * 1000
const MIN_INTERVAL_MINUTES = 15
const FIRST_CHECK_MS = MINUTE_MS

// Self-hosted replacement for the Vercel cron. Disabled unless
// TOURINSOFT_SYNC_INTERVAL_MINUTES is set. The decision is taken from the
// `sync_runs` table, so restarts and several replicas do not multiply runs.
export const getSchedulerIntervalMinutes = (): number | null => {
  const raw = Number(process.env.TOURINSOFT_SYNC_INTERVAL_MINUTES)
  if (!Number.isFinite(raw) || raw <= 0) return null
  return Math.max(raw, MIN_INTERVAL_MINUTES)
}

/** Milliseconds until the next sync is due; 0 when it is due now. */
export const msUntilDue = (lastStartedAt: Date | null, intervalMinutes: number, now: Date) =>
  lastStartedAt
    ? Math.max(0, lastStartedAt.getTime() + intervalMinutes * MINUTE_MS - now.getTime())
    : 0

// Returns how long to sleep. The database is only touched when a sync may be
// due: Neon suspends its compute after 5 idle minutes, and a frequent check
// kept it running around the clock and burned the free compute hours.
const tick = async (intervalMinutes: number): Promise<number> => {
  const last = await prisma.syncRun.findFirst({
    where: { source: TOURINSOFT_SOURCE },
    orderBy: { startedAt: "desc" },
    select: { startedAt: true },
  })
  const wait = msUntilDue(last?.startedAt ?? null, intervalMinutes, new Date())
  if (wait > 0) return wait
  await runTourinsoftSync({ trigger: "scheduler" })
  return intervalMinutes * MINUTE_MS
}

let started = false

export const startTourinsoftScheduler = (): boolean => {
  const intervalMinutes = getSchedulerIntervalMinutes()
  if (!intervalMinutes || !process.env.TOURINSOFT_SYNDICATION_URL || started) return false
  started = true

  const schedule = (delay: number) => {
    setTimeout(() => {
      tick(intervalMinutes)
        .catch((error) => {
          console.error("Tourinsoft scheduler tick failed:", error)
          return MIN_INTERVAL_MINUTES * MINUTE_MS
        })
        .then(schedule)
    }, delay).unref()
  }

  schedule(FIRST_CHECK_MS)
  return true
}
