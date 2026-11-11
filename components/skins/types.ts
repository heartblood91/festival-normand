import type { ComponentType } from "react"
import type { Locale } from "@/lib/i18n/config"

/** Places of the public layout where a skin can add content. */
export type SkinSlot = "beforeHeader" | "afterHeader" | "beforeFooter"

export type SkinSlotProps = { locale: Locale; themeSlug: string; slot: SkinSlot }

export type SkinSlots = Partial<Record<SkinSlot, ComponentType<SkinSlotProps>>>
