import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { scrypt, randomBytes, type ScryptOptions } from "node:crypto"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const hashPassword = (password: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const salt = randomBytes(16).toString("hex")
    const opts: ScryptOptions = { N: 16384, r: 16, p: 1, maxmem: 128 * 16384 * 16 * 2 }
    scrypt(password.normalize("NFKC"), salt, 64, opts, (err, derivedKey) => {
      if (err) reject(err)
      else resolve(`${salt}:${derivedKey.toString("hex")}`)
    })
  })

const main = async () => {
  const email = process.argv[2]
  const name = process.argv[3]
  const password = process.argv[4]
  const role = (process.argv[5] as "ADMIN" | "EDITOR") || "ADMIN"

  if (!email || !name || !password) {
    console.error("Usage: tsx seed-admin.ts <email> <name> <password> [role]")
    process.exit(1)
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    console.log(`User ${email} already exists, updating password + role`)
    const hash = await hashPassword(password)
    await prisma.user.update({
      where: { email },
      data: { name, role, emailVerified: true },
    })
    const credentialAccount = await prisma.account.findFirst({
      where: { userId: existing.id, providerId: "credential" },
    })
    if (credentialAccount) {
      await prisma.account.update({
        where: { id: credentialAccount.id },
        data: { password: hash },
      })
    } else {
      await prisma.account.create({
        data: {
          userId: existing.id,
          accountId: existing.id,
          providerId: "credential",
          password: hash,
        },
      })
    }
    console.log(`Updated: ${email} as ${role}`)
    return
  }

  const hash = await hashPassword(password)
  const user = await prisma.user.create({
    data: {
      name,
      email,
      emailVerified: true,
      role,
    },
  })
  await prisma.account.create({
    data: {
      userId: user.id,
      accountId: user.id,
      providerId: "credential",
      password: hash,
    },
  })
  console.log(`Created: ${email} as ${role} with id ${user.id}`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
