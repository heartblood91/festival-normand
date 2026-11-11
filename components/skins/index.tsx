import { MILLENNIUM_SLOTS } from "@/components/skins/millennium"
import type { SkinKey } from "@/lib/skins/registry"
import type { ActiveSkin } from "@/lib/queries/skin"
import type { Locale } from "@/lib/i18n/config"
import type { SkinSlot as Slot, SkinSlots } from "@/components/skins/types"

/** One entry per key of lib/skins/registry.ts; see docs/habillages.md. */
const SKIN_SLOTS: Record<SkinKey, SkinSlots> = {
  millennium: MILLENNIUM_SLOTS,
}

type SkinSlotProps = { skin: ActiveSkin | null; slot: Slot; locale: Locale }

export const SkinSlot = ({ skin, slot, locale }: SkinSlotProps) => {
  if (!skin) return null
  const Component = SKIN_SLOTS[skin.key]?.[slot]
  return Component ? <Component locale={locale} themeSlug={skin.themeSlug} slot={slot} /> : null
}
