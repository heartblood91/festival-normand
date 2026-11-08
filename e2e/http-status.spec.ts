import { test, expect } from "@playwright/test"

// A Suspense boundary above a detail page flushes a 200 before notFound() runs,
// which turns missing content into soft 404s. Guard the real status codes.
test.describe("HTTP status of detail pages", () => {
  test("unknown event slug returns 404", async ({ request }) => {
    const response = await request.get("/fr/evenement/evenement-inexistant-zzz")
    expect(response.status()).toBe(404)
  })

  test("unknown news slug returns 404", async ({ request }) => {
    const response = await request.get("/fr/actualite/actualite-inexistante-zzz")
    expect(response.status()).toBe(404)
  })

  test("known event slug returns 200", async ({ request }) => {
    const response = await request.get("/fr/evenement/illumination-abbaye-aux-hommes")
    expect(response.status()).toBe(200)
  })
})
