import { prisma } from "@/lib/prisma"
import { runTourinsoftSync, TOURINSOFT_SOURCE } from "@/lib/tourinsoft/sync"

const TICK_MS = 5 * 60 * 1000
const MIN_INTERVAL_MINUTES = 15

// Self-hosted replacement for the Vercel cron. Disabled unless
// TOURINSOFT_SYNC_INTERVAL_MINUTES is set. The decision is taken from the
// `sync_runs` table, so restarts and several replicas do not multiply runs.
export const getSchedulerIntervalMinutes = (): number | null => {
  const raw = Number(process.env.TOURINSOFT_SYNC_INTERVAL_MINUTES)
  if (!Number.isFinite(raw) || raw <= 0) return null
  return Math.max(raw, MIN_INTERVAL_MINUTES)
}

export const isSyncDue = (lastStartedAt: Date | null, intervalMinutes: number, now: Date) =>
  !lastStartedAt || now.getTime() - lastStartedAt.getTime() >= intervalMinutes * 60 * 1000

const tick = async (intervalMinutes: number): Promise<void> => {
  const last = await prisma.syncRun.findFirst({
    where: { source: TOURINSOFT_SOURCE },
    orderBy: { startedAt: "desc" },
    select: { startedAt: true },
  })
  if (!isSyncDue(last?.startedAt ?? null, intervalMinutes, new Date())) return
  await runTourinsoftSync({ trigger: "scheduler" })
}

let started = false

export const startTourinsoftScheduler = (): boolean => {
  const intervalMinutes = getSchedulerIntervalMinutes()
  if (!intervalMinutes || !process.env.TOURINSOFT_SYNDICATION_URL || started) return false
  started = true

  const safeTick = () =>
    tick(intervalMinutes).catch((error) =>
      console.error("Tourinsoft scheduler tick failed:", error)
    )

  setTimeout(safeTick, 60_000)
  setInterval(safeTick, TICK_MS).unref()
  return true
}
