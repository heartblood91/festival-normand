import { describe, it, expect, vi, beforeEach } from "vitest"

const { mockSend, mockVerify } = vi.hoisted(() => ({
  mockSend: vi.fn().mockResolvedValue({ id: "test-id" }),
  mockVerify: vi.fn(),
}))

vi.mock("@/lib/turnstile", () => ({ verifyTurnstile: mockVerify }))

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
    vi.stubEnv("RESEND_API_KEY", "re_test_key")
    mockSend.mockResolvedValue({ id: "test-id" })
    mockVerify.mockResolvedValue(true)
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

  it("refuses a failed anti-spam check and keeps what was typed", async () => {
    mockVerify.mockResolvedValue(false)
    const data = { ...validFormData, email: "turnstile-test@example.fr" }
    const result = await sendContactEmail(initialState, createFormData(data))
    expect(result).toMatchObject({ success: false, values: { email: data.email } })
    expect(result.message).toContain("anti-spam")
    expect(mockSend).not.toHaveBeenCalled()
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

  it("keeps the submitted values when validation fails", async () => {
    const result = await sendContactEmail(
      initialState,
      createFormData({ ...validFormData, email: "not-an-email" })
    )
    expect(result.values).toMatchObject({ name: "Jean Dupont", department: "CALVADOS" })
  })

  it("offers a prefilled mailto link to the department when email is not configured", async () => {
    vi.stubEnv("RESEND_API_KEY", "")
    const result = await sendContactEmail(
      initialState,
      createFormData({ ...validFormData, email: "no-mailer@example.fr" })
    )
    expect(mockSend).not.toHaveBeenCalled()
    expect(result.success).toBe(false)
    expect(result.fallback?.email).toBe("patrimoine@calvados.fr")
    expect(result.fallback?.href).toBe(
      `mailto:patrimoine@calvados.fr?subject=${encodeURIComponent("[Contact] Message de Jean Dupont")}&body=${encodeURIComponent(validFormData.message)}`
    )
  })
})
