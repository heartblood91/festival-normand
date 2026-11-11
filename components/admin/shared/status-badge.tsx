import { Eye, EyeOff, FileEdit } from "lucide-react"
import { cn } from "@/lib/utils"

type StatusBadgeProps = {
  published: boolean
  unpublishedAt: Date | null
  className?: string
}

/** Publication status in words, readable at every width (icon alone said nothing on mobile). */
const StatusBadge = ({ published, unpublishedAt, className }: StatusBadgeProps) => {
  const [label, Icon, tone] = published
    ? (["Publié", Eye, "bg-emerald-500/15 text-emerald-400"] as const)
    : unpublishedAt
      ? (["Dépublié", EyeOff, "bg-orange-500/15 text-orange-400"] as const)
      : (["Brouillon", FileEdit, "bg-white/10 text-muted-foreground"] as const)
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        tone,
        className
      )}
    >
      <Icon className="size-3" aria-hidden="true" />
      {label}
    </span>
  )
}

export { StatusBadge }
