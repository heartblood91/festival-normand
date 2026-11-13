const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"

/** Hidden field the Turnstile widget adds to its form. */
export const TURNSTILE_FIELD = "cf-turnstile-response"

/**
 * Both keys are needed: a secret without a widget would reject every visitor.
 * TURNSTILE_SITE_KEY is the build-time NEXT_PUBLIC_ value (see next.config.ts).
 */
export const isTurnstileEnabled = () =>
  Boolean(process.env.TURNSTILE_SITE_KEY && process.env.TURNSTILE_SECRET_KEY)

/**
 * Checks the Cloudflare Turnstile token of a public form. Always true when
 * Turnstile is not configured. A Cloudflare outage lets the form through: the
 * honeypot and the rate limit still apply, and visitors are not locked out.
 */
export const verifyTurnstile = async (formData: FormData, ip?: string): Promise<boolean> => {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret || !isTurnstileEnabled()) return true
  const token = formData.get(TURNSTILE_FIELD)
  if (typeof token !== "string" || !token || token.length > 2048) return false

  const body = new URLSearchParams({ secret, response: token })
  if (ip && ip !== "unknown") body.set("remoteip", ip)
  try {
    const response = await fetch(VERIFY_URL, {
      method: "POST",
      body,
      signal: AbortSignal.timeout(5_000),
    })
    if (!response.ok) return true
    const result = (await response.json()) as { success?: unknown }
    return result.success === true
  } catch {
    return true
  }
}
