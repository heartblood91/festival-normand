"use client"

import { useEffect, useRef } from "react"

const HeroVideo = () => {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const mediaQueryList = window.matchMedia("(prefers-reduced-motion: reduce)")

    const handleMotionPreference = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) {
        video.pause()
      } else {
        video.play()
      }
    }

    handleMotionPreference(mediaQueryList)
    mediaQueryList.addEventListener("change", handleMotionPreference)

    return () => mediaQueryList.removeEventListener("change", handleMotionPreference)
  }, [])

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      poster="/images/hero-poster.png"
      className="absolute inset-0 -z-10 h-full w-full object-cover"
      aria-hidden="true"
    >
      <source src="/videos/hero.mp4" type="video/mp4" />
    </video>
  )
}

export { HeroVideo }
