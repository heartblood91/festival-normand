"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Play } from "lucide-react"

const YOUTUBE_REGEX = /(?:youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]+)/

export const extractYouTubeId = (url: string): string | null =>
  url.match(YOUTUBE_REGEX)?.[1] ?? null

/**
 * Click-to-load YouTube player: nothing is requested from YouTube until the visitor
 * asks for the video, and the player keeps an explicit title (RGAA 2.2).
 */
export const YouTubeEmbed = ({ videoId, title }: { videoId: string; title?: string }) => {
  const t = useTranslations("video")
  const [playing, setPlaying] = useState(false)
  // Editors often paste the bare URL as link text: it makes a poor title.
  const name = title && !/^https?:\/\//.test(title) ? title : t("fallbackTitle")

  return (
    <div className="border-primary/20 my-7 aspect-video w-full overflow-hidden border">
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
          title={name}
          // The play button disappears: keep keyboard focus on the player.
          ref={(element) => element?.focus()}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="group focus-visible:ring-primary/60 flex h-full w-full flex-col items-center justify-center gap-4 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.18),transparent_70%)] p-6 text-center focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset"
        >
          <span className="bg-primary text-primary-foreground flex size-16 items-center justify-center rounded-full shadow-[0_0_40px_rgba(245,158,11,0.35)] transition-transform group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100">
            <Play className="size-7 translate-x-0.5" aria-hidden="true" />
          </span>
          <span className="text-foreground font-display text-lg italic">
            {t("play", { title: name })}
          </span>{" "}
          <span className="text-muted-foreground text-xs">{t("thirdParty")}</span>
        </button>
      )}
    </div>
  )
}
