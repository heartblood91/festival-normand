"use client"

import { useEffect, useRef } from "react"

// Cinematic hero background. Pauses when prefers-reduced-motion is set (RGAA 13.8).
const HeroVideoBg = () => {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const mql = window.matchMedia("(prefers-reduced-motion: reduce)")
    const apply = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) video.pause()
      else void video.play().catch(() => {})
    }

    apply(mql)
    mql.addEventListener("change", apply)
    return () => mql.removeEventListener("change", apply)
  }, [])

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      poster="/images/hero-poster.jpg"
      className="absolute inset-0 h-full w-full object-cover [filter:saturate(0.85)_brightness(0.5)]"
      aria-hidden="true"
      tabIndex={-1}
    >
      <source src="/videos/hero.mp4" type="video/mp4" />
    </video>
  )
}

export { HeroVideoBg }
