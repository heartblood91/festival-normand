"use client"

import { useState, useCallback } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

type PhotoCarouselProps = {
  images: string[]
  alt: string
}

const PhotoCarousel = ({ images, alt }: PhotoCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const goTo = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }, [images.length])

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }, [images.length])

  if (images.length === 0) return null

  if (images.length === 1) {
    return (
      <div className="overflow-hidden rounded-xl">
        <img
          src={images[0]}
          alt={alt}
          className="aspect-[16/9] w-full object-cover"
        />
      </div>
    )
  }

  return (
    <div
      className="relative overflow-hidden rounded-xl"
      role="region"
      aria-label="Galerie photos"
      aria-roledescription="carousel"
    >
      {/* Current image with scroll snap support */}
      <div className="relative aspect-[16/9] w-full snap-center">
        <img
          src={images[currentIndex]}
          alt={`${alt} - Photo ${currentIndex + 1} sur ${images.length}`}
          className="h-full w-full object-cover"
          key={currentIndex}
        />
      </div>

      {/* Previous button */}
      <button
        onClick={goPrev}
        className="absolute left-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-background/80 backdrop-blur-sm transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        aria-label="Photo précédente"
      >
        <ChevronLeft className="size-5" aria-hidden="true" />
      </button>

      {/* Next button */}
      <button
        onClick={goNext}
        className="absolute right-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-background/80 backdrop-blur-sm transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        aria-label="Photo suivante"
      >
        <ChevronRight className="size-5" aria-hidden="true" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2" role="tablist">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goTo(index)}
            role="tab"
            aria-selected={index === currentIndex}
            aria-label={`Photo ${index + 1}`}
            className={cn(
              "size-2.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
              index === currentIndex
                ? "scale-110 bg-primary"
                : "bg-white/40 hover:bg-white/60"
            )}
          />
        ))}
      </div>
    </div>
  )
}

export { PhotoCarousel }
