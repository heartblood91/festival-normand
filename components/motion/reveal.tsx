"use client"

import { useEffect, useRef, type ReactNode } from "react"

type RevealProps = { children: ReactNode }

/**
 * Fades its section in when it scrolls into view. Content stays visible without JavaScript,
 * under reduced motion, and when it is already on screen at load (globals.css: .ed-reveal).
 */
const Reveal = ({ children }: RevealProps) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (
      !element ||
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      element.getBoundingClientRect().top < window.innerHeight
    )
      return
    element.dataset.reveal = "hidden"
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        element.dataset.reveal = "shown"
        observer.disconnect()
      },
      { rootMargin: "0px 0px -8% 0px" }
    )
    observer.observe(element)
    // Keyboard focus and in-page search can land in a section before it is scrolled to.
    const show = () => {
      element.dataset.reveal = "shown"
      observer.disconnect()
    }
    element.addEventListener("focusin", show)
    return () => {
      observer.disconnect()
      element.removeEventListener("focusin", show)
    }
  }, [])

  return (
    <div ref={ref} className="ed-reveal" data-reveal="static">
      {children}
    </div>
  )
}

export { Reveal }
