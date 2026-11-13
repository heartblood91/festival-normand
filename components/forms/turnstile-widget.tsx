"use client"

import { useEffect, useRef } from "react"

type TurnstileApi = {
  render: (container: HTMLElement, options: Record<string, unknown>) => string
  reset: (widgetId: string) => void
  remove: (widgetId: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

// Build-time NEXT_PUBLIC_TURNSTILE_SITE_KEY, shared with the server (next.config.ts).
const SITE_KEY = process.env.TURNSTILE_SITE_KEY
const SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"

/** True when forms must wait for the Turnstile check before they can be sent. */
export const TURNSTILE_ACTIVE = Boolean(SITE_KEY)

let scriptPromise: Promise<void> | null = null

const loadScript = () =>
  (scriptPromise ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script")
    script.src = SCRIPT_URL
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      scriptPromise = null
      reject(new Error("Turnstile script failed to load"))
    }
    document.head.appendChild(script)
  }))

type TurnstileWidgetProps = {
  locale: string
  /**
   * Changes each time the server spent the token (it is single-use). Pass null
   * when it did not, e.g. a validation error, so the visitor keeps their check.
   */
  resetKey?: unknown
  /**
   * Tells the form whether it may be sent: true once a token is held, or when
   * the check cannot run at all (blocked script, widget error), so the server
   * answers with an explanation instead of the button staying disabled.
   */
  onVerifiedChange: (verified: boolean) => void
}

/**
 * Cloudflare Turnstile anti-spam check, rendered inside a form so its hidden
 * token field is submitted with it. Renders nothing without a site key.
 */
export const TurnstileWidget = ({ locale, resetKey, onVerifiedChange }: TurnstileWidgetProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const onVerifiedChangeRef = useRef(onVerifiedChange)
  useEffect(() => {
    onVerifiedChangeRef.current = onVerifiedChange
  })

  useEffect(() => {
    if (!SITE_KEY) return
    let cancelled = false
    loadScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: SITE_KEY,
          language: locale,
          theme: "dark",
          size: "flexible",
          callback: () => onVerifiedChangeRef.current(true),
          "expired-callback": () => onVerifiedChangeRef.current(false),
          "error-callback": () => onVerifiedChangeRef.current(true),
        })
      })
      .catch(() => {
        if (!cancelled) onVerifiedChangeRef.current(true)
      })
    return () => {
      cancelled = true
      if (widgetIdRef.current) window.turnstile?.remove(widgetIdRef.current)
      widgetIdRef.current = null
    }
  }, [locale])

  useEffect(() => {
    if (!widgetIdRef.current || resetKey === null || resetKey === undefined) return
    onVerifiedChangeRef.current(false)
    window.turnstile?.reset(widgetIdRef.current)
  }, [resetKey])

  if (!SITE_KEY) return null
  return <div ref={containerRef} className="min-h-[65px]" />
}
