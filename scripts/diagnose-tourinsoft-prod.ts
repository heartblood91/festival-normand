// Read-only diagnostic: which Tourinsoft feed offers are missing from a public
// deployment? Only issues GET requests (feed + public listing pages), never
// touches a database, and paces requests to stay polite.
//
//   pnpm tsx scripts/diagnose-tourinsoft-prod.ts [--base https://…] [--out docs/reports/…]
import "dotenv/config"
import { writeFileSync } from "node:fs"
import { fetchSyndication } from "@/lib/tourinsoft/client"
import { mapOffer } from "@/lib/tourinsoft/map"

const DEFAULT_BASE = "https://pierres-en-lumieres.my-dev-box.ovh"
const DEFAULT_OUT = "docs/reports/tourinsoft-prod-diagnostic.md"
const PAGE_DELAY_MS = 400
const MAX_PAGES = 100

const argValue = (name: string): string | undefined => {
  const index = process.argv.indexOf(`--${name}`)
  return index >= 0 ? process.argv[index + 1] : undefined
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const fetchText = async (url: string): Promise<{ status: number; body: string }> => {
  const response = await fetch(url, { headers: { "User-Agent": "pel-diagnostic (read-only)" } })
  return { status: response.status, body: await response.text() }
}

// The public listing paginates by 12; walk every page announced by the
// pagination links and collect every /fr/evenement/<slug> link.
export const collectPublicSlugs = async (
  base: string
): Promise<{ slugs: Set<string>; pages: number; links: number }> => {
  const slugs = new Set<string>()
  let pages = 1
  let links = 0
  for (let page = 1; page <= Math.min(pages, MAX_PAGES); page++) {
    const { status, body } = await fetchText(`${base}/fr/evenements?page=${page}`)
    if (status !== 200) throw new Error(`Listing page ${page} returned ${status}`)
    const announced = [...body.matchAll(/[?&]page=(\d+)/g)].map((m) => Number(m[1]))
    pages = Math.max(pages, ...announced)
    const found = new Set([...body.matchAll(/href="\/fr\/evenement\/([^"?#]+)"/g)].map((m) => m[1]))
    links += found.size
    found.forEach((slug) => slugs.add(slug))
    await sleep(PAGE_DELAY_MS)
  }
  return { slugs, pages, links }
}

// Import suffixes duplicate titles (`-2`, `-3`), so accept those variants.
export const findPublicSlug = (slug: string, publicSlugs: Set<string>): string | null => {
  if (publicSlugs.has(slug)) return slug
  const suffixed = [...publicSlugs].find((candidate) =>
    new RegExp(`^${slug}-\\d+$`).test(candidate)
  )
  return suffixed ?? null
}

// Second chance for offers not reachable through pagination: the public search.
const searchPublicSlug = async (base: string, title: string, slug: string) => {
  const { status, body } = await fetchText(
    `${base}/fr/evenements?search=${encodeURIComponent(title)}`
  )
  if (status !== 200) return null
  const found = new Set([...body.matchAll(/href="\/fr\/evenement\/([^"?#]+)"/g)].map((m) => m[1]))
  return findPublicSlug(slug, found)
}

const main = async () => {
  const base = (argValue("base") ?? DEFAULT_BASE).replace(/\/$/, "")
  const out = argValue("out") ?? DEFAULT_OUT

  const offers = await fetchSyndication()
  const { slugs: publicSlugs, pages, links } = await collectPublicSlugs(base)

  const rows: { mapped: ReturnType<typeof mapOffer>; match: string | null; via: string }[] = []
  for (const offer of offers) {
    const mapped = mapOffer(offer)
    const listed = findPublicSlug(mapped.slug, publicSlugs)
    if (listed) {
      rows.push({ mapped, match: listed, via: "listing" })
      continue
    }
    await sleep(PAGE_DELAY_MS)
    const searched = await searchPublicSlug(base, mapped.titleFr, mapped.slug)
    rows.push({ mapped, match: searched, via: searched ? "search only" : "" })
  }
  const missing = rows.filter((row) => !row.match)
  const searchOnly = rows.filter((row) => row.via === "search only")

  const table = rows
    .map(
      ({ mapped, match, via }) =>
        `| ${mapped.tourinsoftId} | ${mapped.titleFr} | ${mapped.city} (${mapped.department}) | ${mapped.dateStart.toISOString().slice(0, 10)} | ${match ? `present via ${via} (\`${match}\`)` : "**missing**"} |`
    )
    .join("\n")

  const report = `# Tourinsoft feed vs public site — diagnostic

Generated ${new Date().toISOString()} by \`scripts/diagnose-tourinsoft-prod.ts\` (read-only GETs).

- Target: ${base}
- Offers in the Tourinsoft feed: **${offers.length}**
- Listing pages walked (\`/fr/evenements?page=1..${pages}\`): ${pages}, event cards seen: ${links}
- Distinct event slugs reachable through the listing: **${publicSlugs.size}**
  (cards seen minus distinct = events repeated across pages; the listing
  ordered only by \`dateStart\`, so OFFSET pages overlapped and the
  remaining events were unreachable — fixed on \`feat/pel-2027\`)
- Feed offers only found through search (unreachable by browsing): **${searchOnly.length}**
- Feed offers missing from the public site: **${missing.length}**

| Tourinsoft id | Title | Commune | Start | Public site |
|---|---|---|---|---|
${table}

Matching is by slug derived from the Tourinsoft title (with \`-N\` suffix
variants), first against the paginated listing, then through \`?search=<title>\`.
A match by slug says the site exists in prod, not that it is the 2027 offer:
an older edition with the same title also matches. Recovery: see \`docs/deploy-self-hosted.md\` § Tourinsoft recovery.
`
  writeFileSync(out, report)
  process.stdout.write(
    `feed=${offers.length} pages=${pages} cards=${links} distinct=${publicSlugs.size} searchOnly=${searchOnly.length} missing=${missing.length} → ${out}\n`
  )
}

if (process.argv[1]?.endsWith("diagnose-tourinsoft-prod.ts")) {
  main().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
    process.exit(1)
  })
}
