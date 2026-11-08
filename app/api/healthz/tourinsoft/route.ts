import { NextResponse } from "next/server"
import { getLastTourinsoftRun } from "@/lib/tourinsoft/sync"
import { getSchedulerIntervalMinutes } from "@/lib/tourinsoft/scheduler"
import { isAiConfigured } from "@/lib/ai/openrouter"

export const dynamic = "force-dynamic"

// A successful run is expected at least daily; beyond this the import is considered stale.
const STALE_AFTER_MS = 36 * 60 * 60 * 1000

// Public, secret-free view of the Tourinsoft import for uptime monitors.
export const GET = async () => {
  try {
    const lastRun = await getLastTourinsoftRun()
    const lastFinishedAt = lastRun?.finishedAt ?? null
    const stale =
      !lastRun ||
      lastRun.status === "FAILED" ||
      !lastFinishedAt ||
      Date.now() - lastFinishedAt.getTime() > STALE_AFTER_MS

    return NextResponse.json(
      {
        ok: !stale,
        stale,
        schedulerIntervalMinutes: getSchedulerIntervalMinutes(),
        aiTranslationConfigured: isAiConfigured(),
        lastRun,
      },
      { status: stale ? 503 : 200, headers: { "Cache-Control": "no-store" } }
    )
  } catch {
    return NextResponse.json(
      { ok: false, error: "database unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    )
  }
}
