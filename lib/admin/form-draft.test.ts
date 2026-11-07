import { describe, it, expect, beforeEach } from "vitest"
import {
  DRAFT_MAX_AGE_MS,
  clearDraft,
  draftKey,
  hasChanges,
  leavesForm,
  readDraft,
  writeDraft,
} from "./form-draft"

const createStorage = () => {
  const data = new Map<string, string>()
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
    removeItem: (key: string) => void data.delete(key),
  }
}

describe("form drafts", () => {
  let storage: ReturnType<typeof createStorage>
  const now = new Date("2027-03-01T10:00:00Z").getTime()

  beforeEach(() => {
    storage = createStorage()
  })

  it("keys drafts by content type and record", () => {
    expect(draftKey("event", "abc")).toBe("pel-admin-draft:event:abc")
    expect(draftKey("news")).toBe("pel-admin-draft:news:new")
  })

  it("round-trips string values with their save time", () => {
    writeDraft(storage, "k", { titleFr: "Titre" }, now)
    expect(readDraft(storage, "k", now)).toEqual({ savedAt: now, values: { titleFr: "Titre" } })
  })

  it("ignores corrupt, foreign and expired drafts", () => {
    storage.setItem("a", "{not json")
    storage.setItem("b", JSON.stringify({ savedAt: now, values: { titleFr: 3 } }))
    writeDraft(storage, "c", { titleFr: "x" }, now - DRAFT_MAX_AGE_MS - 1)
    expect(readDraft(storage, "a", now)).toBeNull()
    expect(readDraft(storage, "b", now)).toBeNull()
    expect(readDraft(storage, "c", now)).toBeNull()
  })

  it("clears a draft", () => {
    writeDraft(storage, "k", { titleFr: "x" }, now)
    clearDraft(storage, "k")
    expect(readDraft(storage, "k", now)).toBeNull()
  })

  it("compares snapshots field by field, missing meaning empty", () => {
    expect(hasChanges({ a: "1", b: "" }, { a: "1" })).toBe(false)
    expect(hasChanges({ a: "1" }, { a: "2" })).toBe(true)
    expect(hasChanges({ a: "1" }, { a: "1", c: "new" })).toBe(true)
  })
})

describe("leavesForm", () => {
  const current = "http://127.0.0.1:3012/fr/admin/events/abc/edit"

  it("guards links to another page of the site", () => {
    expect(leavesForm({ href: "/admin/events" }, current)).toBe(true)
    expect(
      leavesForm({ href: "http://127.0.0.1:3012/fr/admin/events/abc/edit?x=1" }, current)
    ).toBe(true)
  })

  it("lets in-page, new-tab, download and external links through", () => {
    expect(leavesForm({ href: "#cover" }, current)).toBe(false)
    expect(leavesForm({ href: "/fr/evenements", target: "_blank" }, current)).toBe(false)
    expect(leavesForm({ href: "/file.pdf", download: true }, current)).toBe(false)
    expect(leavesForm({ href: "https://example.org/" }, current)).toBe(false)
  })
})
