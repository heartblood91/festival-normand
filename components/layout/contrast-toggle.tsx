"use client"

import { useState, useEffect } from "react"
import { Eye } from "lucide-react"
import { cn } from "@/lib/utils"

const STORAGE_KEY = "pel-high-contrast"

const ContrastToggle = () => {
  const [highContrast, setHighContrast] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === "true") {
      setHighContrast(true)
      document.documentElement.classList.add("high-contrast")
    }
  }, [])

  const toggle = () => {
    const next = !highContrast
    setHighContrast(next)
    localStorage.setItem(STORAGE_KEY, String(next))
    document.documentElement.classList.toggle("high-contrast", next)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        highContrast
          ? "bg-primary text-primary-foreground"
          : "border border-white/10 text-muted-foreground hover:bg-white/5 hover:text-foreground"
      )}
      aria-pressed={highContrast}
    >
      <Eye className="size-3.5" aria-hidden="true" />
      <span>Contraste</span>
    </button>
  )
}

export { ContrastToggle }
