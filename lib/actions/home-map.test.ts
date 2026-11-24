import { describe, it, expect, vi } from "vitest"

const { getMapEvents } = vi.hoisted(() => ({ getMapEvents: vi.fn() }))

vi.mock("@/lib/queries/events", () => ({ getAllFilteredEventsForMap: getMapEvents }))

import { loadHomeMapEvents } from "./home-map"

describe("loadHomeMapEvents", () => {
  it("reads the current edition and falls back to French on an unknown locale", async () => {
    getMapEvents.mockResolvedValue([])

    await loadHomeMapEvents("en")
    await loadHomeMapEvents("<script>")

    expect(getMapEvents).toHaveBeenNthCalledWith(1, { edition: "current" }, "en")
    expect(getMapEvents).toHaveBeenNthCalledWith(2, { edition: "current" }, "fr")
  })
})
