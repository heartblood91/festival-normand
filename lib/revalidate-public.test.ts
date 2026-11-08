import { beforeEach, describe, expect, it, vi } from "vitest"

const { revalidatePath } = vi.hoisted(() => ({ revalidatePath: vi.fn() }))
vi.mock("next/cache", () => ({ revalidatePath }))

import { revalidatePublic } from "@/lib/revalidate-public"

describe("revalidatePublic", () => {
  beforeEach(() => revalidatePath.mockClear())

  it("invalidates each public path in every locale, since URLs always carry one", () => {
    revalidatePublic("/evenement/abbaye", "/evenements")
    expect(revalidatePath.mock.calls.map(([path]) => path)).toEqual([
      "/fr/evenement/abbaye",
      "/en/evenement/abbaye",
      "/fr/evenements",
      "/en/evenements",
    ])
  })

  it("maps the home page to the locale root", () => {
    revalidatePublic("/")
    expect(revalidatePath.mock.calls.map(([path]) => path)).toEqual(["/fr", "/en"])
  })
})
