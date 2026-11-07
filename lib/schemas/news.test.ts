import { describe, it, expect } from "vitest"
import { newsSchema } from "./news"

describe("newsSchema", () => {
  const valid = {
    titleFr: "Programme 2027",
    slug: "programme-2027",
    contentFr: "<p>Le programme est en ligne.</p>",
    published: true,
    publishedAt: "2027-03-01",
  }

  it("validates an article without images", () => {
    expect(newsSchema.safeParse(valid).success).toBe(true)
  })

  it("requires image alternatives to publish", () => {
    const result = newsSchema.safeParse({
      ...valid,
      coverImage: "/uploads/a.jpg",
      contentEn: '<img src="/b.jpg" alt="">',
    })
    expect(result.error?.flatten().fieldErrors).toEqual({
      coverImageAltFr: ["Décrivez l'image de couverture (texte alternatif) avant de publier"],
      contentEn: ["1 image(s) sans texte alternatif dans le contenu"],
    })
    expect(
      newsSchema.safeParse({ ...valid, coverImage: "/uploads/a.jpg", published: false }).success
    ).toBe(true)
  })
})
