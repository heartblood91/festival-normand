"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import type { PublicGalleryPhoto } from "@/lib/queries/gallery"

type GalleryGridProps = {
  photos: PublicGalleryPhoto[]
}

const controlClass =
  "border-primary/40 bg-ed-bg-deep/80 text-foreground hover:border-primary hover:text-primary focus-visible:ring-primary/60 inline-flex size-11 cursor-pointer items-center justify-center border backdrop-blur-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"

/** Photo grid; each photo opens in a modal dialog with previous/next navigation. */
export const GalleryGrid = ({ photos }: GalleryGridProps) => {
  const t = useTranslations("gallery")
  const ta = useTranslations("a11y")
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [current, setCurrent] = useState<number | null>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (current !== null && !dialog.open) dialog.showModal()
    if (current === null && dialog.open) dialog.close()
  }, [current])

  const step = (offset: number) =>
    setCurrent((index) =>
      index === null ? null : (index + offset + photos.length) % photos.length
    )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDialogElement>) => {
    if (e.key === "ArrowLeft") step(-1)
    if (e.key === "ArrowRight") step(1)
  }

  const photo = current === null ? null : photos[current]

  return (
    <>
      <ul className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3 lg:grid-cols-4">
        {photos.map((item, index) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => setCurrent(index)}
              aria-haspopup="dialog"
              className="group focus-visible:ring-primary relative block aspect-[4/3] w-full cursor-zoom-in overflow-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <Image
                src={item.url}
                alt={t("open", { alt: item.alt })}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        aria-label={t("dialogLabel")}
        onClose={() => setCurrent(null)}
        onKeyDown={handleKeyDown}
        onClick={(e) => {
          if (e.target === e.currentTarget) setCurrent(null)
        }}
        className="bg-ed-bg-deep/95 m-0 h-dvh max-h-none w-screen max-w-none p-0 backdrop:bg-black/80"
      >
        {photo && current !== null && (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between gap-3 p-3">
              <p
                className="text-ed-bone font-mono text-xs tracking-[0.16em] uppercase"
                aria-live="polite"
              >
                {t("position", { index: current + 1, total: photos.length })}
              </p>
              <button
                type="button"
                onClick={() => setCurrent(null)}
                className={controlClass}
                aria-label={t("close")}
                autoFocus
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
            <figure className="relative flex min-h-0 flex-1 flex-col items-center justify-center px-3 pb-4 md:px-20">
              <div className="relative h-full w-full">
                <Image
                  key={photo.id}
                  src={photo.url}
                  alt={photo.alt}
                  fill
                  sizes="100vw"
                  className="object-contain"
                />
              </div>
              <figcaption className="text-ed-bone mt-3 max-w-3xl text-center font-serif text-base">
                {photo.alt}
                {photo.credit && (
                  <span className="text-ed-mute ml-2 font-sans text-sm">© {photo.credit}</span>
                )}
              </figcaption>
              {photos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => step(-1)}
                    className={`${controlClass} absolute top-1/2 left-3 -translate-y-1/2`}
                    aria-label={ta("previousPhoto")}
                  >
                    <ChevronLeft className="size-6" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => step(1)}
                    className={`${controlClass} absolute top-1/2 right-3 -translate-y-1/2`}
                    aria-label={ta("nextPhoto")}
                  >
                    <ChevronRight className="size-6" aria-hidden="true" />
                  </button>
                </>
              )}
            </figure>
          </div>
        )}
      </dialog>
    </>
  )
}
