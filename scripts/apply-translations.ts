import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { readFileSync } from "fs"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

type TranslatedEvent = {
  id: string
  titleEn: string
  descriptionEn: string
  pricingEn: string | null
}

const main = async () => {
  const all: TranslatedEvent[] = []
  for (let i = 1; i <= 5; i++) {
    const path = `/tmp/pel-translate/translated-${i}.json`
    const raw = readFileSync(path, "utf-8")
    const parsed = JSON.parse(raw) as TranslatedEvent[]
    all.push(...parsed)
    console.log(`Loaded batch-${i}: ${parsed.length} events`)
  }

  console.log(`\nTotal: ${all.length} translations to apply\n`)

  let updated = 0
  for (const t of all) {
    await prisma.event.update({
      where: { id: t.id },
      data: {
        titleEn: t.titleEn,
        descriptionEn: t.descriptionEn,
        pricingEn: t.pricingEn,
      },
    })
    updated++
    if (updated % 50 === 0) console.log(`  ${updated}/${all.length}`)
  }

  console.log(`\nDone: ${updated} events translated`)
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
