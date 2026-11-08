/** Minimal Storage surface, so tests can pass an in-memory store. */
export type DraftStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">

export type FormDraft = { savedAt: number; values: Record<string, string> }

export const DRAFT_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000

export const draftKey = (type: "event" | "news" | "page", id?: string) =>
  `pel-admin-draft:${type}:${id ?? "new"}`

const isStringRecord = (value: unknown): value is Record<string, string> =>
  typeof value === "object" &&
  value !== null &&
  !Array.isArray(value) &&
  Object.values(value).every((entry) => typeof entry === "string")

export const readDraft = (storage: DraftStorage, key: string, now: number): FormDraft | null => {
  try {
    const parsed: unknown = JSON.parse(storage.getItem(key) ?? "null")
    if (typeof parsed !== "object" || parsed === null) return null
    const { savedAt, values } = parsed as Partial<FormDraft>
    if (typeof savedAt !== "number" || !isStringRecord(values)) return null
    return now - savedAt > DRAFT_MAX_AGE_MS ? null : { savedAt, values }
  } catch {
    return null
  }
}

export const writeDraft = (
  storage: DraftStorage,
  key: string,
  values: Record<string, string>,
  now: number
) => {
  try {
    storage.setItem(key, JSON.stringify({ savedAt: now, values }))
  } catch {
    // Quota or private mode: the draft is a convenience, the form still works.
  }
}

export const clearDraft = (storage: DraftStorage, key: string) => {
  try {
    storage.removeItem(key)
  } catch {
    // Same as above.
  }
}

export const hasChanges = (
  initial: Record<string, string>,
  current: Record<string, string>
): boolean =>
  [...new Set([...Object.keys(initial), ...Object.keys(current)])].some(
    (field) => (initial[field] ?? "") !== (current[field] ?? "")
  )

/**
 * True when following a link would unload the form: another page of the same
 * site. Hash links, new tabs and external sites are left to the browser
 * (external ones trigger beforeunload anyway).
 */
export const leavesForm = (
  link: { href: string; target?: string; download?: boolean },
  current: string
): boolean => {
  if (link.download || (link.target && link.target !== "_self")) return false
  const to = new URL(link.href, current)
  const from = new URL(current)
  return to.origin === from.origin && (to.pathname !== from.pathname || to.search !== from.search)
}
