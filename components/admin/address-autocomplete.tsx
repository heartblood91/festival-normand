"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type ApiAddressProperty = {
  name: string
  postcode: string
  citycode: string
  city: string
  lat: number
  lon: number
}

type AddressResult = {
  location: string
  city: string
  postalCode: string
  department: string
  latitude: number
  longitude: number
}

type AddressAutocompleteProps = {
  onSelect: (result: AddressResult) => void
  defaultValue?: string
}

const DEPARTMENT_CODE_MAP: Record<string, string> = {
  "14": "CALVADOS",
  "27": "EURE",
  "50": "MANCHE",
  "61": "ORNE",
  "76": "SEINE_MARITIME",
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const debounce = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout | null = null
  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

export const AddressAutocomplete = ({
  onSelect,
  defaultValue = "",
}: AddressAutocompleteProps) => {
  const [query, setQuery] = useState(defaultValue)
  const [suggestions, setSuggestions] = useState<ApiAddressProperty[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchSuggestions = async (q: string) => {
    if (q.length < 3) {
      setSuggestions([])
      setIsOpen(false)
      return
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()

    try {
      const response = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(q)}&limit=5`,
        { signal: abortControllerRef.current.signal }
      )
      const data = await response.json()
      const features = data.features || []
      setSuggestions(features.map((f: { properties: any }) => f.properties))
      setIsOpen(features.length > 0)
      setSelectedIndex(-1)
    } catch {
      setSuggestions([])
      setIsOpen(false)
    }
  }

  const debouncedFetch = debounce(fetchSuggestions, 500)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    debouncedFetch(e.target.value)
  }

  const handleSelectSuggestion = (suggestion: ApiAddressProperty) => {
    const { name, postcode, city, lat, lon } = suggestion
    const deptCode = postcode.substring(0, 2)
    const department = DEPARTMENT_CODE_MAP[deptCode] || ""

    onSelect({
      location: name,
      city,
      postalCode: postcode,
      department,
      latitude: lat,
      longitude: lon,
    })

    setQuery(`${name}, ${postcode} ${city}`)
    setIsOpen(false)
    setSuggestions([])
    setSelectedIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case "Enter":
        e.preventDefault()
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSelectSuggestion(suggestions[selectedIndex])
        }
        break
      case "Escape":
        e.preventDefault()
        setIsOpen(false)
        setSelectedIndex(-1)
        break
      default:
        break
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative">
      <Label htmlFor="addressAutocomplete" className="text-slate-300">
        Lieu *
      </Label>
      <Input
        ref={inputRef}
        id="addressAutocomplete"
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (suggestions.length > 0) {
            setIsOpen(true)
          }
        }}
        placeholder="Saisissez une adresse..."
        required
        className="mt-1 border-white/10 bg-white/5 text-white"
        aria-autocomplete="list"
        aria-expanded={isOpen}
        aria-controls="address-suggestions"
        autoComplete="off"
      />

      {isOpen && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          id="address-suggestions"
          role="listbox"
          className="absolute top-full left-0 right-0 z-50 mt-2 rounded-lg border border-white/10 bg-slate-900 shadow-lg"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.name}-${index}`}
              type="button"
              onClick={() => handleSelectSuggestion(suggestion)}
              onMouseEnter={() => setSelectedIndex(index)}
              role="option"
              aria-selected={selectedIndex === index}
              className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                selectedIndex === index
                  ? "bg-amber-500/20 text-amber-100"
                  : "text-slate-300 hover:bg-white/5"
              }`}
            >
              <div className="font-medium">
                {suggestion.name}
              </div>
              <div className="text-xs text-slate-500">
                {suggestion.postcode} {suggestion.city}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
