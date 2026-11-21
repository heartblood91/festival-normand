import { HalleyComet } from "@/components/skins/millennium/halley-comet"
import type { SkinSlotProps } from "@/components/skins/types"

const WIDTH = 1200
const HEIGHT = 62
const WATERLINE = 38

// One gentle swell every 24 units, drawn across the whole band.
const WAVES = `M0 ${WATERLINE}${" q6 -3 12 0 t12 0".repeat(WIDTH / 24)}`

/** Line-drawn longship in the manner of the Bayeux Tapestry, mast at x=0, keel at y=0. */
const Longship = ({ id }: { id: string }) => (
  <symbol id={id} overflow="visible">
    <path d="M-44 -6 Q0 6 44 -6 M-40 -8 Q0 -2 40 -8" />
    <path d="M44 -6 Q53 -10 50 -21 Q49 -26 54 -27 M-44 -6 Q-53 -10 -50 -21 Q-49 -26 -54 -27" />
    <path d="M0 -6 V-32 M0 -32 l7 2 l-7 2" />
    <path
      d="M-14 -29 H14 Q17 -20 13 -11 H-13 Q-17 -20 -14 -29 Z"
      fill="currentColor"
      fillOpacity="0.1"
    />
    <path d="M-7 -29 V-11 M7 -29 V-11" strokeOpacity="0.6" />
    {[-28, -16, -4, 8, 20].map((x) => (
      <circle key={x} cx={x + 4} cy={-4.5} r={2.2} />
    ))}
  </symbol>
)

/** Keep on its motte, after the castle of Falaise where William was born. */
const Keep = () => (
  <g>
    <path d={`M528 ${WATERLINE} Q600 14 672 ${WATERLINE}`} />
    <path d="M582 26 V9 h5 v-4 h5 v4 h6 v-4 h4 v4 h6 v-4 h5 v4 h5 V26" />
    <path d="M594 26 V20 Q600 15 606 20 V26" />
  </g>
)

type SceneProps = { slot: SkinSlotProps["slot"] }

/** Header band: the fleet crossing under Halley's comet. Footer band: the arrival. */
const Scene = ({ slot }: SceneProps) => {
  const shipId = `millennium-longship-${slot}`
  const crossing = slot !== "beforeFooter"
  return (
    <>
      <defs>
        <Longship id={shipId} />
        <linearGradient id={`${shipId}-fade`} x1="0" x2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0" />
          <stop offset="0.3" stopColor="currentColor" stopOpacity="0.45" />
          <stop offset="0.7" stopColor="currentColor" stopOpacity="0.45" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`${shipId}-glow`}>
          <stop offset="0" stopColor="currentColor" stopOpacity="0.9" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path d={WAVES} stroke={`url(#${shipId}-fade)`} strokeWidth="0.9" />
      <g
        fontFamily="var(--font-mono)"
        fontSize="8.5"
        letterSpacing="3.4"
        fill="currentColor"
        stroke="none"
        fillOpacity="0.55"
      >
        <text x="96" y="25">
          {crossing ? "HIC WILLELM DUX IN MAGNO NAVIGIO" : "HIC NATUS EST WILLELMUS · FALESIA"}
        </text>
        <text x={WIDTH - 96} y="25" textAnchor="end">
          {crossing ? "MARE TRANSIVIT · MLXVI" : "LAPIDES IN LUMINE · MMXXVII"}
        </text>
      </g>
      {crossing ? (
        <>
          <g className="millennium-sail">
            <use href={`#${shipId}`} x="600" y={WATERLINE} />
            <use href={`#${shipId}`} transform={`translate(470 ${WATERLINE}) scale(0.62)`} />
            <use href={`#${shipId}`} transform={`translate(724 ${WATERLINE}) scale(0.62)`} />
          </g>
          <g className="millennium-comet">
            <path d="M778 9 L738 3" stroke={`url(#${shipId}-fade)`} strokeWidth="1.4" />
            <circle cx="778" cy="9" r="1.9" fill="currentColor" stroke="none" />
            <text
              className="millennium-reveal"
              x="788"
              y="12"
              fontFamily="var(--font-mono)"
              fontSize="7.5"
              letterSpacing="2.6"
              fill="currentColor"
              stroke="none"
            >
              ISTI MIRANT STELLA
            </text>
          </g>
        </>
      ) : (
        <>
          <Keep />
          <circle
            className="millennium-reveal"
            cx="600"
            cy="18"
            r="14"
            fill={`url(#${shipId}-glow)`}
            stroke="none"
          />
          <path d="M598 13 h4 v6 h-4 Z" fill="currentColor" stroke="none" />
          <use href={`#${shipId}`} transform={`translate(462 ${WATERLINE}) scale(0.58)`} />
          <use href={`#${shipId}`} transform={`translate(738 ${WATERLINE}) scale(-0.58 0.58)`} />
        </>
      )}
      {[
        [254, 7],
        [512, 6],
        [668, 7],
        [960, 7],
        [1012, 5],
        [1130, 9],
      ].map(([cx, cy]) => (
        <circle key={cx} cx={cx} cy={cy} r="0.8" fill="currentColor" stroke="none" />
      ))}
    </>
  )
}

/**
 * Gilded hairline band in the spirit of the Bayeux Tapestry. Hovering it lets the
 * fleet sail on and reveals the tapestry's caption for the comet (or lights the
 * keep's window). The 1066 easter egg rides along with the header band.
 */
export const MillenniumFrieze = ({ slot }: SkinSlotProps) => (
  <div
    aria-hidden="true"
    data-millennium-frieze={slot}
    className="millennium-frieze group border-primary/15 bg-ed-bg-deep relative flex justify-center overflow-hidden border-y print:hidden"
  >
    <svg
      width={WIDTH}
      height={HEIGHT}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="text-primary block shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
    >
      <g transform="translate(0 4)">
        <Scene slot={slot} />
      </g>
    </svg>
    {slot === "afterHeader" && <HalleyComet />}
  </div>
)
