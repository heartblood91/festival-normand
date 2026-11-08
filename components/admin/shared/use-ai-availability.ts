"use client"

import { useEffect, useState } from "react"
import { getAiAvailability } from "@/lib/actions/ai-publish"

/** null while unknown; false when no OpenRouter key is configured. */
export const useAiAvailability = (): boolean | null => {
  const [available, setAvailable] = useState<boolean | null>(null)

  useEffect(() => {
    let active = true
    getAiAvailability()
      .then((result) => active && setAvailable(result.available))
      .catch(() => active && setAvailable(false))
    return () => {
      active = false
    }
  }, [])

  return available
}
