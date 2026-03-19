import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})
const prisma = new PrismaClient({ adapter })

// Simple French → English translation map for common heritage terms
const TERM_MAP: Record<string, string> = {
  "Illumination de": "Illumination of",
  "Illumination du": "Illumination of the",
  "Illumination des": "Illumination of the",
  "Illumination d'": "Illumination of ",
  "Illumination de l'": "Illumination of the ",
  "Illumination de la": "Illumination of the",
  "Mise en lumière de": "Lighting of",
  "Mise en lumière du": "Lighting of the",
  "Mise en lumière des": "Lighting of the",
  "Mise en lumière d'": "Lighting of ",
  "Mise en lumière de l'": "Lighting of the ",
  "Mise en lumière de la": "Lighting of the",
  "Visite guidée de": "Guided tour of",
  "Visite guidée du": "Guided tour of the",
  "Visite guidée des": "Guided tour of the",
  "Visite guidée d'": "Guided tour of ",
  "Visite guidée de l'": "Guided tour of the ",
  "Visite guidée de la": "Guided tour of the",
  "Visite libre de": "Self-guided tour of",
  "Visite libre du": "Self-guided tour of the",
  "Visite libre des": "Self-guided tour of the",
  "Visite libre d'": "Self-guided tour of ",
  "Visite libre de l'": "Self-guided tour of the ",
  "Visite libre de la": "Self-guided tour of the",
  "Visite libre nocturne": "Night self-guided tour",
  "Visite nocturne de": "Night tour of",
  "Visite nocturne du": "Night tour of the",
  "Concert en": "Concert at",
  "Concert à": "Concert at",
  "Concert de": "Concert of",
  "Concert du": "Concert of the",
  "Exposition": "Exhibition",
  "Conférence": "Conference",
  "Spectacle": "Show",
  "Balade nocturne": "Night walk",
  "Promenade nocturne": "Night stroll",
  "Pierres en Lumières >": "Pierres en Lumières >",
  "Pierres en Lumières à": "Pierres en Lumières in",
  "Pierres en Lumières au": "Pierres en Lumières at",
  "Pierres en Lumières aux": "Pierres en Lumières at",
  "l'église": "the church",
  "l'abbaye": "the abbey",
  "l'Abbaye": "the Abbey",
  "le château": "the castle",
  "le Château": "the Castle",
  "le manoir": "the manor",
  "le Manoir": "the Manor",
  "la cathédrale": "the cathedral",
  "la Cathédrale": "the Cathedral",
  "le prieuré": "the priory",
  "le Prieuré": "the Priory",
  "Eglise": "Church",
  "Église": "Church",
  "Chapelle": "Chapel",
  "Château": "Castle",
  "Manoir": "Manor",
  "Abbaye": "Abbey",
  "Cathédrale": "Cathedral",
  "Prieuré": "Priory",
  "patrimoine": "heritage",
  "patrimoine historique": "historic heritage",
  "et insolite": "and unusual",
  "de la maison du Patrimoine": "of the Heritage House",
  "nocturne": "nocturnal",
  "en lumières": "in lights",
  "en lumière": "in light",
  "Concours photo": "Photo contest",
  "amateurs": "amateur",
  "Randonnée": "Hike",
  "Atelier": "Workshop",
  "Découverte": "Discovery",
  "Fête": "Celebration",
  "Gratuit": "Free",
  "gratuit": "free",
  "entrée libre": "free entry",
}

const translateTitle = (titleFr: string): string => {
  let result = titleFr

  // Sort keys by length (longest first) to avoid partial matches
  const sortedKeys = Object.keys(TERM_MAP).sort((a, b) => b.length - a.length)

  for (const fr of sortedKeys) {
    if (result.includes(fr)) {
      result = result.replace(fr, TERM_MAP[fr])
    }
  }

  return result
}

const translateDescription = (descFr: string): string => {
  if (!descFr || descFr.length < 10) return descFr

  let result = descFr

  const descTerms: Record<string, string> = {
    "Découvrez": "Discover",
    "Venez découvrir": "Come discover",
    "Venez": "Come",
    "à travers": "through",
    "en nocturne": "by night",
    "patrimoine normand": "Norman heritage",
    "patrimoine": "heritage",
    "illuminations": "illuminations",
    "animations": "activities",
    "visites guidées": "guided tours",
    "visite guidée": "guided tour",
    "entrée gratuite": "free entry",
    "entrée libre": "free entry",
    "ouvert à tous": "open to all",
    "tout public": "all audiences",
    "en famille": "for families",
    "Normandie": "Normandy",
    "département": "department",
    "commune": "municipality",
    "église": "church",
    "abbaye": "abbey",
    "château": "castle",
    "manoir": "manor",
    "chapelle": "chapel",
    "cathédrale": "cathedral",
    "spectacle": "show",
    "concert": "concert",
    "exposition": "exhibition",
    "conférence": "conference",
  }

  const sortedKeys = Object.keys(descTerms).sort((a, b) => b.length - a.length)
  for (const fr of sortedKeys) {
    const regex = new RegExp(fr, "gi")
    result = result.replace(regex, descTerms[fr])
  }

  return result
}

const main = async () => {
  const events = await prisma.event.findMany({
    where: { titleEn: null },
    select: { id: true, titleFr: true, descriptionFr: true, pricingFr: true },
  })

  console.log(`${events.length} events to translate\n`)

  let count = 0
  for (const event of events) {
    const titleEn = translateTitle(event.titleFr)
    const descriptionEn = event.descriptionFr ? translateDescription(event.descriptionFr) : null
    const pricingEn = event.pricingFr
      ? event.pricingFr
          .replace("Gratuit", "Free")
          .replace("gratuit", "free")
          .replace("entrée libre", "free entry")
          .replace("Entrée libre", "Free entry")
      : null

    await prisma.event.update({
      where: { id: event.id },
      data: { titleEn, descriptionEn, pricingEn },
    })

    count++
    if (count % 100 === 0) console.log(`${count}/${events.length} translated`)
  }

  console.log(`\nDone: ${count} events translated`)
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error("Translation failed:", e)
  process.exit(1)
})
