/** RGAA advises short alternatives; screen readers read them in full. */
export const ALT_MAX_LENGTH = 150

const IMG_TAG = /<img\b[^>]*>/gi

const attribute = (tag: string, name: string): string | null => {
  const match = tag.match(new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, "i"))
  return match ? (match[1] ?? match[2] ?? "") : null
}

/** src of every <img> in rich text whose alt is missing or blank. */
export const imagesWithoutAlt = (html: string): string[] =>
  (html.match(IMG_TAG) ?? [])
    .filter((tag) => !attribute(tag, "alt")?.trim())
    .map((tag) => attribute(tag, "src") ?? "")

export const missingAltMessage = (html: string): string => {
  const count = imagesWithoutAlt(html).length
  return count ? `${count} image(s) sans texte alternatif dans le contenu` : ""
}

/** Normalises a model answer into a usable alt: no quotes, label or overflow. */
export const cleanAltProposal = (text: string): string => {
  const cleaned = text
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^(texte alternatif|alt)\s*:\s*/i, "")
    .replace(/^["'«“\s]+|["'»”\s]+$/g, "")
  if (cleaned.length <= ALT_MAX_LENGTH) return cleaned
  const cut = cleaned.slice(0, ALT_MAX_LENGTH + 1)
  return cut.slice(0, cut.lastIndexOf(" ")).replace(/[\s,;:]+$/, "")
}

/**
 * Public URL the vision model can fetch: absolute http(s) URLs as is, site
 * paths against the site URL; anything else (data:, javascript:…) is refused.
 */
export const resolveImageUrl = (url: string, siteUrl: string): string | null => {
  try {
    if (url.startsWith("/")) return siteUrl ? new URL(url, siteUrl).toString() : null
    const parsed = new URL(url)
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.toString() : null
  } catch {
    return null
  }
}
