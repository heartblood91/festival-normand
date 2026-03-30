import { createAuthClient } from "better-auth/react"
import { magicLinkClient, twoFactorClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3010",
  plugins: [magicLinkClient(), twoFactorClient()],
})

export const { signIn, signOut, useSession } = authClient
