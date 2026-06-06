"use client"

import { useState, useCallback } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export type CarouselPhoto = {
  url: string
  credit?: string | null
  title?: string | null
}

type PhotoCarouselProps = {
  photos: CarouselPhoto[]
  alt: string
}

// Attribution must be shown whenever a photo is displayed (Tourinsoft credits,
// rights). Rendered as a figcaption so it stays associated with the figure.
const PhotoCredit = ({ credit }: { credit?: string | null }) => {
  if (!credit) return null
  return (
    <figcaption className="bg-background/70 text-muted-foreground absolute right-2 bottom-2 rounded px-2 py-0.5 text-xs backdrop-blur-sm">
      © {credit}
    </figcaption>
  )
}

const PhotoCarousel = ({ photos, alt }: PhotoCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const goTo = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1))
  }, [photos.length])

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1))
  }, [photos.length])

  if (photos.length === 0) return null

  if (photos.length === 1) {
    return (
      <figure className="relative m-0 aspect-[16/9] w-full overflow-hidden rounded-xl">
        <Image
          src={photos[0].url}
          alt={alt}
          fill
          sizes="(max-width: 1024px) 100vw, 66vw"
          className="object-cover"
          priority
        />
        <PhotoCredit credit={photos[0].credit} />
      </figure>
    )
  }

  return (
    <figure
      className="relative m-0 overflow-hidden rounded-xl"
      role="region"
      aria-label="Galerie photos"
      aria-roledescription="carousel"
    >
      {/* Current image with scroll snap support */}
      <div className="relative aspect-[16/9] w-full snap-center">
        <Image
          src={photos[currentIndex].url}
          alt={`${alt} - Photo ${currentIndex + 1} sur ${photos.length}`}
          fill
          sizes="(max-width: 1024px) 100vw, 66vw"
          className="object-cover"
          key={currentIndex}
          priority={currentIndex === 0}
        />
      </div>

      {/* Previous button */}
      <button
        onClick={goPrev}
        className="bg-background/80 hover:bg-background focus-visible:ring-primary/50 absolute top-1/2 left-3 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 backdrop-blur-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
        aria-label="Photo précédente"
      >
        <ChevronLeft className="size-5" aria-hidden="true" />
      </button>

      {/* Next button */}
      <button
        onClick={goNext}
        className="bg-background/80 hover:bg-background focus-visible:ring-primary/50 absolute top-1/2 right-3 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 backdrop-blur-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
        aria-label="Photo suivante"
      >
        <ChevronRight className="size-5" aria-hidden="true" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2" role="tablist">
        {photos.map((_, index) => (
          <button
            key={index}
            onClick={() => goTo(index)}
            role="tab"
            aria-selected={index === currentIndex}
            aria-label={`Photo ${index + 1}`}
            className={cn(
              "focus-visible:ring-primary/50 flex size-6 items-center justify-center rounded-full transition-all focus-visible:ring-2 focus-visible:outline-none",
              "before:block before:size-2.5 before:rounded-full before:transition-all",
              index === currentIndex
                ? "before:bg-primary before:scale-110"
                : "before:bg-white/40 hover:before:bg-white/60"
            )}
          />
        ))}
      </div>

      <PhotoCredit credit={photos[currentIndex].credit} />
    </figure>
  )
}

export { PhotoCarousel }
