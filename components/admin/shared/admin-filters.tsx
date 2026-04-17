"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"

export type FilterConfig = {
  key: string
  label: string
  options: Array<{ value: string; label: string }>
}

type AdminFiltersProps = {
  filters: FilterConfig[]
  baseUrl: string
  currentValues: Record<string, string>
}

export const AdminFilters = ({ filters, baseUrl, currentValues }: AdminFiltersProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleFilterChange = (key: string, value: string, currentValue: string) => {
    const params = new URLSearchParams(searchParams)

    if (value === currentValue) {
      params.delete(key)
    } else if (value === "") {
      params.delete(key)
    } else {
      params.set(key, value)
    }

    params.delete("page")
    params.set("page", "1")

    router.push(`${baseUrl}?${params.toString()}`)
  }

  const handleClearFilter = (key: string) => {
    const params = new URLSearchParams(searchParams)
    params.delete(key)
    params.delete("page")
    params.set("page", "1")

    router.push(`${baseUrl}?${params.toString()}`)
  }

  const handleClearAll = () => {
    const params = new URLSearchParams()
    const searchValue = searchParams.get("search") ?? undefined
    if (searchValue) params.set("search", searchValue)
    params.set("page", "1")

    router.push(`${baseUrl}${params.toString() ? `?${params}` : ""}`)
  }

  const hasActiveFilters = Object.values(currentValues).some((v) => v && v !== "all")

  const getDisplayLabel = (filter: FilterConfig, value: string) => {
    if (!value || value === "all") return filter.label
    const option = filter.options.find((o) => o.value === value)
    if (!option) return filter.label

    if (filter.label === option.label) {
      return option.label
    }
    return `${filter.label}: ${option.label}`
  }

  return (
    <div className="mb-6 flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {filters.map((filter) => {
          const currentValue = currentValues[filter.key]
          const isActive = currentValue && currentValue !== "all" && currentValue !== ""

          return (
            <div key={filter.key} className="flex items-center gap-1">
              <Select
                value={(currentValue === "all" ? "" : currentValue) ?? ""}
                onValueChange={(value) =>
                  handleFilterChange(filter.key, value ?? "", currentValue ?? "")
                }
              >
                <SelectTrigger
                  className={cn(
                    "border-white/10 bg-white/5",
                    isActive && "border-amber-500/30 bg-amber-500/10 text-amber-400"
                  )}
                >
                  <span className="truncate">{getDisplayLabel(filter, currentValue ?? "")}</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">
                    <span className="text-slate-400">{filter.label}</span>
                  </SelectItem>
                  {filter.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isActive && (
                <button
                  onClick={() => handleClearFilter(filter.key)}
                  className="text-slate-400 hover:text-amber-400"
                  aria-label={`Clear ${filter.label} filter`}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          )
        })}

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="border border-white/10 bg-white/5 hover:bg-white/10"
          >
            <X className="mr-2 h-4 w-4" />
            Effacer les filtres
          </Button>
        )}
      </div>
    </div>
  )
}
