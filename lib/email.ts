/**
 * Returns whether outbound email is configured for the current environment.
 *
 * Local dev and preprod intentionally use a placeholder key so the app boots
 * without crashing. Features that depend on email (magic-link, password reset,
 * invitation emails) read this flag to gate their UI and gracefully fall back
 * to manual link sharing.
 */
export const isEmailEnabled = (): boolean => {
  const key = process.env.RESEND_API_KEY
  if (!key) return false
  if (key.trim().length === 0) return false
  if (key.startsWith("re_placeholder")) return false
  return true
}
