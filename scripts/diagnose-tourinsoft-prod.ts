// Read-only diagnostic: which Tourinsoft feed offers are missing from a public
// deployment, and are all published events reachable through the listing?
// Only issues GET requests (feed + public pages), never touches a database.
//
//   pnpm tsx scripts/diagnose-tourinsoft-prod.ts [--base https://…] [--out docs/reports/…]
import "dotenv/config"
import { writeFileSync } from "node:fs"
import { fetchSyndication } from "@/lib/tourinsoft/client"
import { mapOffer } from "@/lib/tourinsoft/map"
import { fetchPublicEvents, fetchText, findPublicSlug } from "./lib/public-site"

const DEFAULT_BASE = "https://pierres-en-lumieres.my-dev-box.ovh"
const DEFAULT_OUT = "docs/reports/tourinsoft-prod-diagnostic.md"
const PAGE_DELAY_MS = 400
const MAX_PAGES = 100

const argValue = (name: string): string | undefined => {
  const index = process.argv.indexOf(`--${name}`)
  return index >= 0 ? process.argv[index + 1] : undefined
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Walk every page announced by the listing's pagination links, as a visitor would.
const walkListing = async (base: string) => {
  const slugs = new Set<string>()
  let pages = 1
  let cards = 0
  for (let page = 1; page <= Math.min(pages, MAX_PAGES); page++) {
    const { status, body } = await fetchText(`${base}/fr/evenements?page=${page}`)
    if (status !== 200) throw new Error(`Listing page ${page} returned ${status}`)
    const announced = [...body.matchAll(/[?&]page=(\d+)/g)].map((m) => Number(m[1]))
    pages = Math.max(pages, ...announced)
    const found = new Set([...body.matchAll(/href="\/fr\/evenement\/([^"?#]+)"/g)].map((m) => m[1]))
    cards += found.size
    found.forEach((slug) => slugs.add(slug))
    await sleep(PAGE_DELAY_MS)
  }
  return { slugs, pages, cards }
}

const main = async () => {
  const base = (argValue("base") ?? DEFAULT_BASE).replace(/\/$/, "")
  const out = argValue("out") ?? DEFAULT_OUT

  const offers = await fetchSyndication()
  const inventory = await fetchPublicEvents(base)
  const published = new Set(inventory.map((event) => event.slug))
  const listing = await walkListing(base)
  const unreachable = inventory.filter((event) => !listing.slugs.has(event.slug))

  const rows = offers.map((offer) => {
    const mapped = mapOffer(offer)
    const match = findPublicSlug(mapped.slug, published)
    return { mapped, match, browsable: match ? listing.slugs.has(match) : false }
  })
  const missing = rows.filter((row) => !row.match)

  const table = rows
    .map(({ mapped, match, browsable }) => {
      const status = match
        ? `present (\`${match}\`)${browsable ? "" : ", not reachable by browsing"}`
        : "**missing**"
      return `| ${mapped.tourinsoftId} | ${mapped.titleFr} | ${mapped.city} (${mapped.department}) | ${mapped.dateStart.toISOString().slice(0, 10)} | ${status} |`
    })
    .join("\n")

  const report = `# Tourinsoft feed vs public site — diagnostic

Generated ${new Date().toISOString()} by \`scripts/diagnose-tourinsoft-prod.ts\` (read-only GETs).

- Target: ${base}
- Offers in the Tourinsoft feed: **${offers.length}**
- Published events (map view inventory, unpaginated): **${inventory.length}**
- Listing \`/fr/evenements?page=1..${listing.pages}\`: ${listing.cards} cards, **${listing.slugs.size}** distinct events
- Published events a visitor cannot reach by paging the listing: **${unreachable.length}**
  (the listing ordered only by \`dateStart\`, so OFFSET pages overlapped — fixed
  on \`feat/pel-2027\` by adding \`id\` as tie-breaker)
- Feed offers missing from the public site: **${missing.length}**

| Tourinsoft id | Title | Commune | Start | Public site |
|---|---|---|---|---|
${table}

Matching is by slug derived from the Tourinsoft title (with \`-N\` suffix
variants). A slug match says a site with that title is published, not that it
is the 2027 offer: an older edition with the same title also matches.
Recovery: \`docs/deploy-self-hosted.md\` § Recovery runbook.

<details><summary>Published events not reachable through the listing (${unreachable.length})</summary>

${unreachable.map((event) => `- \`${event.slug}\` — ${event.city}`).join("\n")}

</details>
`
  writeFileSync(out, report)
  process.stdout.write(
    `feed=${offers.length} published=${inventory.length} browsable=${listing.slugs.size} unreachable=${unreachable.length} missing=${missing.length} → ${out}\n`
  )
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
  process.exit(1)
})
