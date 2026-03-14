import { cn } from "@/lib/utils"

type SparkleIconProps = {
  className?: string
}

const SparkleIcon = ({ className }: SparkleIconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={cn("size-5 text-primary", className)}
    aria-hidden="true"
  >
    <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" />
  </svg>
)

export { SparkleIcon }
