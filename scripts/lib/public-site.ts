// Read-only helpers to inventory the events of a public deployment through its
// HTML (no API, no DB). The map view embeds every published event with
// coordinates in the React Server Components payload, unpaginated.

export type PublicEvent = {
  slug: string
  titleFr: string
  city: string
  dateStart: string | null
  latitude: number | null
  longitude: number | null
}

const USER_AGENT = "pel-diagnostic (read-only)"

export const fetchText = async (url: string): Promise<{ status: number; body: string }> => {
  const response = await fetch(url, { headers: { "User-Agent": USER_AGENT } })
  return { status: response.status, body: await response.text() }
}

// Concatenate the `self.__next_f.push([1, "…"])` chunks back into the RSC stream.
export const decodeRscPayload = (html: string): string =>
  [...html.matchAll(/self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g)]
    .map((match) => JSON.parse(match[1]) as string)
    .join("")

// Parse the JSON array that starts at `start` (the `[`), honouring strings.
const readJsonArray = (text: string, start: number): unknown[] => {
  let depth = 0
  let inString = false
  for (let index = start; index < text.length; index++) {
    const char = text[index]
    if (inString) {
      if (char === "\\") index++
      else if (char === '"') inString = false
      continue
    }
    if (char === '"') inString = true
    else if (char === "[") depth++
    else if (char === "]" && --depth === 0) {
      return JSON.parse(text.slice(start, index + 1)) as unknown[]
    }
  }
  throw new Error("Unterminated events array in RSC payload")
}

export const extractEventsFromRsc = (rsc: string): PublicEvent[] => {
  let largest: PublicEvent[] = []
  for (const match of rsc.matchAll(/"events":\[/g)) {
    const events = readJsonArray(rsc, match.index + match[0].length - 1) as PublicEvent[]
    if (
      events.length > largest.length &&
      events.every((event) => typeof event?.slug === "string")
    ) {
      largest = events
    }
  }
  return largest.map(({ slug, titleFr, city, dateStart, latitude, longitude }) => ({
    slug,
    titleFr,
    city,
    dateStart,
    latitude: latitude ?? null,
    longitude: longitude ?? null,
  }))
}

export const fetchPublicEvents = async (base: string): Promise<PublicEvent[]> => {
  const { status, body } = await fetchText(`${base}/fr/evenements?view=map&edition=all`)
  if (status !== 200) throw new Error(`Map view returned ${status}`)
  return extractEventsFromRsc(decodeRscPayload(body))
}

// Imports suffix duplicate titles (`-2`, `-3`…), so accept those variants.
export const findPublicSlug = (slug: string, publicSlugs: Set<string>): string | null => {
  if (publicSlugs.has(slug)) return slug
  const pattern = new RegExp(`^${slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}-\\d+$`)
  return [...publicSlugs].find((candidate) => pattern.test(candidate)) ?? null
}
