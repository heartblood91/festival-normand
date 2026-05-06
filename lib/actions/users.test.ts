import { describe, it, expect, vi, beforeEach } from "vitest"

const { mockPrisma, mockHashPassword, mockRequireRole, mockSend, mockIsEmailEnabled } =
  vi.hoisted(() => ({
    mockPrisma: {
      user: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      account: {
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      verification: {
        findFirst: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
      },
      $transaction: vi.fn(),
    },
    mockHashPassword: vi.fn(),
    mockRequireRole: vi.fn(),
    mockSend: vi.fn().mockResolvedValue({ id: "email-id" }),
    mockIsEmailEnabled: vi.fn(() => true),
  }))

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }))
vi.mock("@/lib/rbac", () => ({ requireRole: mockRequireRole }))
vi.mock("@/lib/email", () => ({ isEmailEnabled: mockIsEmailEnabled }))
vi.mock("better-auth/crypto", () => ({ hashPassword: mockHashPassword }))
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }))
vi.mock("resend", () => ({
  Resend: class {
    emails = { send: mockSend }
  },
}))

import { inviteUser, setupAccount } from "./users"

const createFormData = (data: Record<string, string>): FormData => {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value)
  })
  return formData
}

describe("inviteUser", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRequireRole.mockResolvedValue({ id: "admin-id" })
    mockPrisma.$transaction.mockImplementation(async (cb: (tx: typeof mockPrisma) => unknown) => cb(mockPrisma))
    mockIsEmailEnabled.mockReturnValue(true)
  })

  it("creates user without a credential account so password is set later via setup-account", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null)
    mockPrisma.user.create.mockResolvedValue({ id: "user-1", email: "new@example.com" })
    mockPrisma.verification.create.mockResolvedValue({ id: "verif-1" })

    const result = await inviteUser(
      createFormData({ email: "new@example.com", role: "EDITOR" })
    )

    expect(result.success).toBe(true)
    expect(mockPrisma.user.create).toHaveBeenCalled()
    expect(mockPrisma.account.create).not.toHaveBeenCalled()
    expect(mockPrisma.verification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ identifier: "invite-user-1" }),
      })
    )
  })

  it("sends an invitation email when email is enabled", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null)
    mockPrisma.user.create.mockResolvedValue({ id: "user-1", email: "new@example.com" })
    mockPrisma.verification.create.mockResolvedValue({ id: "verif-1" })

    const result = await inviteUser(
      createFormData({ email: "new@example.com", role: "EDITOR" })
    )

    expect(result.success).toBe(true)
    expect(result.setupUrl).toBeUndefined()
    expect(mockSend).toHaveBeenCalledTimes(1)
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({ to: "new@example.com" })
    )
  })

  it("returns the setup URL and skips email when email delivery is disabled", async () => {
    mockIsEmailEnabled.mockReturnValue(false)
    mockPrisma.user.findUnique.mockResolvedValue(null)
    mockPrisma.user.create.mockResolvedValue({ id: "user-1", email: "new@example.com" })
    mockPrisma.verification.create.mockResolvedValue({ id: "verif-1" })

    const result = await inviteUser(
      createFormData({ email: "new@example.com", role: "EDITOR" })
    )

    expect(result.success).toBe(true)
    expect(result.setupUrl).toMatch(/\/admin\/setup-account\?token=.+&email=new%40example\.com$/)
    expect(mockSend).not.toHaveBeenCalled()
  })
})

describe("setupAccount", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockHashPassword.mockResolvedValue("salt:hashedvalue")
    mockPrisma.$transaction.mockImplementation(async (cb: (tx: typeof mockPrisma) => unknown) => cb(mockPrisma))
  })

  it("hashes the password, upserts the credential account and deletes the token", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: "user-1" })
    mockPrisma.verification.findFirst.mockResolvedValue({
      id: "verif-1",
      expiresAt: new Date(Date.now() + 60_000),
    })
    mockPrisma.account.findFirst.mockResolvedValue(null)

    const result = await setupAccount({
      token: "token-abc",
      email: "new@example.com",
      password: "averysafe123",
    })

    expect(result.success).toBe(true)
    expect(mockHashPassword).toHaveBeenCalledWith("averysafe123")
    expect(mockPrisma.account.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: "user-1",
        accountId: "user-1",
        providerId: "credential",
        password: "salt:hashedvalue",
      }),
    })
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { emailVerified: true },
    })
    expect(mockPrisma.verification.delete).toHaveBeenCalledWith({ where: { id: "verif-1" } })
  })

  it("updates an existing credential account instead of creating a duplicate", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: "user-1" })
    mockPrisma.verification.findFirst.mockResolvedValue({
      id: "verif-1",
      expiresAt: new Date(Date.now() + 60_000),
    })
    mockPrisma.account.findFirst.mockResolvedValue({ id: "acct-1" })

    const result = await setupAccount({
      token: "token-abc",
      email: "new@example.com",
      password: "averysafe123",
    })

    expect(result.success).toBe(true)
    expect(mockPrisma.account.create).not.toHaveBeenCalled()
    expect(mockPrisma.account.update).toHaveBeenCalledWith({
      where: { id: "acct-1" },
      data: { password: "salt:hashedvalue" },
    })
  })

  it("rejects an expired token and deletes it", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: "user-1" })
    mockPrisma.verification.findFirst.mockResolvedValue({
      id: "verif-1",
      expiresAt: new Date(Date.now() - 60_000),
    })

    const result = await setupAccount({
      token: "token-abc",
      email: "new@example.com",
      password: "averysafe123",
    })

    expect(result.success).toBe(false)
    expect(result.message).toMatch(/expir/i)
    expect(mockPrisma.verification.delete).toHaveBeenCalledWith({ where: { id: "verif-1" } })
    expect(mockHashPassword).not.toHaveBeenCalled()
  })

  it("rejects an unknown email", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null)

    const result = await setupAccount({
      token: "token-abc",
      email: "ghost@example.com",
      password: "averysafe123",
    })

    expect(result.success).toBe(false)
    expect(mockHashPassword).not.toHaveBeenCalled()
  })

  it("rejects a token that does not match", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: "user-1" })
    mockPrisma.verification.findFirst.mockResolvedValue(null)

    const result = await setupAccount({
      token: "wrong-token",
      email: "new@example.com",
      password: "averysafe123",
    })

    expect(result.success).toBe(false)
    expect(mockHashPassword).not.toHaveBeenCalled()
  })

  it("rejects a password shorter than 8 chars", async () => {
    const result = await setupAccount({
      token: "token-abc",
      email: "new@example.com",
      password: "short",
    })

    expect(result.success).toBe(false)
    expect(result.errors?.password).toBeDefined()
    expect(mockPrisma.user.findUnique).not.toHaveBeenCalled()
  })
})
