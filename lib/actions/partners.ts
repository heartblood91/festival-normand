"use server"

import { revalidatePath, revalidateTag } from "next/cache"
import { prisma } from "@/lib/prisma"
import { partnerSchema } from "@/lib/schemas/partner"

export type PartnerActionResult = {
  success: boolean
  message: string
  errors?: Record<string, string[]>
  partnerId?: string
}

export const getAdminPartners = async () => {
  return prisma.partner.findMany({
    orderBy: { order: "asc" },
  })
}

export type AdminPartnerListItem = Awaited<ReturnType<typeof getAdminPartners>>[number]

export const getAdminPartnerById = async (id: string) => {
  return prisma.partner.findUnique({ where: { id } })
}

export const createPartner = async (formData: FormData): Promise<PartnerActionResult> => {
  try {
    const raw = extractPartnerFormData(formData)
    const result = partnerSchema.safeParse(raw)

    if (!result.success) {
      return {
        success: false,
        message: "Veuillez corriger les erreurs dans le formulaire.",
        errors: result.error.flatten().fieldErrors as Record<string, string[]>,
      }
    }

    const data = result.data

    const partner = await prisma.partner.create({
      data: {
        nameFr: data.nameFr,
        nameEn: data.nameEn || null,
        logo: data.logo || null,
        website: data.website || null,
        order: data.order,
      },
    })

    revalidateTag("partners")
    revalidatePath("/")

    return {
      success: true,
      message: "Partenaire créé avec succès.",
      partnerId: partner.id,
    }
  } catch {
    return {
      success: false,
      message: "Une erreur est survenue lors de la création du partenaire.",
    }
  }
}

export const updatePartner = async (
  id: string,
  formData: FormData
): Promise<PartnerActionResult> => {
  try {
    const raw = extractPartnerFormData(formData)
    const result = partnerSchema.safeParse(raw)

    if (!result.success) {
      return {
        success: false,
        message: "Veuillez corriger les erreurs dans le formulaire.",
        errors: result.error.flatten().fieldErrors as Record<string, string[]>,
      }
    }

    const data = result.data

    await prisma.partner.update({
      where: { id },
      data: {
        nameFr: data.nameFr,
        nameEn: data.nameEn || null,
        logo: data.logo || null,
        website: data.website || null,
        order: data.order,
      },
    })

    revalidateTag("partners")
    revalidatePath("/")

    return {
      success: true,
      message: "Partenaire mis à jour avec succès.",
      partnerId: id,
    }
  } catch {
    return {
      success: false,
      message: "Une erreur est survenue lors de la mise à jour du partenaire.",
    }
  }
}

export const deletePartner = async (id: string): Promise<PartnerActionResult> => {
  try {
    await prisma.partner.delete({ where: { id } })

    revalidateTag("partners")
    revalidatePath("/")

    return {
      success: true,
      message: "Partenaire supprimé avec succès.",
    }
  } catch {
    return {
      success: false,
      message: "Une erreur est survenue lors de la suppression du partenaire.",
    }
  }
}

export const reorderPartners = async (
  orderedIds: string[]
): Promise<PartnerActionResult> => {
  try {
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.partner.update({
          where: { id },
          data: { order: index },
        })
      )
    )

    revalidateTag("partners")
    revalidatePath("/")

    return {
      success: true,
      message: "Ordre des partenaires mis à jour.",
    }
  } catch {
    return {
      success: false,
      message: "Une erreur est survenue lors de la réorganisation des partenaires.",
    }
  }
}

const extractPartnerFormData = (formData: FormData) => ({
  nameFr: (formData.get("nameFr") as string) ?? "",
  nameEn: (formData.get("nameEn") as string) ?? "",
  logo: (formData.get("logo") as string) ?? "",
  website: (formData.get("website") as string) ?? "",
  order: (formData.get("order") as string) ?? "0",
})
