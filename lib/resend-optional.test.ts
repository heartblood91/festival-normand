import { describe, it, expect, vi } from "vitest"

vi.hoisted(() => {
  delete process.env.RESEND_API_KEY
})

vi.mock("@/lib/prisma", () => ({ prisma: {} }))
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }))

// The real Resend SDK throws "Missing API key" when constructed without a key:
// these modules must still load so admin login works without email configured.
import { auth } from "@/lib/auth"
import { inviteUser } from "@/lib/actions/users"

describe("modules that send email", () => {
  it("load without RESEND_API_KEY", () => {
    expect(auth).toBeDefined()
    expect(inviteUser).toBeTypeOf("function")
  })
})
