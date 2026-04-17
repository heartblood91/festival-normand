import "dotenv/config"
import { PrismaClient, Department, Category } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { slugify } from "../lib/schemas/event"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const API = "https://pierresenlumieres.fr/backend"

type DirectusContact = { tel?: string; mobile?: string; mail?: string; web?: string; facebook?: string }
type DirectusHoraire = {
  Datedebut?: string | null
  Datefin?: string | null
  Heureouvert1?: string | null
  Heurefermeture1?: string | null
}
type DirectusLieu = { Lieuprincipal?: string; Adresse1?: string; Codepostal?: string }
type DirectusOrganisme = { Commune?: string; Adresse1?: string; Codepostal?: string }
type DirectusPhoto = { directus_files_id?: string }
type DirectusGeo = { type: "Point"; coordinates: [number, number] }

type DirectusEvent = {
  id: string
  status: string
  title: string
  description?: string | null
  raison_social?: string | null
  departement?: string | null
  categories?: string[] | null
  datehorairess?: DirectusHoraire[] | null
  lieu_principaux?: DirectusLieu[] | null
  organismes?: DirectusOrganisme[] | null
  contacts?: DirectusContact[] | null
  geo?: DirectusGeo | null
  photos?: DirectusPhoto[] | null
}

const DEPARTEMENT_MAP: Record<string, Department> = {
  Calvados: Department.CALVADOS,
  Eure: Department.EURE,
  Manche: Department.MANCHE,
  Orne: Department.ORNE,
  "Seine-Maritime": Department.SEINE_MARITIME,
}

const mapCategory = (categories: string[] | null | undefined): Category => {
  const joined = (categories ?? []).join(" ").toLowerCase()
  if (joined.includes("illumination") || joined.includes("lumière")) return Category.ILLUMINATIONS
  if (joined.includes("exposition")) return Category.EXPOSITIONS
  if (joined.includes("visite")) return Category.VISITES
  return Category.ANIMATIONS
}

const normalizeTime = (time: string | null | undefined): string | null => {
  if (!time) return null
  return time.slice(0, 5)
}

const assetUrl = (fileId: string): string =>
  `${API}/assets/${fileId}?key=webp&width=1600&format=webp&quality=70`

const fetchPage = async (offset: number, limit: number): Promise<DirectusEvent[]> => {
  const url = `${API}/items/evenements?limit=${limit}&offset=${offset}&filter[status][_eq]=published&fields=id,status,title,description,raison_social,departement,categories,datehorairess,lieu_principaux,organismes,contacts,geo,photos.directus_files_id`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  const json = await res.json()
  return json.data as DirectusEvent[]
}

const fetchAllEvents = async (): Promise<DirectusEvent[]> => {
  const all: DirectusEvent[] = []
  const pageSize = 100
  let offset = 0
  while (true) {
    const batch = await fetchPage(offset, pageSize)
    if (batch.length === 0) break
    all.push(...batch)
    if (batch.length < pageSize) break
    offset += pageSize
  }
  return all
}

const mapEvent = (d: DirectusEvent) => {
  const horaire = d.datehorairess?.[0]
  const lieu = d.lieu_principaux?.[0]
  const organisme = d.organismes?.[0]
  const contact = d.contacts?.[0]
  const photos = (d.photos ?? []).map((p) => p.directus_files_id).filter(Boolean) as string[]

  const city = lieu?.Lieuprincipal || organisme?.Commune || "Inconnu"
  const location = lieu?.Adresse1 || organisme?.Adresse1 || city
  const postalCode = lieu?.Codepostal || organisme?.Codepostal || "00000"
  const department = DEPARTEMENT_MAP[d.departement ?? ""] ?? Department.CALVADOS
  const category = mapCategory(d.categories)
  const title = d.title.trim()
  const slug = slugify(title)

  return {
    slug,
    titleFr: title,
    descriptionFr: d.description?.trim() || title,
    location,
    city,
    postalCode,
    department,
    category,
    dateStart: horaire?.Datedebut ? new Date(horaire.Datedebut) : new Date(),
    dateEnd: horaire?.Datefin ? new Date(horaire.Datefin) : null,
    timeStart: normalizeTime(horaire?.Heureouvert1),
    timeEnd: normalizeTime(horaire?.Heurefermeture1),
    organizer: d.raison_social?.trim() || null,
    email: contact?.mail?.trim() || null,
    phone: contact?.tel?.trim() || contact?.mobile?.trim() || null,
    website: contact?.web?.trim() || null,
    latitude: d.geo?.coordinates[1] ?? null,
    longitude: d.geo?.coordinates[0] ?? null,
    coverImage: photos[0] ? assetUrl(photos[0]) : null,
    images: photos.slice(1).map(assetUrl),
    published: true,
    publishedAt: new Date(),
  }
}

const main = async () => {
  const dryRun = process.argv.includes("--dry-run")
  console.log(`\nMode: ${dryRun ? "DRY-RUN" : "WRITE"}\n`)
  console.log("Fetching remote events...")
  const remote = await fetchAllEvents()
  console.log(`Fetched ${remote.length} remote events`)

  const existingSlugs = new Set(
    (await prisma.event.findMany({ select: { slug: true } })).map((e) => e.slug)
  )
  console.log(`Local DB has ${existingSlugs.size} distinct slugs\n`)

  const toInsert: ReturnType<typeof mapEvent>[] = []
  const collisions: string[] = []
  const slugsSeen = new Set<string>()

  for (const d of remote) {
    const mapped = mapEvent(d)
    if (existingSlugs.has(mapped.slug)) continue
    if (slugsSeen.has(mapped.slug)) {
      collisions.push(mapped.slug)
      continue
    }
    slugsSeen.add(mapped.slug)
    toInsert.push(mapped)
  }

  console.log(`New events to insert: ${toInsert.length}`)
  console.log(`Slug collisions (skipped): ${collisions.length}`)

  if (toInsert.length > 0) {
    console.log("\nSample new events:")
    for (const e of toInsert.slice(0, 5)) {
      console.log(`  - ${e.titleFr} (${e.city}) [${e.department}/${e.category}] → /${e.slug}`)
    }
  }

  if (!dryRun && toInsert.length > 0) {
    console.log("\nInserting...")
    const result = await prisma.event.createMany({ data: toInsert, skipDuplicates: true })
    console.log(`Inserted ${result.count} rows`)
  }

  if (dryRun) {
    console.log("\nDRY-RUN — no changes made. Re-run without --dry-run to apply.")
  }

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
