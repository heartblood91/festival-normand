import localFont from "next/font/local"
import { cn } from "@/lib/utils"

// Latin subsets from Google Fonts (OFL), kept in the repository so a build
// never depends on reaching fonts.googleapis.com.
const inter = localFont({
  src: "../assets/fonts/inter-latin.woff2",
  weight: "100 900",
  variable: "--font-sans",
  display: "swap",
})
const playfair = localFont({
  src: "../assets/fonts/playfair-display-latin.woff2",
  weight: "400 900",
  variable: "--font-serif",
  display: "swap",
  adjustFontFallback: "Times New Roman",
})

// Editorial "Édito" type system (public pages only).
// Fraunces = display, Cormorant Garamond = serif body, DM Mono = labels/meta.
const fraunces = localFont({
  src: [
    { path: "../assets/fonts/fraunces-latin-normal.woff2", style: "normal" },
    { path: "../assets/fonts/fraunces-latin-italic.woff2", style: "italic" },
  ],
  weight: "100 900",
  variable: "--font-fraunces",
  display: "swap",
  adjustFontFallback: "Times New Roman",
})
const cormorant = localFont({
  src: [
    { path: "../assets/fonts/cormorant-garamond-latin-normal.woff2", style: "normal" },
    { path: "../assets/fonts/cormorant-garamond-latin-italic.woff2", style: "italic" },
  ],
  weight: "300 700",
  variable: "--font-cormorant",
  display: "swap",
  adjustFontFallback: "Times New Roman",
})
const dmMono = localFont({
  src: [
    { path: "../assets/fonts/dm-mono-latin-300.woff2", weight: "300" },
    { path: "../assets/fonts/dm-mono-latin-400.woff2", weight: "400" },
    { path: "../assets/fonts/dm-mono-latin-500.woff2", weight: "500" },
  ],
  variable: "--font-dm-mono",
  display: "swap",
})

export const fontVariables = cn(
  inter.variable,
  playfair.variable,
  fraunces.variable,
  cormorant.variable,
  dmMono.variable
)
