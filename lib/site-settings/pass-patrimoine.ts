import { z } from "zod"
import { PASS_PATRIMOINE_ORIGIN, isPassPatrimoineSiteUrl } from "@/lib/pass-patrimoine/url"

export const PASS_SETTINGS_KEY = "pass-patrimoine"

export const BANNER_PAGES = ["home", "programme", "event"] as const
export type BannerPage = (typeof BANNER_PAGES)[number]

const DATE = /^\d{4}-\d{2}-\d{2}$/

const optionalDate = z
  .string()
  .trim()
  .refine((value) => !value || DATE.test(value), "Date invalide (aaaa-mm-jj)")
  .transform((value) => value || null)
  .nullable()

const bannerText = z
  .string()
  .trim()
  .max(280, "Le texte du bandeau ne peut pas dépasser 280 caractères")

export const passPatrimoineSettingsSchema = z
  .object({
    /** Master switch of the event badges, the card badge and the programme filter. */
    passEnabled: z.boolean(),
    bannerEnabled: z.boolean(),
    bannerTextFr: bannerText,
    bannerTextEn: bannerText,
    bannerUrl: z
      .string()
      .trim()
      .refine(
        isPassPatrimoineSiteUrl,
        "Le lien doit être une page https du site pass-patrimoine.fr"
      ),
    /** Paris calendar days, both included; null = no limit. */
    bannerStart: optionalDate,
    bannerEnd: optionalDate,
    bannerPages: z.array(z.enum(BANNER_PAGES)),
  })
  .superRefine((data, ctx) => {
    if (data.bannerStart && data.bannerEnd && data.bannerEnd < data.bannerStart) {
      ctx.addIssue({
        code: "custom",
        path: ["bannerEnd"],
        message: "La date de fin doit être identique ou postérieure à la date de début",
      })
    }
    // Better no banner than an empty one: an enabled banner needs both texts and a page.
    if (!data.bannerEnabled) return
    if (!data.bannerTextFr) {
      ctx.addIssue({ code: "custom", path: ["bannerTextFr"], message: "Texte français requis" })
    }
    if (!data.bannerTextEn) {
      ctx.addIssue({ code: "custom", path: ["bannerTextEn"], message: "Texte anglais requis" })
    }
    if (!data.bannerPages.length) {
      ctx.addIssue({
        code: "custom",
        path: ["bannerPages"],
        message: "Choisissez au moins une page d'affichage",
      })
    }
  })

export type PassPatrimoineSettings = z.infer<typeof passPatrimoineSettingsSchema>

export const DEFAULT_PASS_SETTINGS: PassPatrimoineSettings = {
  passEnabled: false,
  bannerEnabled: false,
  bannerTextFr:
    "Prolongez la visite toute l'année : le Pass Patrimoine ouvre plus de 500 sites, dont des châteaux et abbayes de Normandie.",
  bannerTextEn:
    "Keep exploring all year round: the Pass Patrimoine opens the doors of more than 500 sites, including Normandy's castles and abbeys.",
  bannerUrl: PASS_PATRIMOINE_ORIGIN,
  bannerStart: null,
  bannerEnd: null,
  bannerPages: ["home", "programme", "event"],
}

/**
 * Stored JSON → settings. The row holds what the editor saved, merged over the
 * defaults; anything unreadable falls back to the defaults, i.e. everything off.
 */
export const parsePassSettings = (raw: unknown): PassPatrimoineSettings => {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return DEFAULT_PASS_SETTINGS
  const parsed = passPatrimoineSettingsSchema.safeParse({ ...DEFAULT_PASS_SETTINGS, ...raw })
  return parsed.success ? parsed.data : DEFAULT_PASS_SETTINGS
}

/** `today` is the Paris calendar day (yyyy-mm-dd). */
export const isPassBannerVisible = (
  settings: PassPatrimoineSettings,
  page: BannerPage,
  today: string
) =>
  settings.bannerEnabled &&
  settings.bannerPages.includes(page) &&
  (!settings.bannerStart || today >= settings.bannerStart) &&
  (!settings.bannerEnd || today <= settings.bannerEnd)

/**
 * Changes whenever the banner content changes, so a visitor who closed one
 * campaign still sees the next one.
 */
export const passBannerVersion = (settings: PassPatrimoineSettings) => {
  const source = [
    settings.bannerTextFr,
    settings.bannerTextEn,
    settings.bannerUrl,
    settings.bannerStart,
    settings.bannerEnd,
  ].join("|")
  let hash = 5381
  for (let i = 0; i < source.length; i++) hash = ((hash << 5) + hash + source.charCodeAt(i)) | 0
  return (hash >>> 0).toString(36)
}

/** localStorage key remembering that a visitor closed this version of the banner. */
export const passBannerStorageKey = (version: string) => `pel-pass-banner-dismissed:${version}`
