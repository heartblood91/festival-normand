import { describe, it, expect, vi, beforeEach } from "vitest"

const { mockGetUser, mockUploadImage } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockUploadImage: vi.fn(),
}))

vi.mock("@/lib/rbac", () => ({ getAuthenticatedUser: mockGetUser }))
vi.mock("@/lib/storage", () => ({ uploadImage: mockUploadImage }))

import { POST } from "./route"

const makeRequest = (file?: File): Request => {
  const form = new FormData()
  if (file) form.append("file", file)
  form.append("preset", "content")
  return new Request("http://localhost/api/upload", { method: "POST", body: form })
}

const fakeFile = () => new File([new Uint8Array([1, 2, 3])], "test.png", { type: "image/png" })

describe("POST /api/upload", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUploadImage.mockResolvedValue("https://blob.example/test.png")
  })

  it("returns 401 and never uploads when the caller is unauthenticated", async () => {
    mockGetUser.mockResolvedValue(null)

    const res = await POST(makeRequest(fakeFile()))

    expect(res.status).toBe(401)
    expect(mockUploadImage).not.toHaveBeenCalled()
  })

  it("uploads when the caller is an authenticated admin user", async () => {
    mockGetUser.mockResolvedValue({ id: "u1", name: "Admin", email: "a@x.fr", role: "ADMIN" })

    const res = await POST(makeRequest(fakeFile()))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.url).toBe("https://blob.example/test.png")
    expect(mockUploadImage).toHaveBeenCalledOnce()
  })

  it("returns 400 for an authenticated caller with no file", async () => {
    mockGetUser.mockResolvedValue({ id: "u1", name: "Admin", email: "a@x.fr", role: "ADMIN" })

    const res = await POST(makeRequest())

    expect(res.status).toBe(400)
    expect(mockUploadImage).not.toHaveBeenCalled()
  })
})
