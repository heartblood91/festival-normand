// Run the Tourinsoft import once against DATABASE_URL — same code path as the
// cron route and the in-app scheduler (run recorded in `sync_runs`).
//
//   pnpm tsx scripts/sync-tourinsoft.ts [--limit 50]
import "dotenv/config"
import { prisma } from "@/lib/prisma"
import { runTourinsoftSync } from "@/lib/tourinsoft/sync"

const main = async () => {
  const limitIndex = process.argv.indexOf("--limit")
  const limit = limitIndex >= 0 ? Number(process.argv[limitIndex + 1]) : Infinity
  const result = await runTourinsoftSync({ trigger: "cli", limit })
  process.stdout.write(`${JSON.stringify(result)}\n`)
  process.exitCode = result.status === "FAILED" ? 1 : 0
}

main()
  .catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
