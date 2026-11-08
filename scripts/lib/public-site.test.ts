import { describe, it, expect } from "vitest"
import { decodeRscPayload, extractEventsFromRsc, findPublicSlug } from "./public-site"

const rsc = `35:["$","div",null,{"events":[{"id":"a","titleFr":"Nuit \\"Rome\\" [1]","slug":"nuit-rome-1","city":"VIEUX","dateStart":"2026-05-29T22:00:00.000Z","latitude":49.1,"longitude":-0.4},{"id":"b","titleFr":"Le Thil","slug":"le-thil","city":"LE THIL","dateStart":null}]}]`

describe("public site inventory", () => {
  it("decodes the Next.js flight chunks embedded in the HTML", () => {
    const html = `<script>self.__next_f.push([1,${JSON.stringify(rsc.slice(0, 20))}])</script><script>self.__next_f.push([1,${JSON.stringify(rsc.slice(20))}])</script>`
    expect(decodeRscPayload(html)).toBe(rsc)
  })

  it("extracts events even when titles contain quotes and brackets", () => {
    expect(extractEventsFromRsc(rsc)).toEqual([
      {
        slug: "nuit-rome-1",
        titleFr: 'Nuit "Rome" [1]',
        city: "VIEUX",
        dateStart: "2026-05-29T22:00:00.000Z",
        latitude: 49.1,
        longitude: -0.4,
      },
      {
        slug: "le-thil",
        titleFr: "Le Thil",
        city: "LE THIL",
        dateStart: null,
        latitude: null,
        longitude: null,
      },
    ])
  })

  it("matches numeric slug suffixes only", () => {
    const slugs = new Set(["chateau-de-canon-2", "chateau-de-canon-ouest"])
    expect(findPublicSlug("chateau-de-canon", slugs)).toBe("chateau-de-canon-2")
    expect(findPublicSlug("chateau", slugs)).toBeNull()
  })
})
