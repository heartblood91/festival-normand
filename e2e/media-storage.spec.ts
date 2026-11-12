import { test, expect } from "@playwright/test"
import { editorCredentials, loginAsEditor, MISSING_EDITOR } from "./helpers/admin"

const PNG_1PX = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64"
)

// Runs only against a server started with S3_* variables (see docs/deploy-self-hosted.md).
test.describe("S3 image storage", () => {
  test.skip(!process.env.E2E_S3, "Set E2E_S3=1 when the server under test has S3 configured")

  test("unknown or malformed media keys are a 404", async ({ request }) => {
    expect((await request.get("/media/cover-1-missing.webp")).status()).toBe(404)
    expect((await request.get("/media/..%2Fsecret.webp")).status()).toBe(404)
    expect((await request.get("/media/cover-1-a.png")).status()).toBe(404)
  })

  test("an upload is stored in the bucket and served by the site", async ({ page }) => {
    test.skip(!editorCredentials(), MISSING_EDITOR)
    await loginAsEditor(page)

    const upload = await page.request.post("/api/upload", {
      multipart: {
        file: { name: "photo.png", mimeType: "image/png", buffer: PNG_1PX },
        preset: "thumbnail",
      },
    })
    expect(upload.status()).toBe(200)
    const { url } = (await upload.json()) as { url: string }
    expect(url).toMatch(/^\/media\/thumbnail-\d+-[a-z0-9]+\.webp$/)

    const image = await page.request.get(url)
    expect(image.status()).toBe(200)
    expect(image.headers()["content-type"]).toBe("image/webp")
    expect(image.headers()["cache-control"]).toContain("immutable")
    expect((await image.body()).subarray(8, 12).toString()).toBe("WEBP")

    // next/image can optimise it like any local asset.
    const optimised = await page.request.get(
      `/_next/image?url=${encodeURIComponent(url)}&w=640&q=75`
    )
    expect(optimised.status()).toBe(200)
  })
})
