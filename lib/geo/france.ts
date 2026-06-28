export type Coordinates = {
  latitude: number | null | undefined
  longitude: number | null | undefined
}

type NormalizedCoordinates = {
  latitude: number | null
  longitude: number | null
}

const FRANCE_BOUNDS = {
  minLatitude: 41,
  maxLatitude: 52,
  minLongitude: -6,
  maxLongitude: 10,
} as const

export const isInFranceBounds = ({ latitude, longitude }: Coordinates): boolean =>
  typeof latitude === "number" &&
  typeof longitude === "number" &&
  Number.isFinite(latitude) &&
  Number.isFinite(longitude) &&
  latitude >= FRANCE_BOUNDS.minLatitude &&
  latitude <= FRANCE_BOUNDS.maxLatitude &&
  longitude >= FRANCE_BOUNDS.minLongitude &&
  longitude <= FRANCE_BOUNDS.maxLongitude

export const normalizeFranceCoordinates = ({
  latitude,
  longitude,
}: Coordinates): NormalizedCoordinates =>
  isInFranceBounds({ latitude, longitude })
    ? { latitude: latitude as number, longitude: longitude as number }
    : { latitude: null, longitude: null }

export const franceBoundsWhere = {
  latitude: {
    gte: FRANCE_BOUNDS.minLatitude,
    lte: FRANCE_BOUNDS.maxLatitude,
  },
  longitude: {
    gte: FRANCE_BOUNDS.minLongitude,
    lte: FRANCE_BOUNDS.maxLongitude,
  },
} as const
