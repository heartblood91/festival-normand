"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"

const POSTER = "/images/hero-poster.jpg"
const MEDIA_CLASS =
  "absolute inset-0 h-full w-full object-cover [filter:saturate(0.85)_brightness(0.5)]"

type HeroVideoBgProps = {
  /** Null when no video is deployed: the still poster is shown instead of a 404 request. */
  src: string | null
}

// Cinematic hero background. Pauses when prefers-reduced-motion is set (RGAA 13.8).
const HeroVideoBg = ({ src }: HeroVideoBgProps) => {
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
  }, [src])

  if (!src) {
    return <Image src={POSTER} alt="" fill priority sizes="100vw" className={MEDIA_CLASS} />
  }

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      poster={POSTER}
      className={MEDIA_CLASS}
      aria-hidden="true"
      tabIndex={-1}
    >
      <source src={src} type="video/mp4" />
    </video>
  )
}

export { HeroVideoBg }
