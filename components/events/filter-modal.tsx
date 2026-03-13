"use client"

import { useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { X, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const DATE_OPTIONS = [
  { value: "29", label: "Ven 29 mai" },
  { value: "30", label: "Sam 30 mai" },
  { value: "31", label: "Dim 31 mai" },
]

const CATEGORY_OPTIONS = [
  { value: "ILLUMINATIONS", label: "Illuminations" },
  { value: "EXPOSITIONS", label: "Expositions" },
  { value: "ANIMATIONS", label: "Animations" },
  { value: "VISITES", label: "Visites" },
]

const DEPARTMENT_OPTIONS = [
  { value: "CALVADOS", label: "Calvados" },
  { value: "EURE", label: "Eure" },
  { value: "MANCHE", label: "Manche" },
  { value: "ORNE", label: "Orne" },
  { value: "SEINE_MARITIME", label: "Seine-Maritime" },
]

type FilterState = {
  date: string
  category: string
  department: string
  accessible: boolean
}

const FilterModal = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)

  const [filters, setFilters] = useState<FilterState>({
    date: searchParams.get("date") ?? "",
    category: searchParams.get("category") ?? "",
    department: searchParams.get("dept") ?? "",
    accessible: searchParams.get("accessible") === "true",
  })

  const handleOpen = useCallback(() => {
    setFilters({
      date: searchParams.get("date") ?? "",
      category: searchParams.get("category") ?? "",
      department: searchParams.get("dept") ?? "",
      accessible: searchParams.get("accessible") === "true",
    })
    setIsOpen(true)
  }, [searchParams])

  const handleClearAll = () => {
    setFilters({ date: "", category: "", department: "", accessible: false })
  }

  const handleApply = () => {
    const params = new URLSearchParams()
    const search = searchParams.get("search")
    if (search) params.set("search", search)
    if (filters.date) params.set("date", filters.date)
    if (filters.category) params.set("category", filters.category.toLowerCase())
    if (filters.department) params.set("dept", filters.department.toLowerCase())
    if (filters.accessible) params.set("accessible", "true")

    const queryString = params.toString()
    router.push(`/evenements${queryString ? `?${queryString}` : ""}`)
    setIsOpen(false)
  }

  const activeFilterCount = [
    filters.date,
    filters.category,
    filters.department,
    filters.accessible,
  ].filter(Boolean).length

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={handleOpen}
        className="gap-2"
        aria-label="Ouvrir les filtres"
      >
        <SlidersHorizontal className="size-4" />
        <span>Filtres</span>
        {activeFilterCount > 0 && (
          <span className="flex size-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            {activeFilterCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center md:items-center"
          role="dialog"
          aria-modal="true"
          aria-label="Filtrer les événements"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Modal content */}
          <div className="relative w-full max-w-lg rounded-t-2xl border border-white/10 bg-background p-6 md:rounded-2xl">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-serif text-xl font-bold text-foreground">
                Filtrer les événements
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="flex size-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                aria-label="Fermer les filtres"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Date filter */}
            <FilterGroup label="Date">
              {DATE_OPTIONS.map((opt) => (
                <RadioOption
                  key={opt.value}
                  label={opt.label}
                  selected={filters.date === opt.value}
                  onClick={() =>
                    setFilters((f) => ({
                      ...f,
                      date: f.date === opt.value ? "" : opt.value,
                    }))
                  }
                />
              ))}
            </FilterGroup>

            {/* Category filter */}
            <FilterGroup label="Catégorie">
              {CATEGORY_OPTIONS.map((opt) => (
                <RadioOption
                  key={opt.value}
                  label={opt.label}
                  selected={filters.category === opt.value}
                  onClick={() =>
                    setFilters((f) => ({
                      ...f,
                      category: f.category === opt.value ? "" : opt.value,
                    }))
                  }
                />
              ))}
            </FilterGroup>

            {/* Department filter */}
            <FilterGroup label="Département">
              {DEPARTMENT_OPTIONS.map((opt) => (
                <RadioOption
                  key={opt.value}
                  label={opt.label}
                  selected={filters.department === opt.value}
                  onClick={() =>
                    setFilters((f) => ({
                      ...f,
                      department: f.department === opt.value ? "" : opt.value,
                    }))
                  }
                />
              ))}
            </FilterGroup>

            {/* Accessibility toggle */}
            <div className="mb-6">
              <button
                onClick={() =>
                  setFilters((f) => ({ ...f, accessible: !f.accessible }))
                }
                className={cn(
                  "flex w-full items-center justify-between rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                  filters.accessible
                    ? "border-primary/30 bg-primary/10 text-foreground"
                    : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10"
                )}
                role="switch"
                aria-checked={filters.accessible}
                aria-label="Accessible PMR"
              >
                <span className="text-sm font-medium">Accessible PMR</span>
                <span
                  className={cn(
                    "relative h-6 w-11 rounded-full transition-colors",
                    filters.accessible ? "bg-primary" : "bg-white/20"
                  )}
                >
                  <span
                    className={cn(
                      "absolute left-0.5 top-0.5 size-5 rounded-full bg-white transition-transform",
                      filters.accessible && "translate-x-5"
                    )}
                  />
                </span>
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={handleClearAll}
                className="flex-1"
              >
                Tout effacer
              </Button>
              <Button
                type="button"
                onClick={handleApply}
                className="flex-1"
              >
                Valider
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

type FilterGroupProps = {
  label: string
  children: React.ReactNode
}

const FilterGroup = ({ label, children }: FilterGroupProps) => (
  <fieldset className="mb-5">
    <legend className="mb-2.5 text-sm font-medium text-muted-foreground">
      {label}
    </legend>
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={label}>
      {children}
    </div>
  </fieldset>
)

type RadioOptionProps = {
  label: string
  selected: boolean
  onClick: () => void
}

const RadioOption = ({ label, selected, onClick }: RadioOptionProps) => (
  <button
    type="button"
    role="radio"
    aria-checked={selected}
    onClick={onClick}
    className={cn(
      "rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
      selected
        ? "border-primary/30 bg-primary/10 text-primary"
        : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
    )}
  >
    {label}
  </button>
)

export { FilterModal, DATE_OPTIONS, CATEGORY_OPTIONS, DEPARTMENT_OPTIONS }
