import type { Metadata } from "next"
import "./globals.css"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pierresenlumieres.fr"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Pierres en Lumières - Festival du Patrimoine Normand",
    template: "%s | Pierres en Lumières",
  },
  description: "Découvrez la magie du patrimoine normand en nocturne.",
  openGraph: {
    type: "website",
    siteName: "Pierres en Lumières",
    title: "Pierres en Lumières - Festival du Patrimoine Normand",
    description:
      "Découvrez la magie du patrimoine normand en nocturne. Illuminations, expositions, animations et visites du patrimoine normand.",
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

// <html> lives in app/[locale]/layout.tsx so it can carry the page language (RGAA 8.3).
// This root layout only exists for app/not-found.tsx, which renders its own document.
const RootLayout = ({ children }: { children: React.ReactNode }) => children

export default RootLayout
