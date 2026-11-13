export type SocialPlatform = "facebook" | "instagram" | "x" | "youtube" | "linkedin" | "tiktok"

export const MAX_SOCIAL_LINKS = 6

const PLATFORMS: { id: SocialPlatform; label: string; hosts: string[] }[] = [
  { id: "facebook", label: "Facebook", hosts: ["facebook.com", "fb.com", "fb.me"] },
  { id: "instagram", label: "Instagram", hosts: ["instagram.com"] },
  { id: "x", label: "X (Twitter)", hosts: ["x.com", "twitter.com"] },
  { id: "youtube", label: "YouTube", hosts: ["youtube.com"] },
  { id: "linkedin", label: "LinkedIn", hosts: ["linkedin.com"] },
  { id: "tiktok", label: "TikTok", hosts: ["tiktok.com"] },
]

// Share buttons, login walls and embeds point at the platform, not at the site's page.
// Single posts and videos (youtu.be links are always videos) are not the site's page either.
const NOT_A_PROFILE =
  /\/(sharer|share|intent|dialog|plugins|embed|watch|hashtag|login|signup|privacy|policies|legal|help|tr|shorts|playlist|p|reel|reels|posts|status|video|photo|events)(?=[/?#.]|$)|[?&](u|url|text)=/i

const hostOf = (url: URL) => url.hostname.toLowerCase().replace(/^(www|m|mobile|fr-fr|fr)\./, "")

export const socialPlatform = (value: string): SocialPlatform | null => {
  let url: URL
  try {
    url = new URL(value)
  } catch {
    return null
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null
  const host = hostOf(url)
  return PLATFORMS.find((platform) => platform.hosts.includes(host))?.id ?? null
}

export const socialLabel = (platform: SocialPlatform) =>
  PLATFORMS.find((item) => item.id === platform)?.label ?? platform

/** https, no tracking query, no trailing slash: the form editors compare. */
export const normalizeSocialUrl = (value: string): string | null => {
  const platform = socialPlatform(value.trim())
  if (!platform) return null
  const url = new URL(value.trim())
  if (url.pathname.replace(/\/+$/, "") === "" || NOT_A_PROFILE.test(url.pathname + url.search)) {
    return null
  }
  // Facebook's numeric profiles live in the query string; everything else is tracking.
  const keep = url.pathname === "/profile.php" ? url.searchParams.get("id") : null
  return `https://${hostOf(url) === "fb.com" ? "facebook.com" : hostOf(url)}${url.pathname.replace(/\/+$/, "")}${keep ? `?id=${keep}` : ""}`
}

/** One profile per platform, in the order the page lists them. */
export const extractSocialLinks = (html: string, pageUrl: string): string[] => {
  const found = new Map<SocialPlatform, string>()
  for (const match of html.matchAll(/<a\b[^>]*?\bhref\s*=\s*["']([^"']+)["']/gi)) {
    let absolute: string
    try {
      absolute = new URL(match[1].replace(/&amp;/g, "&"), pageUrl).toString()
    } catch {
      continue
    }
    const normalized = normalizeSocialUrl(absolute)
    const platform = normalized && socialPlatform(normalized)
    if (normalized && platform && !found.has(platform)) found.set(platform, normalized)
  }
  return [...found.values()].slice(0, MAX_SOCIAL_LINKS)
}
