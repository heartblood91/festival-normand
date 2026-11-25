"use client"

import { useSyncExternalStore } from "react"
import { ExternalLink, Ticket, X } from "lucide-react"
import { passBannerStorageKey } from "@/lib/site-settings/pass-patrimoine"

type PassBannerViewProps = {
  id: string
  version: string
  label: string
  text: string
  href: string
  cta: string
  newTab: string
  close: string
}

const listeners = new Set<() => void>()
// Fallback when storage is unavailable: closed until the next full page load.
const closedThisVisit = new Set<string>()

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  window.addEventListener("storage", listener)
  return () => {
    listeners.delete(listener)
    window.removeEventListener("storage", listener)
  }
}

// Storage can throw (private mode, blocked site data): the banner then just stays.
const readDismissed = (key: string) => {
  if (closedThisVisit.has(key)) return true
  try {
    return localStorage.getItem(key) !== null
  } catch {
    return false
  }
}

const saveDismissed = (key: string) => {
  try {
    localStorage.setItem(key, new Date().toISOString())
  } catch {
    // Storage blocked: closedThisVisit still hides it.
  }
}

export const PassBannerView = ({
  id,
  version,
  label,
  text,
  href,
  cta,
  newTab,
  close,
}: PassBannerViewProps) => {
  const key = passBannerStorageKey(version)
  const dismissed = useSyncExternalStore(
    subscribe,
    () => readDismissed(key),
    () => false
  )

  if (dismissed) return null

  const dismiss = () => {
    closedThisVisit.add(key)
    saveDismissed(key)
    listeners.forEach((listener) => listener())
    // The banner leaves the page: keep keyboard users in the main content.
    document.getElementById("main-content")?.focus({ preventScroll: true })
  }

  return (
    <aside
      id={id}
      aria-label={label}
      data-testid="pass-patrimoine-banner"
      // The inline script may have set `hidden` before hydration.
      suppressHydrationWarning
      className="border-primary/30 bg-ed-bg-deep/80 border-y backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-7xl items-start gap-3 px-4 py-4 md:items-center md:gap-5 md:px-6">
        <Ticket className="text-primary mt-0.5 size-5 shrink-0 md:mt-0" aria-hidden="true" />
        <div className="flex min-w-0 flex-1 flex-col gap-3 md:flex-row md:items-center md:gap-6">
          <p className="text-foreground font-serif text-base leading-snug md:flex-1">{text}</p>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary border-primary hover:bg-primary/10 focus-visible:ring-primary/60 inline-flex min-h-11 shrink-0 items-center gap-2 self-start border px-4 font-sans text-xs font-semibold tracking-[0.14em] uppercase transition-colors focus-visible:ring-2 focus-visible:outline-none md:self-auto"
          >
            {cta}
            <ExternalLink className="size-4" aria-hidden="true" />
            <span className="sr-only">{newTab}</span>
          </a>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label={close}
          className="text-ed-bone hover:text-foreground focus-visible:ring-primary/60 -mt-2 -mr-2 inline-flex size-11 shrink-0 items-center justify-center transition-colors focus-visible:ring-2 focus-visible:outline-none md:mt-0"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>
    </aside>
  )
}
