import { createHash } from "node:crypto"
import { normalizeEventIds } from "@/lib/travel-book/favorites"

/** Same selection, same key: sharing twice reuses one travel book row. */
export const travelBookKey = (ids: string[]) =>
  createHash("sha256").update(normalizeEventIds(ids).join(",")).digest("hex")
