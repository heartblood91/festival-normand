import { beforeEach, describe, expect, it, vi } from "vitest"
import { NextRequest } from "next/server"

const { revalidatePath, revalidateTag } = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}))
vi.mock("next/cache", () => ({ revalidatePath, revalidateTag }))

import { POST } from "./route"

const request = (body: unknown, token = "secret") =>
  new NextRequest("http://localhost/api/revalidate", {
    method: "POST",
    headers: { "x-revalidate-token": token, "content-type": "application/json" },
    body: JSON.stringify(body),
  })

describe("POST /api/revalidate", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv("REVALIDATE_TOKEN", "secret")
  })

  it("rejects a wrong token", async () => {
    const response = await POST(request({ paths: ["/fr"] }, "nope"))

    expect(response.status).toBe(401)
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it("revalidates tags and concrete paths as-is", async () => {
    const response = await POST(request({ tags: ["events"], paths: ["/fr/evenement/abbaye"] }))

    expect(response.status).toBe(200)
    expect(revalidateTag).toHaveBeenCalledWith("events", { expire: 0 })
    expect(revalidatePath).toHaveBeenCalledWith("/fr/evenement/abbaye")
  })

  it("revalidates every page of a route pattern", async () => {
    await POST(request({ paths: ["/[locale]/(public)/evenement/[slug]"] }))

    expect(revalidatePath).toHaveBeenCalledWith("/[locale]/(public)/evenement/[slug]", "page")
  })
})
