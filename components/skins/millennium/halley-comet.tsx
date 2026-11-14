"use client"

import { useEffect, useState } from "react"

const CODE = "1066"
const FLIGHT_MS = 2600

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))

/**
 * Easter egg: typing 1066 outside a form field sends Halley's comet, seen over
 * England that year, across the screen. Decorative only, skipped with reduced motion.
 */
export const HalleyComet = () => {
  const [flying, setFlying] = useState(false)

  useEffect(() => {
    let typed = ""
    const onKey = (event: KeyboardEvent) => {
      if (isTyping(event.target) || event.metaKey || event.ctrlKey || event.altKey) return
      typed = (typed + event.key).slice(-CODE.length)
      if (typed !== CODE) return
      typed = ""
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
      setFlying(true)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  useEffect(() => {
    if (!flying) return
    const timer = window.setTimeout(() => setFlying(false), FLIGHT_MS)
    return () => window.clearTimeout(timer)
  }, [flying])

  return flying ? <span className="millennium-halley" aria-hidden="true" /> : null
}
