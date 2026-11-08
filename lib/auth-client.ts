import { createAuthClient } from "better-auth/react"
import { magicLinkClient, twoFactorClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
  // Without an explicit site URL the client talks to the origin it was served from.
  baseURL: process.env.NEXT_PUBLIC_SITE_URL || undefined,
  plugins: [magicLinkClient(), twoFactorClient()],
})

export const { signIn, signOut, useSession } = authClient
