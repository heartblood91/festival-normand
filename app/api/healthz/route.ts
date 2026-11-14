import { NextResponse } from "next/server"
import { getRedis } from "@/lib/redis"
import { s3Bucket } from "@/lib/s3"

const REQUIRED_NON_DB_ENV_VARS = [
  "BETTER_AUTH_SECRET",
  "BETTER_AUTH_URL",
  "CRON_SECRET",
  "REVALIDATE_TOKEN",
  "TOURINSOFT_SYNDICATION_URL",
] as const

const isSet = (name: string) => Boolean(process.env[name]?.trim())

// Uploads go to S3 or to Vercel Blob; either one is enough.
const MEDIA_STORAGE = "S3_* or BLOB_READ_WRITE_TOKEN"

const noStoreHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
}

const REDIS_PING_TIMEOUT_MS = 500

// Informational only: the ISR cache falls back to local storage without Redis,
// so its state never changes the health status.
const redisStatus = async (): Promise<"ok" | "down" | "not_configured"> => {
  const redis = getRedis()
  if (!redis) return "not_configured"
  let timer: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => reject(new Error("timeout")), REDIS_PING_TIMEOUT_MS)
  })
  try {
    await Promise.race([redis.ping(), timeout])
    return "ok"
  } catch {
    return "down"
  } finally {
    clearTimeout(timer)
  }
}

export const GET = async () => {
  const externalConfiguration = [
    ...REQUIRED_NON_DB_ENV_VARS.map((name) => ({ name, configured: isSet(name) })),
    { name: MEDIA_STORAGE, configured: Boolean(s3Bucket()) || isSet("BLOB_READ_WRITE_TOKEN") },
  ]
  const missing = externalConfiguration
    .filter((check) => !check.configured)
    .map((check) => check.name)
  const ok = missing.length === 0

  return NextResponse.json(
    {
      ok,
      service: "pierres-en-lumieres",
      checks: {
        app: true,
        database: "not_checked",
        redis: await redisStatus(),
        externalConfiguration,
      },
      missing,
      timestamp: new Date().toISOString(),
    },
    { status: ok ? 200 : 503, headers: noStoreHeaders }
  )
}
