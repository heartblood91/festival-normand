"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { ChevronDown, Accessibility, X } from "lucide-react"
import { cn } from "@/lib/utils"

type FilterCounts = {
  departments: Record<string, number>
  categories: Record<string, number>
}

const DATE_OPTIONS = [
  { value: "29", labelKey: "date29" },
  { value: "30", labelKey: "date30" },
  { value: "31", labelKey: "date31" },
]

const CATEGORY_OPTIONS = [
  { value: "illuminations", labelKey: "ILLUMINATIONS" },
  { value: "expositions", labelKey: "EXPOSITIONS" },
  { value: "animations", labelKey: "ANIMATIONS" },
  { value: "visites", labelKey: "VISITES" },
]

const DEPARTMENT_OPTIONS = [
  { value: "calvados", labelKey: "CALVADOS" },
  { value: "eure", labelKey: "EURE" },
  { value: "manche", labelKey: "MANCHE" },
  { value: "orne", labelKey: "ORNE" },
  { value: "seine_maritime", labelKey: "SEINE_MARITIME" },
]

type DropdownState = "dept" | "category" | null

const FilterBar = ({ total = 0, counts }: { total?: number; counts?: FilterCounts }) => {
  const router = useRouter()
  const t = useTranslations()
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

  const getFilterLabel = (type: string, value: string): string => {
    switch (type) {
      case "dept":
        return t(`departments.${DEPARTMENT_OPTIONS.find((d) => d.value === value)?.labelKey || "CALVADOS"}`)
      case "category":
        return t(`categories.${CATEGORY_OPTIONS.find((c) => c.value === value)?.labelKey || "ILLUMINATIONS"}`)
      case "date":
        return t(`filters.${DATE_OPTIONS.find((d) => d.value === value)?.labelKey || "date29"}Full`)
      default:
        return value
    }
  }

  const activeFilters: { key: string; label: string; type: string }[] = []

  if (selectedDept) {
    activeFilters.push({
      key: "dept",
      label: getFilterLabel("dept", selectedDept),
      type: "dept",
    })
  }

  if (selectedCategory) {
    activeFilters.push({
      key: "category",
      label: getFilterLabel("category", selectedCategory),
      type: "category",
    })
  }

  selectedDates.forEach((date) => {
    activeFilters.push({
      key: `date-${date}`,
      label: getFilterLabel("date", date),
      type: "date",
    })
  })

  if (pmrEnabled) {
    activeFilters.push({
      key: "accessible",
      label: t("filters.pmr"),
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
                "min-h-10 min-w-10 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50",
                selectedDept
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
              )}
              aria-label={t("filters.department")}
              aria-expanded={openDropdown === "dept"}
              aria-haspopup="listbox"
            >
              <span className="truncate">
                {selectedDept
                  ? t(`departments.${DEPARTMENT_OPTIONS.find((d) => d.value === selectedDept)
                      ?.labelKey || "CALVADOS"}`)
                  : t("filters.department")}
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
                {DEPARTMENT_OPTIONS.map((option) => {
                  const count = counts?.departments[option.value.toUpperCase()] ?? 0
                  const hasResults = count > 0

                  return (
                    <button
                      key={option.value}
                      onClick={() => handleDeptSelect(option.value)}
                      role="option"
                      aria-selected={selectedDept === option.value}
                      className={cn(
                        "w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-white/10 focus:bg-white/10 focus:outline-none",
                        !hasResults && "opacity-50",
                        selectedDept === option.value && "bg-primary/10 text-primary"
                      )}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span>{t(`departments.${option.labelKey}`)}</span>
                        <span className="text-xs font-medium text-muted-foreground">
                          ({count})
                        </span>
                      </span>
                    </button>
                  )
                })}
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
                "min-h-10 min-w-10 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50",
                selectedCategory
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
              )}
              aria-label={t("filters.category")}
              aria-expanded={openDropdown === "category"}
              aria-haspopup="listbox"
            >
              <span className="truncate">
                {selectedCategory
                  ? t(`categories.${CATEGORY_OPTIONS.find((c) => c.value === selectedCategory)
                      ?.labelKey || "ILLUMINATIONS"}`)
                  : t("filters.category")}
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
                {CATEGORY_OPTIONS.map((option) => {
                  const count = counts?.categories[option.value.toUpperCase()] ?? 0
                  const hasResults = count > 0

                  return (
                    <button
                      key={option.value}
                      onClick={() => handleCategorySelect(option.value)}
                      role="option"
                      aria-selected={selectedCategory === option.value}
                      className={cn(
                        "w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-white/10 focus:bg-white/10 focus:outline-none",
                        !hasResults && "opacity-50",
                        selectedCategory === option.value && "bg-primary/10 text-primary"
                      )}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span>{t(`categories.${option.labelKey}`)}</span>
                        <span className="text-xs font-medium text-muted-foreground">
                          ({count})
                        </span>
                      </span>
                    </button>
                  )
                })}
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
                  "min-h-10 min-w-10 rounded-full border px-3 py-2 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 sm:text-sm",
                  selectedDates.includes(option.value)
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
                )}
                aria-pressed={selectedDates.includes(option.value)}
                aria-label={`${t("filters.removeFilter", { filter: t(`filters.${option.labelKey}`) })}`}
              >
                {t(`filters.${option.labelKey}`)}
              </button>
            ))}
          </div>

          {/* PMR toggle */}
          <button
            onClick={handlePmrToggle}
            className={cn(
              "min-h-10 min-w-10 flex items-center justify-center gap-2 rounded-lg border px-3 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50",
              pmrEnabled
                ? "border-primary/30 bg-primary/10 text-primary"
                : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
            )}
            title={t("filters.pmr")}
            aria-pressed={pmrEnabled}
            aria-label={t("filters.pmr")}
          >
            <Accessibility className="size-4" />
            <span className="sr-only">{t("filters.pmr")}</span>
          </button>

          {/* Result counter */}
          <div
            className="ml-auto text-xs font-medium text-muted-foreground sm:text-sm"
            aria-live="polite"
            aria-atomic="true"
          >
            {t("filters.eventCount", { count: total })}
          </div>
        </div>

        {/* Active filters chips */}
        {hasActiveFilters && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {activeFilters.map((filter) => (
              <button
                key={filter.key}
                onClick={() => removeFilter(filter.type, filter.key.split("-")[1])}
                className="min-h-9 flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/50 sm:text-sm"
                aria-label={t("filters.removeFilter", { filter: filter.label })}
              >
                {filter.label}
                <X className="size-3" aria-hidden="true" />
              </button>
            ))}
            <button
              onClick={clearAll}
              className="min-h-9 text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-sm sm:text-sm"
              aria-label={t("filters.clearAll")}
            >
              {t("filters.clearAll")}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export { FilterBar }
