import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

const withNextIntl = createNextIntlPlugin("./lib/i18n/request.ts")

const nextConfig: NextConfig = {
  output: "standalone",
  // Inlined in both the server and the browser bundles from the same build-time
  // value, so the server never asks for a token the page cannot produce.
  env: { TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "" },
  images: {
    // Restrict transformation sizes to stay within Vercel Hobby limits.
    // Covers phone, tablet, laptop, desktop. Add 2560 only if 4K screens become a priority.
    deviceSizes: [640, 828, 1200, 1920],
    imageSizes: [64, 128, 256, 384],
    formats: ["image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      { hostname: "*.public.blob.vercel-storage.com" },
      { hostname: "pierresenlumieres.fr" },
      // Collect images attached from the Fondation du patrimoine.
      { protocol: "https", hostname: "strapi-upload.cdn.fondation-patrimoine.org" },
    ],
  },
}

export default withNextIntl(nextConfig)
