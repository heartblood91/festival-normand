export const PASS_PATRIMOINE_ORIGIN = "https://www.pass-patrimoine.fr"

/** Base of a partner site page; the slug follows. */
export const PASS_PATRIMOINE_SITE_BASE = `${PASS_PATRIMOINE_ORIGIN}/fr/lieux-et-visites/`

/** Hosts a Pass Patrimoine link may point to. Extend here if the pass adds a domain. */
export const PASS_PATRIMOINE_HOSTS = ["www.pass-patrimoine.fr", "pass-patrimoine.fr"]

export const PASS_PATRIMOINE_UTM = {
  utm_source: "pierres-en-lumieres",
  utm_medium: "referral",
  utm_campaign: "festival",
} as const

const SITE_PATH = /^\/fr\/lieux-et-visites\/([a-z0-9]+(?:-[a-z0-9]+)*)\/?$/

const parsePassUrl = (value: string) => {
  try {
    const url = new URL(value.trim())
    const trusted =
      url.protocol === "https:" &&
      PASS_PATRIMOINE_HOSTS.includes(url.hostname) &&
      !url.port &&
      !url.username &&
      !url.password
    return trusted ? url : null
  } catch {
    return null
  }
}

/** Any https page of the Pass Patrimoine site (banner link). */
export const isPassPatrimoineSiteUrl = (value: string) => !!parsePassUrl(value)

/**
 * Canonical partner page (`https://www.pass-patrimoine.fr/fr/lieux-et-visites/{slug}`),
 * or null when the value is not one. Query and hash are dropped: a pasted link
 * often carries someone else's tracking.
 */
export const normalizePassPatrimoineUrl = (value: string): string | null => {
  const url = parsePassUrl(value)
  const slug = url?.pathname.match(SITE_PATH)?.[1]
  return slug ? `${PASS_PATRIMOINE_SITE_BASE}${slug}` : null
}

export const isPassPatrimoineUrl = (value: string | null | undefined): value is string =>
  !!value && normalizePassPatrimoineUrl(value) !== null

/** Outgoing link with the festival UTM parameters (existing ones are replaced). */
export const withPassUtm = (value: string) => {
  const url = new URL(value)
  Object.entries(PASS_PATRIMOINE_UTM).forEach(([key, param]) => url.searchParams.set(key, param))
  return url.toString()
}
