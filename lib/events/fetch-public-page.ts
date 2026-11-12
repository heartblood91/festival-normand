import { lookup } from "node:dns/promises"
import { isIP } from "node:net"

const TIMEOUT_MS = 8_000
const MAX_BYTES = 1_500_000
const MAX_REDIRECTS = 3

const PRIVATE_V4 = [
  /^0\./,
  /^10\./,
  /^127\./,
  /^169\.254\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./,
]

export const isPrivateAddress = (address: string) => {
  const v4 = address.replace(/^::ffff:/i, "")
  if (isIP(v4) === 4) return PRIVATE_V4.some((range) => range.test(v4))
  const v6 = address.toLowerCase()
  return v6 === "::" || v6 === "::1" || /^f[cd]/.test(v6) || /^fe[89ab]/.test(v6)
}

// The address is checked before each hop; the window between this lookup and
// fetch's own is accepted for an editor-only feature.
const assertPublicUrl = async (url: URL) => {
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("Unsupported scheme")
  if (url.username || url.password) throw new Error("Credentials in URL")
  if (url.port && url.port !== "80" && url.port !== "443") throw new Error("Unusual port")
  const host = url.hostname.replace(/^\[|\]$/g, "")
  const addresses = isIP(host) ? [host] : (await lookup(host, { all: true })).map((a) => a.address)
  if (addresses.length === 0 || addresses.some(isPrivateAddress)) {
    throw new Error("Private address")
  }
}

const readCapped = async (response: Response) => {
  const reader = response.body?.getReader()
  if (!reader) return ""
  const chunks: Uint8Array[] = []
  let size = 0
  while (size < MAX_BYTES) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
    size += value.byteLength
  }
  await reader.cancel().catch(() => undefined)
  return new TextDecoder().decode(Buffer.concat(chunks).subarray(0, MAX_BYTES))
}

/**
 * Downloads an HTML page from the public web. Refuses private networks,
 * follows a few redirects and stops reading after 1.5 MB. Returns the final
 * URL so relative links resolve against it.
 */
export const fetchPublicPage = async (value: string): Promise<{ url: string; html: string }> => {
  let url = new URL(value)
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    await assertPublicUrl(url)
    const response = await fetch(url, {
      redirect: "manual",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: {
        Accept: "text/html",
        "User-Agent": "PierresEnLumieresBot/1.0 (+https://pierresenlumieres.fr)",
      },
    })
    const location = response.headers.get("location")
    if (response.status >= 300 && response.status < 400 && location) {
      url = new URL(location, url)
      continue
    }
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    if (!(response.headers.get("content-type") ?? "").includes("html")) {
      throw new Error("Not an HTML page")
    }
    return { url: url.toString(), html: await readCapped(response) }
  }
  throw new Error("Too many redirects")
}
