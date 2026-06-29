export type Coordinates = {
  latitude: number | null | undefined
  longitude: number | null | undefined
}

type NormalizedCoordinates = {
  latitude: number | null
  longitude: number | null
}

const NORMANDY_BOUNDS = {
  minLatitude: 48,
  maxLatitude: 50.3,
  minLongitude: -2.2,
  maxLongitude: 2,
} as const

export const isInNormandyBounds = ({ latitude, longitude }: Coordinates): boolean =>
  typeof latitude === "number" &&
  typeof longitude === "number" &&
  Number.isFinite(latitude) &&
  Number.isFinite(longitude) &&
  latitude >= NORMANDY_BOUNDS.minLatitude &&
  latitude <= NORMANDY_BOUNDS.maxLatitude &&
  longitude >= NORMANDY_BOUNDS.minLongitude &&
  longitude <= NORMANDY_BOUNDS.maxLongitude

export const normalizeNormandyCoordinates = ({
  latitude,
  longitude,
}: Coordinates): NormalizedCoordinates =>
  isInNormandyBounds({ latitude, longitude })
    ? { latitude: latitude as number, longitude: longitude as number }
    : { latitude: null, longitude: null }

export const normandyBoundsWhere = {
  latitude: {
    gte: NORMANDY_BOUNDS.minLatitude,
    lte: NORMANDY_BOUNDS.maxLatitude,
  },
  longitude: {
    gte: NORMANDY_BOUNDS.minLongitude,
    lte: NORMANDY_BOUNDS.maxLongitude,
  },
} as const
