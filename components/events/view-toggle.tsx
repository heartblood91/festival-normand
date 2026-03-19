"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { Grid3X3, Map } from "lucide-react"
import { cn } from "@/lib/utils"

const ViewToggle = () => {
  const t = useTranslations()
  const router = useRouter()
  const searchParams = useSearchParams()
  const view = searchParams.get("view") ?? "grid"

  const toggleView = (newView: "grid" | "map") => {
    const params = new URLSearchParams(searchParams.toString())
    if (newView === "grid") {
      params.delete("view")
    } else {
      params.set("view", newView)
    }
    const qs = params.toString()
    router.push(`/evenements${qs ? `?${qs}` : ""}`)
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => toggleView("grid")}
        className={cn(
          "min-h-10 min-w-10 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50",
          view === "grid"
            ? "border-primary/30 bg-primary/10 text-primary"
            : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
        )}
        aria-pressed={view === "grid"}
        aria-label={t("filters.grid")}
      >
        <Grid3X3 className="size-4" />
        <span className="hidden sm:inline">{t("filters.grid")}</span>
      </button>

      <button
        onClick={() => toggleView("map")}
        className={cn(
          "min-h-10 min-w-10 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50",
          view === "map"
            ? "border-primary/30 bg-primary/10 text-primary"
            : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
        )}
        aria-pressed={view === "map"}
        aria-label={t("filters.map")}
      >
        <Map className="size-4" />
        <span className="hidden sm:inline">{t("filters.map")}</span>
      </button>
    </div>
  )
}

export { ViewToggle }
