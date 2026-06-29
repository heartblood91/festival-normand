import { afterEach, describe, expect, it, vi } from "vitest"
import { geocodeNormandyAddress } from "./geocode"

const mockResponse = (features: unknown[] = [], ok = true) =>
  Promise.resolve({
    ok,
    json: () => Promise.resolve({ features }),
  } as Response)

const feature = (longitude: number, latitude: number) => ({
  geometry: { coordinates: [longitude, latitude] },
})

describe("geocodeNormandyAddress", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("returns the first Normandy result from api-adresse", async () => {
    const fetchMock = vi.fn(() =>
      mockResponse([feature(4.13739, 46.485445), feature(0.835626, 49.058409)])
    )
    vi.stubGlobal("fetch", fetchMock)

    const result = await geocodeNormandyAddress({
      location: "Domaine de Saint Léger - 4 Rue de la Chapelle",
      postalCode: "27170",
      city: "Le Plessis-Sainte-Opportune",
    })

    expect(result).toEqual({ latitude: 49.058409, longitude: 0.835626 })
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api-adresse.data.gouv.fr/search/?q=Domaine%20de%20Saint%20L%C3%A9ger%20-%204%20Rue%20de%20la%20Chapelle%2027170%20Le%20Plessis-Sainte-Opportune&limit=5"
    )
  })

  it("falls back to postal code and city when the full address has no Normandy result", async () => {
    const fetchMock = vi
      .fn()
      .mockReturnValueOnce(mockResponse([feature(4.13739, 46.485445)]))
      .mockReturnValueOnce(mockResponse([feature(0.858534, 49.073265)]))
    vi.stubGlobal("fetch", fetchMock)

    const result = await geocodeNormandyAddress({
      location: "Bad upstream address",
      postalCode: "27170",
      city: "Le Plessis-Sainte-Opportune",
    })

    expect(result).toEqual({ latitude: 49.073265, longitude: 0.858534 })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it("returns null when no Normandy result is found", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => mockResponse([feature(-74.153834, 45.8965683)]))
    )

    await expect(
      geocodeNormandyAddress({
        location: "Place de la Mairie",
        postalCode: "50490",
        city: "Saint-Sauveur-Villages",
      })
    ).resolves.toBeNull()
  })

  it("returns null when api-adresse fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.reject(new Error("network")))
    )

    await expect(
      geocodeNormandyAddress({
        location: "4 Rue de la Chapelle",
        postalCode: "27170",
        city: "Le Plessis-Sainte-Opportune",
      })
    ).resolves.toBeNull()
  })
})
