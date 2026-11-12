import { lookup } from "node:dns/promises"
import { BlockList, isIP } from "node:net"

const TIMEOUT_MS = 8_000
const MAX_BYTES = 1_500_000
const MAX_REDIRECTS = 3

// Everything that is not plainly a public unicast address. BlockList checks
// IPv4-mapped IPv6 (::ffff:a9fe:a9fe) against the IPv4 ranges; the other IPv6
// forms that embed an IPv4 address (NAT64, 6to4) are refused outright.
const BLOCKED = new BlockList()
for (const [network, prefix] of [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["224.0.0.0", 3],
] as const) {
  BLOCKED.addSubnet(network, prefix, "ipv4")
}
for (const [network, prefix] of [
  ["::", 127],
  ["64:ff9b::", 96],
  ["2002::", 16],
  ["fc00::", 7],
  ["fe80::", 10],
  ["ff00::", 8],
] as const) {
  BLOCKED.addSubnet(network, prefix, "ipv6")
}

export const isPrivateAddress = (address: string) => {
  const family = isIP(address)
  if (!family) return true
  return BLOCKED.check(address, family === 4 ? "ipv4" : "ipv6")
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
