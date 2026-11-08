"use client"

import { useCallback, useSyncExternalStore } from "react"
import { FAVORITES_STORAGE_KEY, parseFavorites, toggleFavorite } from "@/lib/travel-book/favorites"

const CHANGE_EVENT = "pel:travel-book-change"
const EMPTY: string[] = []

// useSyncExternalStore needs a stable snapshot: re-parse only when the raw value changes.
let cachedRaw: string | null = null
let cachedIds: string[] = EMPTY

const readRaw = () => {
  try {
    return window.localStorage.getItem(FAVORITES_STORAGE_KEY)
  } catch {
    return null
  }
}

const getSnapshot = () => {
  const raw = readRaw()
  if (raw !== cachedRaw) {
    cachedRaw = raw
    cachedIds = parseFavorites(raw)
  }
  return cachedIds
}

const subscribe = (onChange: () => void) => {
  // "storage" keeps other tabs in sync; the custom event covers this tab.
  window.addEventListener("storage", onChange)
  window.addEventListener(CHANGE_EVENT, onChange)
  return () => {
    window.removeEventListener("storage", onChange)
    window.removeEventListener(CHANGE_EVENT, onChange)
  }
}

const write = (ids: string[]) => {
  try {
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(ids))
  } catch {
    // Private browsing or full storage: the selection simply is not kept.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

/** Favourite event ids kept in this browser only (no account, no server copy). */
export const useFavorites = () => {
  const ids = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY)

  const toggle = useCallback((id: string) => write(toggleFavorite(getSnapshot(), id)), [])
  const addMany = useCallback(
    (newIds: string[]) =>
      write(
        newIds.reduce(
          (acc, id) => (acc.includes(id) ? acc : toggleFavorite(acc, id)),
          getSnapshot()
        )
      ),
    []
  )

  return { ids, toggle, addMany }
}
