// Read-only comparison of the legacy v1 site (Directus public API) with the
// events published on a deployment of the new site (public map view).
//
//   pnpm tsx scripts/compare-v1-prod.ts [--base https://…] [--year 2026] [--out docs/reports/…]
import { writeFileSync } from "node:fs"
import { fetchDirectusEvents } from "@/lib/directus/client"
import { directusEdition, toMatchSource } from "@/lib/directus/map"
import { matchSources, type MatchVia } from "@/lib/directus/match"
import type { DirectusEvent } from "@/lib/directus/types"
import { fetchPublicEvents } from "./lib/public-site"

const DEFAULT_BASE = "https://pierres-en-lumieres.my-dev-box.ovh"
const DEFAULT_OUT = "docs/reports/v1-vs-prod.md"

const argValue = (name: string): string | undefined => {
  const index = process.argv.indexOf(`--${name}`)
  return index >= 0 ? process.argv[index + 1] : undefined
}

const main = async () => {
  const base = (argValue("base") ?? DEFAULT_BASE).replace(/\/$/, "")
  const year = argValue("year") ?? "2026"
  const out = argValue("out") ?? DEFAULT_OUT

  const [v1All, prod] = await Promise.all([fetchDirectusEvents(), fetchPublicEvents(base)])
  const v1 = v1All.filter(
    (event) => event.status === "published" && directusEdition(event) === year
  )

  const matches = matchSources(
    v1.map(toMatchSource),
    prod.map((event) => ({
      ...event,
      id: event.slug,
      title: event.titleFr,
      dateStart: event.dateStart ? new Date(event.dateStart) : null,
    }))
  )
  const matched = new Set<string>()
  const missing: DirectusEvent[] = []
  const via: Partial<Record<MatchVia, number>> = {}
  const loose: string[] = []
  matches.forEach((match, index) => {
    const event = v1[index]
    if (!match) {
      missing.push(event)
      return
    }
    matched.add(match.candidateId)
    via[match.via] = (via[match.via] ?? 0) + 1
    if (match.via.startsWith("geo")) {
      loose.push(`- ${event.title.replace(/\|/g, "/")} → \`${match.candidateId}\` (${match.via})`)
    }
  })
  const extra = prod.filter((event) => !matched.has(event.slug))

  const byDepartment = (events: DirectusEvent[]) =>
    Object.entries(
      events.reduce<Record<string, number>>((acc, event) => {
        const department = event.departement ?? "?"
        acc[department] = (acc[department] ?? 0) + 1
        return acc
      }, {})
    )
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([department, count]) => `${department} ${count}`)
      .join(", ")

  const report = `# v1 (pierresenlumieres.fr) vs new site — published events ${year}

Generated ${new Date().toISOString()} by \`scripts/compare-v1-prod.ts\` (read-only GETs:
v1 Directus public API, new site \`/fr/evenements?view=map\`).

- New site: ${base}
- v1 published events, edition ${year}: **${v1.length}** (${byDepartment(v1)})
- New site published events (all editions): **${prod.length}**
- v1 events found on the new site: **${v1.length - missing.length}** (${Object.entries(via)
    .map(([how, count]) => `${count} by ${how}`)
    .join(", ")})
- **v1 events missing on the new site: ${missing.length}**${missing.length ? ` (${byDepartment(missing)})` : ""}
- New-site events with no v1 ${year} counterpart: ${extra.length}

Matching (\`lib/directus/match.ts\`): the new site exposes no Tourinsoft id
publicly, so events are matched by accent/case-insensitive title + commune,
then title slug (same edition only, ±7 days), then — for renamed events — same place (≤ 250 m) with a shared
title word, then the only event at the same spot (≤ 50 m). Place-based matches
are listed below for review. Recovery of the missing ones:
\`scripts/import-directus.ts\` (see \`docs/deploy-self-hosted.md\`), which dedupes
on the target database by Tourinsoft id first.

## v1 events missing on the new site

| Tourinsoft id | Title | Commune | Department | Date |
|---|---|---|---|---|
${missing
  .map(
    (event) =>
      `| ${event.syndic_object_id ?? "—"} | ${event.title.replace(/\|/g, "/")} | ${toMatchSource(event).cities[0] ?? "—"} | ${event.departement ?? "—"} | ${event.datehorairess?.[0]?.Datedebut?.slice(0, 10) ?? "—"} |`
  )
  .join("\n")}

## Matched by place (review)

<details><summary>${loose.length} matches</summary>

${loose.join("\n")}

</details>

## New-site events with no v1 ${year} counterpart

${extra.map((event) => `- \`${event.slug}\` — ${event.city} (${event.dateStart?.slice(0, 10) ?? "no date"})`).join("\n")}
`
  writeFileSync(out, report)
  process.stdout.write(
    `v1=${v1.length} prod=${prod.length} missing=${missing.length} extra=${extra.length} → ${out}\n`
  )
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
  process.exit(1)
})
