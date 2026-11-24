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

/** South-west and north-east corners, in the [lng, lat] order map libraries expect. */
export const NORMANDY_LNG_LAT_BOUNDS: [[number, number], [number, number]] = [
  [NORMANDY_BOUNDS.minLongitude, NORMANDY_BOUNDS.minLatitude],
  [NORMANDY_BOUNDS.maxLongitude, NORMANDY_BOUNDS.maxLatitude],
]

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
