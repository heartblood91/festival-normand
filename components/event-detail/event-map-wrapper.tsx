"use client"

import dynamic from "next/dynamic"

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
}

const EventMapWrapper = ({ latitude, longitude, title }: EventMapWrapperProps) => {
  return <EventMap latitude={latitude} longitude={longitude} title={title} />
}

export { EventMapWrapper }
