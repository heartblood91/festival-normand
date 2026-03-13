import { describe, it, expect } from "vitest"
import { contactSchema, DEPARTMENT_EMAILS, DEPARTMENT_OPTIONS } from "./contact-schema"

describe("contactSchema", () => {
  const validData = {
    name: "Jean Dupont",
    email: "jean@example.fr",
    department: "CALVADOS" as const,
    message: "Bonjour, je souhaite des informations sur le festival.",
  }

  it("validates correct form data", () => {
    const result = contactSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it("rejects empty name", () => {
    const result = contactSchema.safeParse({ ...validData, name: "" })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.name).toBeDefined()
    }
  })

  it("rejects name too short", () => {
    const result = contactSchema.safeParse({ ...validData, name: "J" })
    expect(result.success).toBe(false)
  })

  it("rejects invalid email", () => {
    const result = contactSchema.safeParse({ ...validData, email: "not-an-email" })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.email).toBeDefined()
    }
  })

  it("rejects missing department", () => {
    const result = contactSchema.safeParse({ ...validData, department: "" })
    expect(result.success).toBe(false)
  })

  it("rejects invalid department", () => {
    const result = contactSchema.safeParse({ ...validData, department: "PARIS" })
    expect(result.success).toBe(false)
  })

  it("rejects short message", () => {
    const result = contactSchema.safeParse({ ...validData, message: "Hi" })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.message).toBeDefined()
    }
  })

  it("rejects honeypot filled in", () => {
    const result = contactSchema.safeParse({ ...validData, honeypot: "spam bot" })
    expect(result.success).toBe(false)
  })

  it("accepts empty honeypot", () => {
    const result = contactSchema.safeParse({ ...validData, honeypot: "" })
    expect(result.success).toBe(true)
  })
})

describe("DEPARTMENT_EMAILS", () => {
  it("has an email for every department option", () => {
    DEPARTMENT_OPTIONS.forEach((dept) => {
      expect(DEPARTMENT_EMAILS[dept.value]).toBeDefined()
      expect(DEPARTMENT_EMAILS[dept.value]).toContain("@")
    })
  })

  it("has 5 department emails", () => {
    expect(Object.keys(DEPARTMENT_EMAILS)).toHaveLength(5)
  })
})
