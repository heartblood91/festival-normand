import { describe, it, expect, vi, beforeEach } from "vitest"

const { mockSend } = vi.hoisted(() => ({
  mockSend: vi.fn().mockResolvedValue({ id: "test-id" }),
}))

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: mockSend }
  },
}))

import { sendContactEmail, type ContactActionResult } from "./contact"

const initialState: ContactActionResult = {
  success: false,
  message: "",
}

const createFormData = (data: Record<string, string>): FormData => {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value)
  })
  return formData
}

const validFormData = {
  name: "Jean Dupont",
  email: "jean@example.fr",
  department: "CALVADOS",
  message: "Bonjour, je souhaite des informations sur le festival.",
  honeypot: "",
}

describe("sendContactEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSend.mockResolvedValue({ id: "test-id" })
  })

  it("sends email successfully with valid data", async () => {
    const result = await sendContactEmail(initialState, createFormData(validFormData))
    expect(result.success).toBe(true)
    expect(result.message).toContain("succès")
  })

  it("returns validation errors for invalid data", async () => {
    const result = await sendContactEmail(
      initialState,
      createFormData({ ...validFormData, email: "invalid" })
    )
    expect(result.success).toBe(false)
    expect(result.errors?.email).toBeDefined()
  })

  it("silently succeeds for honeypot submissions", async () => {
    const result = await sendContactEmail(
      initialState,
      createFormData({
        ...validFormData,
        email: "honeypot-test@example.fr",
        honeypot: "I am a bot",
      })
    )
    expect(result.success).toBe(true)
    expect(mockSend).not.toHaveBeenCalled()
  })

  it("returns error for missing name", async () => {
    const result = await sendContactEmail(
      initialState,
      createFormData({ ...validFormData, name: "" })
    )
    expect(result.success).toBe(false)
    expect(result.errors?.name).toBeDefined()
  })

  it("returns error for short message", async () => {
    const result = await sendContactEmail(
      initialState,
      createFormData({ ...validFormData, message: "Hi" })
    )
    expect(result.success).toBe(false)
    expect(result.errors?.message).toBeDefined()
  })

  it("sends to correct department email", async () => {
    await sendContactEmail(
      initialState,
      createFormData({
        ...validFormData,
        email: "dept-test@example.fr",
        department: "MANCHE",
      })
    )
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "patrimoine@manche.fr",
      })
    )
  })

  it("handles Resend API errors gracefully", async () => {
    mockSend.mockRejectedValueOnce(new Error("API error"))

    const result = await sendContactEmail(
      initialState,
      createFormData({
        ...validFormData,
        email: "error-test@example.fr",
      })
    )
    expect(result.success).toBe(false)
    expect(result.message).toContain("erreur")
  })
})
