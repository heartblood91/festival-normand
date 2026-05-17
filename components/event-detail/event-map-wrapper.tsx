"use client"

import dynamic from "next/dynamic"
import type { NeighbourEvent } from "@/lib/queries/events"

const EventMap = dynamic(
  () => import("@/components/event-detail/event-map").then((m) => ({ default: m.EventMap })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] w-full animate-pulse rounded-xl bg-white/5 md:h-[400px]" />
    ),
  }
)

type EventMapWrapperProps = {
  latitude: number
  longitude: number
  title: string
  locale: string
  neighbours: NeighbourEvent[]
}

const EventMapWrapper = ({ latitude, longitude, title, locale, neighbours }: EventMapWrapperProps) => {
  return (
    <EventMap
      latitude={latitude}
      longitude={longitude}
      title={title}
      locale={locale}
      neighbours={neighbours}
    />
  )
}

export { EventMapWrapper }
