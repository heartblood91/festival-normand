const ALLOWED_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"])
const BARE_DOMAIN = /^[\w-]+(\.[\w-]+)+(\/\S*)?$/

/** Link target typed by an editor, or null when it is unsafe or unusable. */
export const normalizeLinkUrl = (input: string): string | null => {
  const value = input.trim()
  if (!value) return null
  if (value.startsWith("/") && !value.startsWith("//")) return value
  const candidate = BARE_DOMAIN.test(value) ? `https://${value}` : value
  try {
    const url = new URL(candidate)
    return ALLOWED_PROTOCOLS.has(url.protocol) ? candidate : null
  } catch {
    return null
  }
}

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
  "www.youtube-nocookie.com",
  "youtube-nocookie.com",
])

export const isYoutubeUrl = (input: string): boolean => {
  try {
    const url = new URL(input.trim())
    return url.protocol === "https:" && YOUTUBE_HOSTS.has(url.hostname)
  } catch {
    return false
  }
}
