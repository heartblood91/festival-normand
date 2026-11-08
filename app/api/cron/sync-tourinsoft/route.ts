import { NextRequest, NextResponse } from "next/server"
import { runTourinsoftSync } from "@/lib/tourinsoft/sync"

export const maxDuration = 300

// Vercel Cron sends `Authorization: Bearer ${CRON_SECRET}` automatically; the
// self-hosted scheduler and manual bootstrap calls use the same bearer.
const isAuthorized = (request: NextRequest): boolean => {
  const secret = process.env.CRON_SECRET
  return Boolean(secret) && request.headers.get("authorization") === `Bearer ${secret}`
}

// Idempotent and re-callable, so it serves the daily cron and the bootstrap.
// GET because Vercel Cron triggers endpoints with GET; idempotence keeps it safe.
export const GET = async (request: NextRequest) => {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const limitParam = Number(new URL(request.url).searchParams.get("limit"))
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? limitParam : Infinity

  const result = await runTourinsoftSync({ trigger: "cron", limit })
  const status = result.status === "FAILED" ? 502 : result.status === "skipped" ? 409 : 200
  return NextResponse.json(result, { status })
}
