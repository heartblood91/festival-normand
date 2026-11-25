"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

export const COMET_CODE = "1066"
const FLIGHT_MS = 3400

/** Keys typed in a form field or an editable region never count towards the code. */
export const isTypingTarget = (target: EventTarget | null) => {
  if (!target || typeof (target as Element).closest !== "function") return false
  const element = target as HTMLElement
  return (
    element.isContentEditable ||
    element.closest("input, textarea, select, [contenteditable]:not([contenteditable='false'])") !==
      null
  )
}

/** Last keys typed, capped to the code length; "" once the code is complete. */
export const nextCodeBuffer = (buffer: string, key: string) =>
  key.length === 1 ? (buffer + key).slice(-COMET_CODE.length) : ""

// Halley's comet as embroidered in scene 32 of the Bayeux Tapestry: a ringed star
// with long wool streamers, in the tapestry's ochre, madder red and sage.
const TapestryComet = () => (
  <svg viewBox="0 0 220 72" fill="none" stroke="#26324d" strokeWidth="1.3">
    <path
      d="M176 31 C140 19 98 12 30 5 C84 19 128 27 172 36 Z"
      fill="#c99a45"
      strokeLinejoin="round"
    />
    <path
      d="M173 34 C128 30 76 32 6 35 C76 39 128 40 173 40 Z"
      fill="#9c3b2b"
      strokeLinejoin="round"
    />
    <path
      d="M176 42 C140 51 98 59 32 67 C86 53 128 46 172 38 Z"
      fill="#6f7d58"
      strokeLinejoin="round"
    />
    <g stroke="#f1e6cf" strokeWidth="0.8" strokeDasharray="2.5 2.5" strokeOpacity="0.75">
      <path d="M168 33 C130 24 96 17 52 11" />
      <path d="M168 37 C120 36 70 36 22 35" />
      <path d="M168 41 C130 48 96 55 54 61" />
    </g>
    <g stroke="#c99a45" strokeWidth="2" strokeLinecap="round">
      <path d="M186 17 V12 M186 55 V60 M205 36 H210 M199 23 L203 19 M199 49 L203 53 M173 23 L169 19 M173 49 L169 53" />
    </g>
    <circle cx="186" cy="36" r="13" fill="#d9cbaf" />
    <circle cx="186" cy="36" r="8" fill="#c99a45" />
    <circle cx="186" cy="36" r="3.5" fill="#9c3b2b" />
  </svg>
)

/**
 * Easter egg: typing 1066 outside a form field sends Halley's comet, seen over
 * England that spring, across the screen once. Decorative only; nothing happens
 * with reduced motion.
 */
export const HalleyComet = () => {
  const [flying, setFlying] = useState(false)

  useEffect(() => {
    let buffer = ""
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || isTypingTarget(event.target)) {
        buffer = ""
        return
      }
      buffer = nextCodeBuffer(buffer, event.key)
      if (buffer !== COMET_CODE) return
      buffer = ""
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

  // Portalled to <body>: no ancestor transform or overflow can clip the flight.
  return flying
    ? createPortal(
        <div className="millennium-comet" aria-hidden="true" data-millennium-comet="">
          <TapestryComet />
        </div>,
        document.body
      )
    : null
}
