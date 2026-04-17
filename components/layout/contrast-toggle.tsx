"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Eye } from "lucide-react"
import { cn } from "@/lib/utils"

const STORAGE_KEY = "pel-high-contrast"

const ContrastToggle = () => {
  const t = useTranslations("a11y")
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
        "focus-visible:ring-primary/50 inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none",
        highContrast
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground border border-white/10 hover:bg-white/5"
      )}
      aria-pressed={highContrast}
    >
      <Eye className="size-3.5" aria-hidden="true" />
      <span>{t("contrast")}</span>
    </button>
  )
}

export { ContrastToggle }
