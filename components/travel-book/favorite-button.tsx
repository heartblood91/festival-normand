"use client"

import { useTranslations } from "next-intl"
import { Bookmark, BookmarkCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { useFavorites } from "@/lib/travel-book/use-favorites"

type FavoriteButtonProps = {
  eventId: string
  title: string
  /** "icon" sits over a card image; "labelled" shows the text next to the icon. */
  variant?: "icon" | "labelled"
  className?: string
}

export const FavoriteButton = ({
  eventId,
  title,
  variant = "icon",
  className,
}: FavoriteButtonProps) => {
  const t = useTranslations("travelBook")
  const { ids, toggle } = useFavorites()
  const saved = ids.includes(eventId)
  const Icon = saved ? BookmarkCheck : Bookmark

  return (
    <button
      type="button"
      onClick={() => toggle(eventId)}
      aria-pressed={saved}
      aria-label={variant === "icon" ? t("addNamed", { title }) : undefined}
      title={variant === "icon" ? t(saved ? "removeNamed" : "addNamed", { title }) : undefined}
      className={cn(
        "focus-visible:ring-primary/60 inline-flex min-h-11 items-center justify-center gap-2 border transition-colors focus-visible:ring-2 focus-visible:outline-none print:hidden",
        saved
          ? "bg-primary text-primary-foreground border-primary"
          : "border-primary/50 bg-ed-bg-deep/85 text-primary hover:bg-primary/15 backdrop-blur-sm",
        variant === "icon"
          ? "size-11"
          : "px-4 font-sans text-[11px] font-semibold tracking-[0.14em] uppercase",
        className
      )}
    >
      <Icon className="size-4" aria-hidden="true" />
      {variant === "labelled" ? <span>{t(saved ? "added" : "add")}</span> : null}
    </button>
  )
}
