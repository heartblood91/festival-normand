"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { Search } from "lucide-react"
import { cn, removeAccents } from "@/lib/utils"

type EventsSearchBarProps = {
  cities: string[]
}

const EventsSearchBar = ({ cities }: EventsSearchBarProps) => {
  const router = useRouter()
  const t = useTranslations()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get("search") ?? "")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const filteredCities =
    query.length >= 2
      ? cities
          .filter((city) => removeAccents(city.toLowerCase()).includes(removeAccents(query.toLowerCase())))
          .slice(0, 5)
      : []

  const buildUrl = (searchQuery: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (searchQuery.trim()) {
      params.set("search", searchQuery.trim())
    } else {
      params.delete("search")
    }
    params.delete("page")
    const qs = params.toString()
    return `/evenements${qs ? `?${qs}` : ""}`
  }

  const handleSubmit = (searchQuery?: string) => {
    const q = searchQuery ?? query
    router.push(buildUrl(q))
    setShowSuggestions(false)
  }

  const handleSelectCity = (city: string) => {
    setQuery(city)
    setShowSuggestions(false)
    handleSubmit(city)
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={wrapperRef} className="relative flex-1">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSubmit()
        }}
        role="search"
        aria-label={t("search.ariaLabel")}
      >
        <Search
          className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setShowSuggestions(e.target.value.length >= 2)
          }}
          onFocus={() => {
            if (query.length >= 2) setShowSuggestions(true)
          }}
          placeholder={t("search.placeholder")}
          className="h-10 w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 md:h-12 md:text-base"
          aria-label={t("search.ariaLabel")}
          aria-autocomplete="list"
          aria-expanded={showSuggestions && filteredCities.length > 0}
          aria-controls="events-city-suggestions"
          role="combobox"
          autoComplete="off"
        />
      </form>

      {showSuggestions && filteredCities.length > 0 && (
        <ul
          id="events-city-suggestions"
          role="listbox"
          className="absolute left-0 right-0 top-full z-10 mt-2 overflow-hidden rounded-xl border border-white/10 bg-background/95 backdrop-blur-xl"
        >
          {filteredCities.map((city) => (
            <li key={city} role="option" aria-selected={false}>
              <button
                type="button"
                onClick={() => handleSelectCity(city)}
                className={cn(
                  "flex w-full items-center gap-2 px-4 py-3 text-left text-sm transition-colors hover:bg-white/5 hover:text-primary",
                  "focus-visible:bg-white/5 focus-visible:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                )}
              >
                <Search
                  className="size-3.5 text-muted-foreground"
                  aria-hidden="true"
                />
                {city}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export { EventsSearchBar }
