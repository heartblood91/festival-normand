"use server"

import { Department } from "@prisma/client"
import { revalidatePath, updateTag } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/rbac"

export type DepartmentSettingsActionResult = {
  success: boolean
  message: string
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

// One `<input type="date" name={department}>` per department; empty = no embargo.
export const updateDepartmentEmbargo = async (
  formData: FormData
): Promise<DepartmentSettingsActionResult> => {
  try {
    await requireRole("EDITOR")

    const updates = Object.values(Department).map((department) => {
      const raw = ((formData.get(department) as string | null) ?? "").trim()
      if (raw && !DATE_PATTERN.test(raw)) {
        throw new Error(`Date invalide pour ${department}.`)
      }
      const publishFrom = raw ? new Date(`${raw}T00:00:00`) : null
      return prisma.departmentSetting.upsert({
        where: { department },
        update: { publishFrom },
        create: { department, publishFrom },
      })
    })

    await prisma.$transaction(updates)
    updateTag("events")
    // An embargoed event page renders notFound(); ISR keeps that 404 until it is revalidated.
    revalidatePath("/[locale]/(public)/evenement/[slug]", "page")

    return { success: true, message: "Dates de publication mises à jour." }
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Une erreur est survenue lors de la mise à jour.",
    }
  }
}
