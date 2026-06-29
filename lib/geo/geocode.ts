import { isInNormandyBounds } from "@/lib/geo/normandy"

type AddressInput = {
  location: string | null | undefined
  city: string | null | undefined
  postalCode: string | null | undefined
}

type GeocodedCoordinates = {
  latitude: number
  longitude: number
}

type ApiAdresseFeature = {
  geometry?: {
    coordinates?: [number, number]
  }
}

type ApiAdresseResponse = {
  features?: ApiAdresseFeature[]
}

const geocodeQuery = async (query: string): Promise<GeocodedCoordinates | null> => {
  let response: Response
  try {
    response = await fetch(
      `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5`
    )
    if (!response.ok) return null
  } catch {
    return null
  }

  const data = (await response.json()) as ApiAdresseResponse
  const feature = data.features?.find((item) => {
    const [longitude, latitude] = item.geometry?.coordinates ?? []
    return isInNormandyBounds({ latitude, longitude })
  })
  const [longitude, latitude] = feature?.geometry?.coordinates ?? []

  return isInNormandyBounds({ latitude, longitude })
    ? { latitude: latitude as number, longitude: longitude as number }
    : null
}

export const geocodeNormandyAddress = async ({
  location,
  city,
  postalCode,
}: AddressInput): Promise<GeocodedCoordinates | null> => {
  const queries = [
    [location, postalCode, city].filter(Boolean).join(" "),
    [postalCode, city].filter(Boolean).join(" "),
    postalCode ?? "",
  ].filter((query, index, all) => query.trim().length > 0 && all.indexOf(query) === index)

  for (const query of queries) {
    const coordinates = await geocodeQuery(query)
    if (coordinates) return coordinates
  }

  return null
}
