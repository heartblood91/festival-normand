import {
  FONDATION_REGION_NORMANDIE,
  FONDATION_SEARCH_URL,
  toFondationProject,
  type FondationProject,
} from "@/lib/fundraising/fondation"

const USER_AGENT = "PierresEnLumieres-collectes/1.0 (read-only)"
const PAUSE_MS = 2_000
const MAX_PAGES = 20

type FetchOptions = {
  fetcher?: typeof fetch
  sleep?: (ms: number) => Promise<void>
  region?: string
  hitsPerPage?: number
}

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

/**
 * In-progress collects of a region, from the same public search the Fondation
 * site uses. A handful of requests, paused between pages.
 */
export const fetchFondationProjects = async ({
  fetcher = fetch,
  sleep = wait,
  region = FONDATION_REGION_NORMANDIE,
  hitsPerPage = 100,
}: FetchOptions = {}): Promise<FondationProject[]> => {
  const projects: FondationProject[] = []

  for (let page = 0; page < MAX_PAGES; page++) {
    if (page > 0) await sleep(PAUSE_MS)
    const response = await fetcher(FONDATION_SEARCH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "User-Agent": USER_AGENT },
      body: JSON.stringify({
        location: { target: "region", value: region },
        statuses: ["IN_PROGRESS"],
        hitsPerPage,
        page,
        fetchAll: false,
      }),
    })
    if (!response.ok) throw new Error(`Fondation search failed: HTTP ${response.status}`)

    const data = (await response.json()) as { hits?: unknown[]; nbPages?: number }
    for (const hit of data.hits ?? []) {
      const project = toFondationProject(hit)
      if (project) projects.push(project)
    }
    if (page + 1 >= (data.nbPages ?? 0)) break
  }

  return projects
}
