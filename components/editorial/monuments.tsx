import type { SVGProps } from "react"

type MonumentProps = SVGProps<SVGSVGElement> & { fill?: string }

// Decorative monument silhouettes — used as visual "tells" in placeholders and
// headers, never as meaningful images (hence aria-hidden by default).
const MonumentAbbey = ({ fill = "currentColor", ...props }: MonumentProps) => (
  <svg
    viewBox="0 0 200 120"
    preserveAspectRatio="xMidYEnd meet"
    aria-hidden="true"
    {...props}
  >
    <path
      d="M 0 120 L 0 80 L 30 80 L 30 60 L 50 60 L 55 50 L 60 60 L 80 60 L 80 30 L 85 30 L 85 15 L 90 15 L 90 5 L 95 0 L 100 5 L 100 15 L 105 15 L 105 30 L 110 30 L 110 60 L 130 60 L 135 50 L 140 60 L 160 60 L 160 80 L 200 80 L 200 120 Z"
      fill={fill}
    />
  </svg>
)

const MonumentCathedral = ({ fill = "currentColor", ...props }: MonumentProps) => (
  <svg
    viewBox="0 0 240 140"
    preserveAspectRatio="xMidYEnd meet"
    aria-hidden="true"
    {...props}
  >
    <path
      d="M 0 140 L 0 100 L 25 100 L 25 80 L 35 80 L 35 60 L 30 55 L 35 50 L 35 25 L 40 25 L 45 15 L 50 25 L 50 50 L 55 55 L 50 60 L 50 80 L 70 80 L 70 60 L 90 60 L 95 30 L 100 20 L 105 30 L 110 60 L 110 30 L 115 30 L 115 10 L 120 0 L 125 10 L 125 30 L 130 30 L 130 60 L 130 30 L 135 30 L 140 20 L 145 30 L 150 60 L 170 60 L 170 80 L 190 80 L 190 60 L 185 55 L 190 50 L 190 25 L 195 25 L 200 15 L 205 25 L 205 50 L 210 55 L 205 60 L 205 80 L 215 80 L 215 100 L 240 100 L 240 140 Z"
      fill={fill}
    />
  </svg>
)

const MonumentChateau = ({ fill = "currentColor", ...props }: MonumentProps) => (
  <svg
    viewBox="0 0 220 140"
    preserveAspectRatio="xMidYEnd meet"
    aria-hidden="true"
    {...props}
  >
    <path
      d="M 0 140 L 0 90 L 20 90 L 20 70 L 30 70 L 30 60 L 40 60 L 40 70 L 50 70 L 50 60 L 60 60 L 60 70 L 70 70 L 70 50 L 80 50 L 80 30 L 75 25 L 90 15 L 105 25 L 100 30 L 100 50 L 110 50 L 110 30 L 120 30 L 120 10 L 115 5 L 130 0 L 145 5 L 140 10 L 140 30 L 150 30 L 150 50 L 160 50 L 160 30 L 175 20 L 190 30 L 185 35 L 185 50 L 200 50 L 200 70 L 220 70 L 220 140 Z"
      fill={fill}
    />
  </svg>
)

export type MonumentKind = "abbey" | "cathedral" | "chateau"

const MONUMENT_BY_KIND = {
  abbey: MonumentAbbey,
  cathedral: MonumentCathedral,
  chateau: MonumentChateau,
} as const

const MonumentIcon = ({
  kind,
  fill = "currentColor",
  ...props
}: MonumentProps & { kind: MonumentKind }) => {
  const Component = MONUMENT_BY_KIND[kind] ?? MonumentChateau
  return <Component fill={fill} {...props} />
}

export { MonumentAbbey, MonumentCathedral, MonumentChateau, MonumentIcon }
