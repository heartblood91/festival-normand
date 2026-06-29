import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { geocodeNormandyAddress } from "@/lib/geo/geocode"

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})
const prisma = new PrismaClient({ adapter })

const main = async () => {
  const events = await prisma.event.findMany({
    where: {
      OR: [
        { latitude: 0 },
        { latitude: null },
        { longitude: 0 },
        { longitude: null },
        { latitude: { lt: 48 } },
        { latitude: { gt: 50.3 } },
        { longitude: { lt: -2.2 } },
        { longitude: { gt: 2 } },
      ],
    },
    select: { id: true, titleFr: true, city: true, location: true, postalCode: true },
  })

  console.log(`${events.length} events to geocode\n`)

  let success = 0
  let failed = 0

  for (const event of events) {
    const coords = await geocodeNormandyAddress(event)
    if (coords) {
      await prisma.event.update({
        where: { id: event.id },
        data: { latitude: coords.latitude, longitude: coords.longitude },
      })
      console.log(`✓ ${event.titleFr} → ${coords.latitude}, ${coords.longitude}`)
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
