"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronDown, Accessibility, X } from "lucide-react"
import { cn } from "@/lib/utils"

const DATE_OPTIONS = [
  { value: "29", label: "Ven 29" },
  { value: "30", label: "Sam 30" },
  { value: "31", label: "Dim 31" },
]

const CATEGORY_OPTIONS = [
  { value: "illuminations", label: "Illuminations" },
  { value: "expositions", label: "Expositions" },
  { value: "animations", label: "Animations" },
  { value: "visites", label: "Visites" },
]

const DEPARTMENT_OPTIONS = [
  { value: "calvados", label: "Calvados" },
  { value: "eure", label: "Eure" },
  { value: "manche", label: "Manche" },
  { value: "orne", label: "Orne" },
  { value: "seine_maritime", label: "Seine-Maritime" },
]

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

type DropdownState = "dept" | "category" | null

const FilterBar = ({ total = 0 }: { total?: number }) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [openDropdown, setOpenDropdown] = useState<DropdownState>(null)
  const [selectedDept, setSelectedDept] = useState(
    searchParams.get("dept") ?? ""
  )
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") ?? ""
  )
  const [selectedDates, setSelectedDates] = useState<string[]>(
    searchParams.get("date") ? [searchParams.get("date")!] : []
  )
  const [pmrEnabled, setPmrEnabled] = useState(
    searchParams.get("accessible") === "true"
  )

  const deptRef = useRef<HTMLDivElement>(null)
  const categoryRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        deptRef.current &&
        !deptRef.current.contains(e.target as Node)
      ) {
        if (openDropdown === "dept") setOpenDropdown(null)
      }
      if (
        categoryRef.current &&
        !categoryRef.current.contains(e.target as Node)
      ) {
        if (openDropdown === "category") setOpenDropdown(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [openDropdown])

  const updateUrl = (
    dept?: string,
    category?: string,
    dates?: string[],
    pmr?: boolean
  ) => {
    const params = new URLSearchParams(searchParams.toString())
    const search = searchParams.get("search")

    if (dept) {
      params.set("dept", dept)
    } else {
      params.delete("dept")
    }

    if (category) {
      params.set("category", category)
    } else {
      params.delete("category")
    }

    if (dates && dates.length > 0) {
      params.set("date", dates[0])
    } else {
      params.delete("date")
    }

    if (pmr) {
      params.set("accessible", "true")
    } else {
      params.delete("accessible")
    }

    params.delete("page")

    const qs = params.toString()
    router.push(`/evenements${qs ? `?${qs}` : ""}`)
  }

  const handleDeptSelect = (value: string) => {
    const newDept = selectedDept === value ? "" : value
    setSelectedDept(newDept)
    setOpenDropdown(null)
    updateUrl(newDept, selectedCategory, selectedDates, pmrEnabled)
  }

  const handleCategorySelect = (value: string) => {
    const newCategory = selectedCategory === value ? "" : value
    setSelectedCategory(newCategory)
    setOpenDropdown(null)
    updateUrl(selectedDept, newCategory, selectedDates, pmrEnabled)
  }

  const handleDateToggle = (value: string) => {
    const newDates = selectedDates.includes(value)
      ? selectedDates.filter((d) => d !== value)
      : [value]
    setSelectedDates(newDates)
    updateUrl(selectedDept, selectedCategory, newDates, pmrEnabled)
  }

  const handlePmrToggle = () => {
    const newPmr = !pmrEnabled
    setPmrEnabled(newPmr)
    updateUrl(selectedDept, selectedCategory, selectedDates, newPmr)
  }

  const clearAll = () => {
    const params = new URLSearchParams()
    const search = searchParams.get("search")
    if (search) params.set("search", search)
    const qs = params.toString()
    router.push(`/evenements${qs ? `?${qs}` : ""}`)
    setSelectedDept("")
    setSelectedCategory("")
    setSelectedDates([])
    setPmrEnabled(false)
  }

  const hasActiveFilters =
    selectedDept || selectedCategory || selectedDates.length > 0 || pmrEnabled

  const activeFilters: { key: string; label: string; type: string }[] = []

  if (selectedDept) {
    activeFilters.push({
      key: "dept",
      label: FILTER_LABELS.dept[selectedDept] || selectedDept,
      type: "dept",
    })
  }

  if (selectedCategory) {
    activeFilters.push({
      key: "category",
      label: FILTER_LABELS.category[selectedCategory] || selectedCategory,
      type: "category",
    })
  }

  selectedDates.forEach((date) => {
    activeFilters.push({
      key: `date-${date}`,
      label: FILTER_LABELS.date[date] || date,
      type: "date",
    })
  })

  if (pmrEnabled) {
    activeFilters.push({
      key: "accessible",
      label: "Accessible PMR",
      type: "accessible",
    })
  }

  const removeFilter = (type: string, value?: string) => {
    if (type === "dept") {
      handleDeptSelect(selectedDept)
    } else if (type === "category") {
      handleCategorySelect(selectedCategory)
    } else if (type === "date" && value) {
      handleDateToggle(value)
    } else if (type === "accessible") {
      handlePmrToggle()
    }
  }

  return (
    <div className="space-y-4">
      {/* Filter controls */}
      <div className="sticky top-16 z-40 -mx-4 -mb-4 bg-gradient-to-b from-background/95 via-background/90 to-background/80 px-4 py-4 backdrop-blur-lg md:rounded-lg md:border md:border-white/10 md:bg-white/5 md:p-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Department dropdown */}
          <div ref={deptRef} className="relative">
            <button
              onClick={() =>
                setOpenDropdown(openDropdown === "dept" ? null : "dept")
              }
              className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50",
                selectedDept
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
              )}
              aria-label="Filtrer par département"
              aria-expanded={openDropdown === "dept"}
              aria-haspopup="listbox"
            >
              <span className="truncate">
                {selectedDept
                  ? DEPARTMENT_OPTIONS.find((d) => d.value === selectedDept)
                      ?.label
                  : "Département"}
              </span>
              <ChevronDown
                className={cn(
                  "size-4 shrink-0 transition-transform",
                  openDropdown === "dept" && "rotate-180"
                )}
              />
            </button>

            {openDropdown === "dept" && (
              <div
                className="absolute left-0 top-full z-50 mt-2 w-48 origin-top-left rounded-lg border border-white/10 bg-background/95 backdrop-blur-xl shadow-lg"
                role="listbox"
              >
                {DEPARTMENT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleDeptSelect(option.value)}
                    role="option"
                    aria-selected={selectedDept === option.value}
                    className={cn(
                      "w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-white/10 focus:bg-white/10 focus:outline-none",
                      selectedDept === option.value && "bg-primary/10 text-primary"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Category dropdown */}
          <div ref={categoryRef} className="relative">
            <button
              onClick={() =>
                setOpenDropdown(openDropdown === "category" ? null : "category")
              }
              className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50",
                selectedCategory
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
              )}
              aria-label="Filtrer par catégorie"
              aria-expanded={openDropdown === "category"}
              aria-haspopup="listbox"
            >
              <span className="truncate">
                {selectedCategory
                  ? CATEGORY_OPTIONS.find((c) => c.value === selectedCategory)
                      ?.label
                  : "Catégorie"}
              </span>
              <ChevronDown
                className={cn(
                  "size-4 shrink-0 transition-transform",
                  openDropdown === "category" && "rotate-180"
                )}
              />
            </button>

            {openDropdown === "category" && (
              <div
                className="absolute left-0 top-full z-50 mt-2 w-48 origin-top-left rounded-lg border border-white/10 bg-background/95 backdrop-blur-xl shadow-lg"
                role="listbox"
              >
                {CATEGORY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleCategorySelect(option.value)}
                    role="option"
                    aria-selected={selectedCategory === option.value}
                    className={cn(
                      "w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-white/10 focus:bg-white/10 focus:outline-none",
                      selectedCategory === option.value &&
                        "bg-primary/10 text-primary"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Date chips */}
          <div className="flex gap-2 sm:flex-wrap">
            {DATE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleDateToggle(option.value)}
                className={cn(
                  "rounded-full border px-3 py-2 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 sm:text-sm",
                  selectedDates.includes(option.value)
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
                )}
                aria-pressed={selectedDates.includes(option.value)}
                aria-label={`Filtrer par ${option.label}`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* PMR toggle */}
          <button
            onClick={handlePmrToggle}
            className={cn(
              "flex items-center justify-center gap-2 rounded-lg border px-3 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50",
              pmrEnabled
                ? "border-primary/30 bg-primary/10 text-primary"
                : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
            )}
            title="Filtrer les événements accessibles aux personnes à mobilité réduite"
            aria-pressed={pmrEnabled}
            aria-label="Accessible PMR"
          >
            <Accessibility className="size-4" />
            <span className="sr-only">Accessible PMR</span>
          </button>

          {/* Result counter */}
          <div
            className="ml-auto text-xs font-medium text-muted-foreground sm:text-sm"
            aria-live="polite"
            aria-atomic="true"
          >
            {total} événements
          </div>
        </div>

        {/* Active filters chips */}
        {hasActiveFilters && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {activeFilters.map((filter) => (
              <button
                key={filter.key}
                onClick={() => removeFilter(filter.type, filter.key.split("-")[1])}
                className="flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/50 sm:text-sm"
                aria-label={`Retirer le filtre ${filter.label}`}
              >
                {filter.label}
                <X className="size-3" aria-hidden="true" />
              </button>
            ))}
            <button
              onClick={clearAll}
              className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline focus:outline-none focus:ring-2 focus:ring-primary/50 sm:text-sm"
              aria-label="Effacer tous les filtres"
            >
              Tout effacer
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export { FilterBar }
