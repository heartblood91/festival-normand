import type { ComponentType } from "react"
import type { Locale } from "@/lib/i18n/config"

/** Places of the public layout where a skin can add content. */
export type SkinSlot = "beforeHeader" | "afterHeader" | "beforeFooter"

export type SkinSlotProps = {
  locale: Locale
  themeSlug: string
  slot: SkinSlot
  /** Logo chosen in the theme form; null lets the skin use its bundled example. */
  logo: string | null
}

export type SkinSlots = Partial<Record<SkinSlot, ComponentType<SkinSlotProps>>>
