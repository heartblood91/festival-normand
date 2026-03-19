import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})
const prisma = new PrismaClient({ adapter })

const geocode = async (query: string): Promise<{ lat: number; lng: number } | null> => {
  const res = await fetch(
    `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=1`
  )
  const data = await res.json()
  const feature = data.features?.[0]
  if (!feature) return null
  const [lng, lat] = feature.geometry.coordinates
  return { lat, lng }
}

const main = async () => {
  const events = await prisma.event.findMany({
    where: { OR: [{ latitude: 0 }, { latitude: null }] },
    select: { id: true, titleFr: true, city: true, location: true, postalCode: true },
  })

  console.log(`${events.length} events to geocode\n`)

  let success = 0
  let failed = 0

  for (const event of events) {
    const query = [event.location, event.city, event.postalCode].filter(Boolean).join(" ")
    if (!query.trim()) {
      console.log("Skip (no data):", event.titleFr)
      failed++
      continue
    }

    let coords = await geocode(query)

    // Fallback: postal code only
    if (!coords && event.postalCode) {
      coords = await geocode(event.postalCode)
    }

    if (coords) {
      await prisma.event.update({
        where: { id: event.id },
        data: { latitude: coords.lat, longitude: coords.lng },
      })
      console.log(`✓ ${event.titleFr} → ${coords.lat}, ${coords.lng}`)
      success++
    } else {
      console.log(`✗ ${event.titleFr}`)
      failed++
    }

    // Rate limit: 200ms between requests
    await new Promise((r) => setTimeout(r, 200))
  }

  console.log(`\nDone: ${success} geocoded, ${failed} failed`)
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error("Geocoding failed:", e)
  process.exit(1)
})
