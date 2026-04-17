import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

const withNextIntl = createNextIntlPlugin("./lib/i18n/request.ts")

const nextConfig: NextConfig = {
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
    ],
  },
}

export default withNextIntl(nextConfig)
