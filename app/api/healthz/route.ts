import { NextResponse } from "next/server"
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
        externalConfiguration,
      },
      missing,
      timestamp: new Date().toISOString(),
    },
    { status: ok ? 200 : 503, headers: noStoreHeaders }
  )
}
