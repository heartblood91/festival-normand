import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

type RatingStarsProps = {
  /** Already rounded to the nearest half when it is an average. */
  value: number
  label: string
  className?: string
}

/** Five stars read out as a single "4 out of 5" image. */
export const RatingStars = ({ value, label, className }: RatingStarsProps) => (
  <span role="img" aria-label={label} className={cn("inline-flex gap-0.5", className)}>
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        aria-hidden="true"
        className={cn(
          "size-4",
          value >= star - 0.25 ? "fill-primary text-primary" : "text-primary/40"
        )}
      />
    ))}
  </span>
)
