"use client"

import { useTranslations } from "next-intl"
import { BookMarked } from "lucide-react"
import { Link } from "@/lib/i18n/routing"
import { cn } from "@/lib/utils"
import { useFavorites } from "@/lib/travel-book/use-favorites"

export const TravelBookLink = ({ active = false }: { active?: boolean }) => {
  const t = useTranslations("travelBook")
  const { ids } = useFavorites()

  return (
    <Link
      href="/carnet"
      aria-label={t("nav", { count: ids.length })}
      aria-current={active ? "page" : undefined}
      title={t("title")}
      className={cn(
        "hover:text-primary focus-visible:ring-primary/50 relative inline-flex size-11 items-center justify-center rounded-sm transition-colors focus-visible:ring-2 focus-visible:outline-none",
        active ? "text-primary" : "text-foreground"
      )}
    >
      <BookMarked className="size-5" aria-hidden="true" />
      {ids.length > 0 ? (
        <span
          className="bg-primary text-primary-foreground absolute top-1 right-0.5 min-w-4 rounded-full px-1 text-center font-sans text-[10px] leading-4 font-semibold"
          aria-hidden="true"
        >
          {ids.length}
        </span>
      ) : null}
    </Link>
  )
}
