import { HalleyComet } from "@/components/skins/millennium/halley-comet"
import type { SkinSlotProps } from "@/components/skins/types"

// Photographs of the Bayeux Tapestry's own borders (public domain, credits in
// docs/habillages.md): the upper border runs under the header and the lower one above
// the footer, so the page in between reads as the tapestry's main scene.
const UPPER_BORDER = "/themes/millennium-frieze-upper"
const LOWER_BORDER = "/themes/millennium-frieze-lower"
const BAND_WIDTH = 3820
const BAND_HEIGHT = 112
// Latin tituli in the manner of the tapestry's own inscriptions, revealed on hover:
// "they marvel at the star" (scene 32, Halley's comet) and "here Duke William".
const TITULI = { upper: "ISTI MIRANT STELLA", lower: "HIC WILLELM DUX" } as const

/** Embroidered border of the Bayeux Tapestry, framed like a lit museum showcase. */
export const MillenniumFrieze = ({ slot }: SkinSlotProps) => {
  const isFooter = slot === "beforeFooter"
  const band = isFooter ? LOWER_BORDER : UPPER_BORDER
  const titulus = isFooter ? TITULI.lower : TITULI.upper
  return (
    <div
      aria-hidden="true"
      data-millennium-frieze={slot}
      className="bg-ed-bg-deep border-primary/40 relative h-11 overflow-hidden border-y after:pointer-events-none after:absolute after:inset-0 after:shadow-[inset_0_0_12px_rgba(6,9,26,0.6)] md:h-14 print:hidden"
    >
      <picture>
        <source type="image/avif" srcSet={`${band}.avif`} />
        <img
          src={`${band}.webp`}
          alt=""
          width={BAND_WIDTH}
          height={BAND_HEIGHT}
          loading={isFooter ? "lazy" : "eager"}
          fetchPriority="low"
          decoding="async"
          draggable={false}
          className="absolute top-0 left-1/2 h-full w-auto max-w-none -translate-x-1/2 [mask-image:linear-gradient(90deg,transparent,#000_4%,#000_96%,transparent)] select-none"
        />
      </picture>
      <span className="millennium-titulus">{titulus.split(" ").join(" · ")}</span>
      {isFooter ? null : <HalleyComet />}
    </div>
  )
}
