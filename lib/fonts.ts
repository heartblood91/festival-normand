import { Inter, Playfair_Display, Fraunces, Cormorant_Garamond, DM_Mono } from "next/font/google"
import { cn } from "@/lib/utils"

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

// Editorial "Édito" type system (public pages only).
// Fraunces = display, Cormorant Garamond = serif body, DM Mono = labels/meta.
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT"],
})
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
})
const dmMono = DM_Mono({
  subsets: ["latin"],
  variable: "--font-dm-mono",
  weight: ["300", "400", "500"],
  display: "swap",
})

export const fontVariables = cn(
  inter.variable,
  playfair.variable,
  fraunces.variable,
  cormorant.variable,
  dmMono.variable
)
