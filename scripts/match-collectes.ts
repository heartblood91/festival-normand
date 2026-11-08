/**
 * Proposes Fondation du patrimoine collects near each event.
 *
 *   pnpm tsx scripts/match-collectes.ts [--snapshot file.json] [--save-snapshot file.json]
 *     [--radius 10] [--limit 3] [--out docs/reports/collectes-suggestions.json] [--write]
 *
 * Reads the in-progress Normandy collects from the public search of
 * fondation-patrimoine.org (3 paused requests) or from a saved snapshot, then
 * writes a JSON report. With --write, the suggestions are stored for editors
 * to validate in the event form; nothing is attached to an event here, and a
 * suggestion an editor already accepted or dismissed keeps its status.
 */
import "dotenv/config"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import { dirname } from "node:path"
import { parseArgs } from "node:util"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { fetchFondationProjects } from "@/lib/fundraising/fondation-client"
import type { FondationProject } from "@/lib/fundraising/fondation"
import {
  DEFAULT_RADIUS_KM,
  DEFAULT_SUGGESTION_LIMIT,
  suggestCollectes,
} from "@/lib/fundraising/match"

const { values: args } = parseArgs({
  options: {
    snapshot: { type: "string" },
    "save-snapshot": { type: "string" },
    radius: { type: "string", default: String(DEFAULT_RADIUS_KM) },
    limit: { type: "string", default: String(DEFAULT_SUGGESTION_LIMIT) },
    out: { type: "string", default: "docs/reports/collectes-suggestions.json" },
    write: { type: "boolean", default: false },
  },
})

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
})

const writeJson = async (path: string, data: unknown) => {
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, `${JSON.stringify(data, null, 2)}\n`)
}

const loadProjects = async (): Promise<FondationProject[]> => {
  if (args.snapshot) return JSON.parse(await readFile(args.snapshot, "utf8"))
  const projects = await fetchFondationProjects()
  if (args["save-snapshot"]) await writeJson(args["save-snapshot"], projects)
  return projects
}

const main = async () => {
  const radiusKm = Number(args.radius)
  const limit = Number(args.limit)
  const projects = await loadProjects()
  const events = await prisma.event.findMany({
    select: {
      id: true,
      slug: true,
      titleFr: true,
      city: true,
      postalCode: true,
      latitude: true,
      longitude: true,
      published: true,
    },
    orderBy: { titleFr: "asc" },
  })

  const report = events
    .map((event) => ({
      event,
      suggestions: suggestCollectes(event, projects, { radiusKm, limit }),
    }))
    .filter(({ suggestions }) => suggestions.length > 0)

  if (args.write) {
    for (const { event, suggestions } of report) {
      for (const { project, reason, distanceKm } of suggestions) {
        const fields = {
          url: project.url,
          title: project.title,
          city: project.city,
          imageUrl: project.imageUrl,
          reason,
          distanceKm,
          collectedPercent: project.collectedPercent,
        }
        await prisma.fundraisingSuggestion.upsert({
          where: { eventId_projectCode: { eventId: event.id, projectCode: project.code } },
          create: { eventId: event.id, projectCode: project.code, ...fields },
          update: fields,
        })
      }
    }
  }

  await writeJson(args.out, {
    generatedAt: new Date().toISOString(),
    source: args.snapshot ? `snapshot ${args.snapshot}` : "fondation-patrimoine.org search",
    projects: projects.length,
    events: events.length,
    eventsWithSuggestions: report.length,
    radiusKm,
    results: report.map(({ event, suggestions }) => ({
      event: {
        slug: event.slug,
        title: event.titleFr,
        city: event.city,
        published: event.published,
      },
      suggestions: suggestions.map(({ project, reason, distanceKm }) => ({
        reason,
        distanceKm: distanceKm === null ? null : Math.round(distanceKm * 10) / 10,
        title: project.title,
        city: project.city,
        url: project.url,
      })),
    })),
  })

  console.log(
    `${projects.length} collects, ${events.length} events, ${report.length} with suggestions` +
      `${args.write ? " (stored for review)" : ""} → ${args.out}`
  )
}

main()
  .catch((error) => {
    console.error("Collect matching failed:", error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
