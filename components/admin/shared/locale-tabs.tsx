"use client"

import { useRef, type KeyboardEvent } from "react"
import type { LocaleTabState } from "@/lib/admin/form-status"

export type FormLocale = "fr" | "en"

const LOCALES: { value: FormLocale; label: string }[] = [
  { value: "fr", label: "FR" },
  { value: "en", label: "EN" },
]

const BADGES: Record<Exclude<LocaleTabState, null>, { dot: string; text: string }> = {
  error: { dot: "bg-red-500", text: "contient des erreurs" },
  incomplete: { dot: "bg-amber-400", text: "à compléter" },
}

export const localeTabId = (locale: FormLocale) => `locale-tab-${locale}`

/** Props for a panel switched by the tabs; several panels may share them. */
export const localePanelProps = (id: string, locale: FormLocale) => ({
  id,
  role: "tabpanel" as const,
  "aria-labelledby": localeTabId(locale),
})

export const LocaleTabs = ({
  value,
  onChange,
  status,
  panelIds,
}: {
  value: FormLocale
  onChange: (locale: FormLocale) => void
  status: Record<FormLocale, LocaleTabState>
  panelIds: string[]
}) => {
  const tabs = useRef<Partial<Record<FormLocale, HTMLButtonElement | null>>>({})

  const select = (locale: FormLocale) => {
    onChange(locale)
    tabs.current[locale]?.focus()
  }

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const index = LOCALES.findIndex(({ value: locale }) => locale === value)
    const moves: Record<string, number> = {
      ArrowRight: (index + 1) % LOCALES.length,
      ArrowLeft: (index - 1 + LOCALES.length) % LOCALES.length,
      Home: 0,
      End: LOCALES.length - 1,
    }
    if (!(event.key in moves)) return
    event.preventDefault()
    select(LOCALES[moves[event.key]].value)
  }

  return (
    <div
      role="tablist"
      aria-label="Langue du contenu"
      className="inline-flex gap-1 rounded-lg border border-white/10 p-1"
    >
      {LOCALES.map(({ value: locale, label }) => {
        const selected = locale === value
        const badge = status[locale] ? BADGES[status[locale]] : null
        return (
          <button
            key={locale}
            ref={(element) => {
              tabs.current[locale] = element
            }}
            id={localeTabId(locale)}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={panelIds.join(" ")}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(locale)}
            onKeyDown={onKeyDown}
            className={`relative inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded px-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none ${
              selected ? "bg-amber-500 text-slate-950" : "text-muted-foreground hover:text-white"
            }`}
          >
            {label}
            {badge && (
              <>
                <span className={`h-2 w-2 rounded-full ${badge.dot}`} aria-hidden="true" />
                <span className="sr-only">({badge.text})</span>
              </>
            )}
          </button>
        )
      })}
    </div>
  )
}
