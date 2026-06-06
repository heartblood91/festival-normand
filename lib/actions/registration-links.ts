"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { registrationLinkUrlSchema } from "@/lib/schemas/registration-link"

export type RegistrationLinkActionResult = {
  success: boolean
  message: string
}

// The 5 Norman departments are fixed, so the admin only edits their URLs. The
// form posts one field per link id; we validate and update each in a transaction.
export const updateRegistrationLinks = async (
  formData: FormData
): Promise<RegistrationLinkActionResult> => {
  try {
    const links = await prisma.registrationLink.findMany()

    const updates = links.map((link) => {
      const raw = ((formData.get(link.id) as string) ?? "").trim()
      const parsed = registrationLinkUrlSchema.safeParse(raw)
      if (!parsed.success) {
        throw new Error(`URL invalide pour ${link.department}.`)
      }
      return prisma.registrationLink.update({ where: { id: link.id }, data: { url: parsed.data } })
    })

    await prisma.$transaction(updates)

    revalidatePath("/fr/inscription")
    revalidatePath("/en/inscription")

    return { success: true, message: "Liens d'inscription mis à jour." }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Une erreur est survenue lors de la mise à jour.",
    }
  }
}
