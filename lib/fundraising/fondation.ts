import { z } from "zod"

export const FONDATION_ORIGIN = "https://www.fondation-patrimoine.org"

/** Public search used by the "Les projets" page of the Fondation site (read-only POST). */
export const FONDATION_SEARCH_URL = `${FONDATION_ORIGIN}/api/v2/search/projects`

/** INSEE code of the Normandie region in the Fondation index. */
export const FONDATION_REGION_NORMANDIE = "28"

/** Hosts an event may link to for its collect. Extend here if the Fondation adds a domain. */
export const FUNDRAISING_HOSTS = ["www.fondation-patrimoine.org", "fondation-patrimoine.org"]

/** Hosts a collect image may come from; must match next.config.ts remotePatterns. */
const FUNDRAISING_IMAGE_HOSTS = [
  /^strapi-upload\.cdn\.fondation-patrimoine\.org$/,
  /\.public\.blob\.vercel-storage\.com$/,
]

export type FondationProject = {
  code: string
  title: string
  city: string
  postalCode: string
  departmentCode: string
  latitude: number | null
  longitude: number | null
  imageUrl: string | null
  collectedPercent: number | null
  endDate: string | null
  url: string
}

export const fondationProjectUrl = (slug: string, code: string) =>
  `${FONDATION_ORIGIN}/les-projets/${slug}/${code}`

const parseHttpsUrl = (value: string) => {
  try {
    const url = new URL(value)
    return url.protocol === "https:" ? url : null
  } catch {
    return null
  }
}

export const isFundraisingUrl = (value: string) => {
  const url = parseHttpsUrl(value)
  return !!url && FUNDRAISING_HOSTS.includes(url.hostname)
}

export const isFundraisingImageUrl = (value: string) => {
  const url = parseHttpsUrl(value)
  return !!url && FUNDRAISING_IMAGE_HOSTS.some((host) => host.test(url.hostname))
}

const hitSchema = z.object({
  code: z.string().regex(/^\d{1,10}$/),
  slug: z.string().regex(/^[a-z0-9-]{1,200}$/),
  title: z.string().min(1),
  city: z.string().nullish(),
  postalCode: z.string().nullish(),
  departmentCode: z.string().nullish(),
  // Some projects have no position: the index then holds an empty object.
  _geoloc: z.object({ lat: z.number().optional(), lng: z.number().optional() }).nullish(),
  image: z.object({ thumbnailUrl: z.string().nullish() }).nullish(),
  collect: z
    .object({ collectedPercent: z.number().nullish(), endDate: z.string().nullish() })
    .nullish(),
})

/** Normalizes one hit of the Fondation search; null when it cannot be linked to. */
export const toFondationProject = (hit: unknown): FondationProject | null => {
  const parsed = hitSchema.safeParse(hit)
  if (!parsed.success) return null
  const { code, slug, title, city, postalCode, departmentCode, _geoloc, image, collect } =
    parsed.data
  const imageUrl = image?.thumbnailUrl ?? null

  return {
    code,
    title,
    city: city ?? "",
    postalCode: postalCode ?? "",
    departmentCode: departmentCode ?? "",
    latitude: _geoloc?.lat ?? null,
    longitude: _geoloc?.lng ?? null,
    imageUrl: imageUrl && isFundraisingImageUrl(imageUrl) ? imageUrl : null,
    collectedPercent: collect?.collectedPercent ?? null,
    endDate: collect?.endDate ?? null,
    url: fondationProjectUrl(slug, code),
  }
}
