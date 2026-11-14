import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const { revalidatePath, updateTag } = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  updateTag: vi.fn(),
}))
vi.mock("next/cache", () => ({ revalidatePath, updateTag }))

import { expirePublicData, expirePublicDataNow, revalidatePublic } from "@/lib/revalidate-public"

describe("revalidatePublic", () => {
  beforeEach(() => revalidatePath.mockClear())

  it("invalidates each public path in every locale, since URLs always carry one", () => {
    revalidatePublic("/evenement/abbaye", "/evenements")
    expect(revalidatePath.mock.calls.map(([path]) => path)).toEqual([
      "/fr/evenement/abbaye",
      "/en/evenement/abbaye",
      "/fr/evenements",
      "/en/evenements",
      "/sitemap.xml",
    ])
  })

  it("maps the home page to the locale root", () => {
    revalidatePublic("/")
    expect(revalidatePath.mock.calls.map(([path]) => path)).toEqual(["/fr", "/en", "/sitemap.xml"])
  })
})

describe("expirePublicData", () => {
  it("expires every given data tag at once", () => {
    expirePublicData("themes", "events")
    expect(updateTag.mock.calls).toEqual([["themes"], ["events"]])
  })
})

describe("expirePublicDataNow", () => {
  const nextGlobal = globalThis as { __incrementalCache?: unknown }
  afterEach(() => {
    delete nextGlobal.__incrementalCache
  })

  it("expires the tags through the cache Next registered on its first request", async () => {
    const revalidateTag = vi.fn().mockResolvedValue(undefined)
    nextGlobal.__incrementalCache = { revalidateTag }
    await expect(expirePublicDataNow("events")).resolves.toBe(true)
    // No duration: the cache handler expires the tag instead of marking it stale.
    expect(revalidateTag).toHaveBeenCalledWith(["events"])
  })

  it("reports that nothing was expired before any request reached the server", async () => {
    await expect(expirePublicDataNow("events")).resolves.toBe(false)
  })
})
