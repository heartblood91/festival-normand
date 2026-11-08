// Recover legacy v1 events (pierresenlumieres.fr, Directus public API) into the
// database at DATABASE_URL. Creates drafts by default; never updates, unpublishes
// or deletes. Re-running is safe: known events are skipped.
//
//   pnpm tsx scripts/import-directus.ts --year 2026 --dry-run
//   pnpm tsx scripts/import-directus.ts --year 2026 [--publish] [--skip-images] [--no-translate] [--limit 20]
import "dotenv/config"
import { prisma } from "@/lib/prisma"
import { fetchDirectusEvents } from "@/lib/directus/client"
import { directusEdition } from "@/lib/directus/map"
import { importDirectusEvents } from "@/lib/directus/import"

const argValue = (name: string): string | undefined => {
  const index = process.argv.indexOf(`--${name}`)
  return index >= 0 ? process.argv[index + 1] : undefined
}
const hasFlag = (name: string) => process.argv.includes(`--${name}`)

const main = async () => {
  const year = argValue("year") ?? "2026"
  const limit = Number(argValue("limit") ?? Infinity)
  const options = {
    publish: hasFlag("publish"),
    downloadPhotos: !hasFlag("skip-images"),
    translate: !hasFlag("no-translate"),
    dryRun: hasFlag("dry-run"),
    limit: Number.isFinite(limit) && limit > 0 ? limit : Infinity,
  }

  const events = (await fetchDirectusEvents()).filter(
    (event) => event.status === "published" && directusEdition(event) === year
  )
  const { planned, ...report } = await importDirectusEvents(events, options)

  for (const item of planned) {
    process.stdout.write(`would create ${item.tourinsoftId}  ${item.title} — ${item.city}\n`)
  }
  process.stdout.write(
    `${JSON.stringify({ year, ...options, limit: Number.isFinite(options.limit) ? options.limit : "all", ...report, planned: planned.length })}\n`
  )
}

main()
  .catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
