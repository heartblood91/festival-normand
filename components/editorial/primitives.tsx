import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

// ¶ editorial label — the signature paragraph marker used across all sections.
type MarkerProps = {
  children: ReactNode
  index?: string
  className?: string
}

const Marker = ({ children, index, className }: MarkerProps) => (
  <p
    className={cn(
      "text-primary font-mono text-[11px] tracking-[0.22em] uppercase",
      className
    )}
  >
    <span aria-hidden="true">¶</span>{" "}
    {index ? <>{index} — </> : null}
    {children}
  </p>
)

// Decorative centered rule: line · dot · line.
const Rule = ({ className }: { className?: string }) => (
  <div
    className={cn("my-10 flex items-center justify-center gap-4", className)}
    aria-hidden="true"
  >
    <span className="bg-primary/50 h-px w-14" />
    <svg width="14" height="14" viewBox="0 0 14 14">
      <circle cx="7" cy="7" r="2" fill="var(--primary)" />
      <circle cx="7" cy="7" r="6" fill="none" stroke="var(--primary)" strokeOpacity="0.5" />
    </svg>
    <span className="bg-primary/50 h-px w-14" />
  </div>
)

// Section header: marker + display title (+ optional lede) on the left,
// optional CTA link on the right. Mobile-first: stacks, then row at md.
type SectionHeadingProps = {
  marker: ReactNode
  markerIndex?: string
  title: ReactNode
  lede?: ReactNode
  action?: ReactNode
  as?: "h1" | "h2"
  className?: string
}

const SectionHeading = ({
  marker,
  markerIndex,
  title,
  lede,
  action,
  as = "h2",
  className,
}: SectionHeadingProps) => {
  const Title = as
  return (
    <div
      className={cn(
        "border-primary/25 mb-10 flex flex-col gap-6 border-b pb-6 md:mb-12 md:flex-row md:items-end md:justify-between",
        className
      )}
    >
      <div className="max-w-2xl">
        <Marker index={markerIndex} className="mb-3.5">
          {marker}
        </Marker>
        <Title className="text-foreground font-display text-4xl font-normal tracking-tight italic md:text-5xl">
          {title}
        </Title>
        {lede ? (
          <p className="text-ed-bone font-serif mt-3 text-lg font-light italic opacity-80">
            {lede}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}

export { Marker, Rule, SectionHeading }
