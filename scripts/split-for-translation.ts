import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { writeFileSync, mkdirSync } from "fs"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const main = async () => {
  const outDir = "/tmp/pel-translate"
  mkdirSync(outDir, { recursive: true })

  const events = await prisma.event.findMany({
    where: { titleEn: null },
    select: { id: true, titleFr: true, descriptionFr: true, pricingFr: true },
    orderBy: { createdAt: "asc" },
  })

  const batchSize = Math.ceil(events.length / 5)
  for (let i = 0; i < 5; i++) {
    const batch = events.slice(i * batchSize, (i + 1) * batchSize)
    writeFileSync(`${outDir}/batch-${i + 1}.json`, JSON.stringify(batch, null, 2))
    console.log(`batch-${i + 1}: ${batch.length} events`)
  }
  console.log(`Total: ${events.length}`)
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
