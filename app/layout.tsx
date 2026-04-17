import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pierresenlumieres.fr"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Pierres en Lumières - Festival du Patrimoine Normand",
    template: "%s | Pierres en Lumières",
  },
  description: "Découvrez la magie du patrimoine normand en nocturne. 29, 30 & 31 mai 2026.",
  openGraph: {
    type: "website",
    siteName: "Pierres en Lumières",
    title: "Pierres en Lumières - Festival du Patrimoine Normand",
    description:
      "Découvrez la magie du patrimoine normand en nocturne. Illuminations, expositions, animations et visites du patrimoine normand. 29, 30 & 31 mai 2026.",
  },
  twitter: {
    card: "summary_large_image",
  },
  alternates: {
    languages: {
      fr: `${SITE_URL}/fr`,
      en: `${SITE_URL}/en`,
    },
  },
}

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html
    lang="fr"
    dir="ltr"
    suppressHydrationWarning
    className={cn(inter.variable, playfair.variable)}
  >
    <head>
      <link rel="preconnect" href="https://pierresenlumieres.fr" />
      <link rel="dns-prefetch" href="https://pierresenlumieres.fr" />
    </head>
    <body className="flex min-h-dvh flex-col font-sans antialiased">
      {children}
      <Toaster />
      <SpeedInsights />
      <Analytics />
    </body>
  </html>
)

export default RootLayout
