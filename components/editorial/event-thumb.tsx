import Image from "next/image"
import { cn } from "@/lib/utils"
import { MonumentIcon, type MonumentKind } from "@/components/editorial/monuments"

// Category-driven gradient + silhouette, used when an event has no cover photo.
const PALETTES: Record<string, [string, string, string]> = {
  ILLUMINATIONS: ["#2a1a0e", "#3a2818", "#f0904a"],
  EXPOSITIONS: ["#0a1a28", "#1a3050", "#f5b07a"],
  ANIMATIONS: ["#1c1408", "#3a2a14", "#f0904a"],
  VISITES: ["#0a1428", "#1a2540", "#c66a2c"],
}
const SHAPES: MonumentKind[] = ["chateau", "abbey", "cathedral"]

const hash = (seed: string) => {
  let h = 0
  for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) | 0
  return Math.abs(h)
}

type EventThumbProps = {
  coverImage?: string | null
  category: string
  title: string
  seed?: string
  className?: string
  sizes?: string
  priority?: boolean
}

const EventThumb = ({
  coverImage,
  category,
  title,
  seed,
  className,
  sizes = "120px",
  priority = false,
}: EventThumbProps) => {
  const base = cn("border-primary/30 relative overflow-hidden border", className)

  if (coverImage) {
    return (
      <div className={base}>
        {/* Decorative: thumbs sit inside a card link already named by the event title. */}
        <Image
          src={coverImage}
          alt=""
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      </div>
    )
  }

  const [from, via, to] = PALETTES[category] ?? PALETTES.VISITES
  const shape = SHAPES[hash(seed ?? title) % SHAPES.length]

  return (
    <div
      className={base}
      style={{
        backgroundImage: `linear-gradient(135deg, ${from} 0%, ${via} 45%, ${to} 130%)`,
      }}
      aria-hidden="true"
    >
      <div
        className="absolute bottom-[-30%] left-1/2 h-[60%] w-[85%] -translate-x-1/2 blur-md"
        style={{
          background: `radial-gradient(ellipse, var(--ed-amber-soft) 0%, transparent 60%)`,
        }}
        aria-hidden="true"
      />
      <MonumentIcon
        kind={shape}
        fill="#05070f"
        className="absolute bottom-0 left-1/2 h-[72%] w-[75%] -translate-x-1/2 opacity-90"
      />
    </div>
  )
}

export { EventThumb }
