import { DEPARTMENTS } from "@/lib/festival/departments"

const VIEWBOX = "0 0 1000 600"

// Stylized Normandy outline (Cotentin peninsula, Seine estuary, coastline).
const PATH =
  "M 90 305 C 95 230, 165 165, 215 175 C 245 178, 260 215, 270 240 " +
  "C 285 245, 305 220, 340 215 C 400 200, 460 175, 540 165 " +
  "C 620 155, 700 150, 770 140 C 830 138, 880 145, 905 175 " +
  "C 920 220, 880 280, 870 340 C 870 400, 830 460, 770 470 " +
  "C 690 480, 600 470, 540 480 C 470 490, 410 510, 350 510 " +
  "C 290 510, 240 490, 210 460 C 170 430, 140 400, 120 360 " +
  "C 100 335, 90 320, 90 305 Z"

// Deterministic seeded RNG so server and client render the same dots.
const seedRand = (seed: number) => {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

type DeptCount = { code: string; count: number }

const buildDots = (counts: DeptCount[]) => {
  const rand = seedRand(7)
  const dots: { x: number; y: number; live: boolean; dur: number }[] = []

  for (const dept of DEPARTMENTS) {
    const found = counts.find((c) => c.code === dept.code)
    const n = Math.min(Math.max(found?.count ?? 0, 0), 9)
    for (let i = 0; i < n; i += 1) {
      const ang = rand() * Math.PI * 2
      const r = 30 + rand() * 60
      dots.push({
        x: dept.center.x + Math.cos(ang) * r,
        y: dept.center.y + Math.sin(ang) * r,
        live: true,
        dur: 2 + (i % 4),
      })
    }
  }
  // Background dormant stars for density.
  for (let i = 0; i < 70; i += 1) {
    const dept = DEPARTMENTS[Math.floor(rand() * DEPARTMENTS.length)]
    const ang = rand() * Math.PI * 2
    const r = 10 + rand() * 90
    dots.push({
      x: dept.center.x + Math.cos(ang) * r,
      y: dept.center.y + Math.sin(ang) * r,
      live: false,
      dur: 0,
    })
  }
  return dots
}

type NormandyMapProps = {
  departments: { code: string; name: string; count: number }[]
  className?: string
}

const NormandyMap = ({ departments, className }: NormandyMapProps) => {
  const dots = buildDots(departments.map((d) => ({ code: d.code, count: d.count })))

  return (
    <svg viewBox={VIEWBOX} className={className} role="img" aria-label="Carte de la Normandie illuminée">
      <path d={PATH} fill="var(--primary)" fillOpacity="0.1" stroke="var(--primary)" strokeOpacity="0.5" strokeWidth="1.5" />
      {dots.map((d, i) =>
        d.live ? (
          <g key={i}>
            <circle cx={d.x} cy={d.y} r="14" fill="var(--primary)" opacity="0.12" />
            <circle cx={d.x} cy={d.y} r="3.5" fill="var(--primary)">
              <animate
                attributeName="opacity"
                values="0.9;0.4;0.9"
                dur={`${d.dur}s`}
                repeatCount="indefinite"
              />
            </circle>
          </g>
        ) : (
          <circle key={i} cx={d.x} cy={d.y} r="1.5" fill="var(--ed-cream)" opacity="0.18" />
        )
      )}
      {DEPARTMENTS.map((dept) => (
        <text
          key={dept.code}
          x={dept.center.x}
          y={dept.center.y - 80}
          fill="var(--ed-cream)"
          fontFamily="var(--font-mono)"
          fontSize="11"
          letterSpacing="3"
          textAnchor="middle"
          opacity="0.7"
        >
          {dept.nameFr.toUpperCase()}
        </text>
      ))}
    </svg>
  )
}

export { NormandyMap }
