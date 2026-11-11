import { MillenniumFrieze } from "@/components/skins/millennium/frieze"
import { MillenniumRibbon } from "@/components/skins/millennium/ribbon"
import type { SkinSlots } from "@/components/skins/types"

export const MILLENNIUM_SLOTS: SkinSlots = {
  beforeHeader: MillenniumRibbon,
  afterHeader: MillenniumFrieze,
  beforeFooter: MillenniumFrieze,
}
