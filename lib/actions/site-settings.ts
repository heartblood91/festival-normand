"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/rbac"
import { expirePublicData, revalidatePublic } from "@/lib/revalidate-public"
import {
  PASS_SETTINGS_KEY,
  passPatrimoineSettingsSchema,
} from "@/lib/site-settings/pass-patrimoine"

export type SiteSettingsActionResult = {
  success: boolean
  message: string
  errors?: Record<string, string[]>
}

const field = (formData: FormData, name: string) =>
  ((formData.get(name) as string | null) ?? "").trim()

export const updatePassPatrimoineSettings = async (
  formData: FormData
): Promise<SiteSettingsActionResult> => {
  try {
    await requireRole("EDITOR")

    const parsed = passPatrimoineSettingsSchema.safeParse({
      passEnabled: field(formData, "passEnabled") === "true",
      bannerEnabled: field(formData, "bannerEnabled") === "true",
      bannerTextFr: field(formData, "bannerTextFr"),
      bannerTextEn: field(formData, "bannerTextEn"),
      bannerUrl: field(formData, "bannerUrl"),
      bannerStart: field(formData, "bannerStart"),
      bannerEnd: field(formData, "bannerEnd"),
      bannerPages: formData.getAll("bannerPages").map(String),
    })
    if (!parsed.success) {
      return {
        success: false,
        message: "Certains champs sont invalides.",
        errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      }
    }

    await prisma.siteSetting.upsert({
      where: { key: PASS_SETTINGS_KEY },
      update: { value: parsed.data },
      create: { key: PASS_SETTINGS_KEY, value: parsed.data },
    })
    expirePublicData("settings")
    revalidatePublic("/", "/evenements")
    revalidatePath("/[locale]/(public)/evenement/[slug]", "page")

    return { success: true, message: "Réglages du Pass Patrimoine enregistrés." }
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
