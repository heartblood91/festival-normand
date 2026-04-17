"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { X } from "lucide-react"

const FILTER_LABELS: Record<string, Record<string, string>> = {
  date: {
    "29": "Ven 29 mai",
    "30": "Sam 30 mai",
    "31": "Dim 31 mai",
  },
  category: {
    illuminations: "Illuminations",
    expositions: "Expositions",
    animations: "Animations",
    visites: "Visites",
  },
  dept: {
    calvados: "Calvados",
    eure: "Eure",
    manche: "Manche",
    orne: "Orne",
    seine_maritime: "Seine-Maritime",
  },
}

const ActiveFilters = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const activeFilters: { key: string; label: string }[] = []

  for (const [param, labels] of Object.entries(FILTER_LABELS)) {
    const value = searchParams.get(param)
    if (value && labels[value]) {
      activeFilters.push({ key: param, label: labels[value] })
    }
  }

  if (searchParams.get("accessible") === "true") {
    activeFilters.push({ key: "accessible", label: "Accessible PMR" })
  }

  if (searchParams.get("search")) {
    activeFilters.push({
      key: "search",
      label: `"${searchParams.get("search")}"`,
    })
  }

  if (activeFilters.length === 0) return null

  const removeFilter = (key: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete(key)
    params.delete("page")
    const qs = params.toString()
    router.push(`/evenements${qs ? `?${qs}` : ""}`)
  }

  const clearAll = () => {
    router.push("/evenements")
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {activeFilters.map((filter) => (
        <button
          key={filter.key}
          onClick={() => removeFilter(filter.key)}
          className="border-primary/20 bg-primary/10 text-primary hover:bg-primary/20 focus-visible:ring-primary/50 flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
          aria-label={`Retirer le filtre ${filter.label}`}
        >
          {filter.label}
          <X className="size-3" aria-hidden="true" />
        </button>
      ))}
      {activeFilters.length > 1 && (
        <button
          onClick={clearAll}
          className="text-muted-foreground hover:text-foreground focus-visible:ring-primary/50 text-xs underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:outline-none"
        >
          Tout effacer
        </button>
      )}
    </div>
  )
}

export { ActiveFilters }
