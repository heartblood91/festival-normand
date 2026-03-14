"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type SearchBarProps = {
  cities: string[]
}

const SearchBar = ({ cities }: SearchBarProps) => {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const filteredCities = query.length >= 2
    ? cities.filter((city) =>
        city.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5)
    : []

  const handleSubmit = (searchQuery?: string) => {
    const q = searchQuery ?? query
    const params = new URLSearchParams()
    if (q.trim()) {
      params.set("search", q.trim())
    }
    const qs = params.toString()
    router.push(`/evenements${qs ? `?${qs}` : ""}`)
    setShowSuggestions(false)
  }

  const handleSelectCity = (city: string) => {
    setQuery(city)
    setShowSuggestions(false)
    handleSubmit(city)
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <section className="mx-auto -mt-8 max-w-3xl px-4 md:-mt-12" aria-label="Recherche d'événements">
      <div ref={wrapperRef} className="relative">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmit()
          }}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-2 backdrop-blur-xl md:gap-3 md:p-3"
          role="search"
          aria-label="Rechercher un événement par ville"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
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
              placeholder="Rechercher une ville..."
              className="h-10 w-full rounded-lg bg-white/5 pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 md:h-12 md:text-base"
              aria-label="Rechercher un événement par ville"
              aria-autocomplete="list"
              aria-expanded={showSuggestions && filteredCities.length > 0}
              aria-controls="city-suggestions"
              role="combobox"
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="hidden h-10 px-6 sm:flex md:h-12"
          >
            Rechercher
          </Button>
        </form>

        {/* Autocomplete suggestions */}
        {showSuggestions && filteredCities.length > 0 && (
          <ul
            id="city-suggestions"
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
                    "focus:bg-white/5 focus:text-primary focus:outline-none"
                  )}
                >
                  <Search className="size-3.5 text-muted-foreground" aria-hidden="true" />
                  {city}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

export { SearchBar }
