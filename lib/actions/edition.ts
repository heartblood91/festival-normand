"use server"

import { revalidateTag } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/rbac"
import { validateEditionSettings } from "@/lib/festival/edition"

export type EditionActionResult = {
  success: boolean
  message: string
}

const field = (formData: FormData, name: string) =>
  ((formData.get(name) as string | null) ?? "").trim()

// `@db.Date` columns: store the calendar day at UTC midnight.
const toDbDate = (isoDate: string) => new Date(`${isoDate}T00:00:00Z`)

export const updateEdition = async (formData: FormData): Promise<EditionActionResult> => {
  try {
    await requireRole("EDITOR")

    const settings = {
      year: Number(field(formData, "year")),
      dateStart: field(formData, "dateStart"),
      dateEnd: field(formData, "dateEnd"),
      bilanFrom: field(formData, "bilanFrom") || null,
    }
    const errors = validateEditionSettings(settings)
    if (errors.length > 0) return { success: false, message: errors.join(" ") }

    const data = {
      dateStart: toDbDate(settings.dateStart),
      dateEnd: toDbDate(settings.dateEnd),
      bilanFrom: settings.bilanFrom ? toDbDate(settings.bilanFrom) : null,
    }
    await prisma.edition.upsert({
      where: { year: settings.year },
      update: data,
      create: { year: settings.year, ...data },
    })
    revalidateTag("edition", "default")
    revalidateTag("events", "default")

    return { success: true, message: "Dates de l'édition enregistrées." }
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de l'enregistrement.",
    }
  }
}
