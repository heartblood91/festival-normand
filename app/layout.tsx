import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
})

export const metadata: Metadata = {
  title: "Pierres en Lumières - Festival du Patrimoine Normand",
  description:
    "Découvrez la magie du patrimoine normand en nocturne. 29, 30 & 31 mai 2026.",
}

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="fr" className={cn(inter.variable, playfair.variable)}>
      <body className="flex min-h-dvh flex-col font-sans antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  )
}

export default RootLayout
