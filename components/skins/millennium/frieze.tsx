import type { SkinSlotProps } from "@/components/skins/types"

const LINEN = "#efe4cc"
const WOOL_RED = "#9b2c1c"
const WOOL_OCHRE = "#c08a2e"
const WOOL_GREEN = "#5f6f3a"
const WOOL_BLUE = "#2f3e6b"

/** One repeat of the band: a longship on stitched waves, then a castle keep. */
const Motif = () => (
  <>
    <rect width="160" height="36" fill={LINEN} />
    <path d="M0 3H160M0 33H160" stroke={WOOL_RED} strokeWidth="2" strokeDasharray="5 3" />
    <path
      d="M4 29 Q12 26 20 29 T36 29 T52 29 T68 29 T84 29"
      fill="none"
      stroke={WOOL_BLUE}
      strokeWidth="1.5"
      strokeDasharray="3 2"
    />
    <path d="M14 23 Q44 30 74 23 L70 27 Q44 33 18 27 Z" fill={WOOL_OCHRE} />
    <path d="M14 23 Q9 18 13 13" fill="none" stroke={WOOL_OCHRE} strokeWidth="2" />
    <path d="M74 23 Q79 18 75 13" fill="none" stroke={WOOL_OCHRE} strokeWidth="2" />
    <path d="M44 8V25" stroke={WOOL_BLUE} strokeWidth="1.5" />
    <path d="M34 10H54V21Q44 23 34 21Z" fill={WOOL_RED} />
    <path d="M41 10H47V22H41Z" fill={WOOL_GREEN} />
    <circle cx="26" cy="25" r="1.6" fill={WOOL_BLUE} />
    <circle cx="36" cy="26" r="1.6" fill={WOOL_GREEN} />
    <circle cx="52" cy="26" r="1.6" fill={WOOL_BLUE} />
    <circle cx="62" cy="25" r="1.6" fill={WOOL_GREEN} />
    <path d="M100 30V15H104V11H108V15H112V11H116V15H120V11H124V15H128V30Z" fill={WOOL_GREEN} />
    <path d="M111 30V23Q114 20 117 23V30Z" fill={LINEN} />
    <path d="M94 30H134" stroke={WOOL_OCHRE} strokeWidth="2" />
    <path d="M144 12 L147 18 L144 24 L141 18Z" fill={WOOL_RED} />
  </>
)

/** Decorative embroidered band in the spirit of the Bayeux Tapestry. */
export const MillenniumFrieze = ({ slot }: SkinSlotProps) => {
  const patternId = `millennium-frieze-${slot}`
  return (
    <div aria-hidden="true" className="w-full print:hidden">
      <svg className="block h-9 w-full" focusable="false">
        <defs>
          <pattern id={patternId} width="160" height="36" patternUnits="userSpaceOnUse">
            <Motif />
          </pattern>
        </defs>
        <rect width="100%" height="36" fill={`url(#${patternId})`} />
      </svg>
    </div>
  )
}
