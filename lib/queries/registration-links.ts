import { prisma } from "@/lib/prisma"

export const getRegistrationLinks = async () =>
  prisma.registrationLink.findMany({ orderBy: { order: "asc" } })

export type RegistrationLinkItem = Awaited<ReturnType<typeof getRegistrationLinks>>[number]
