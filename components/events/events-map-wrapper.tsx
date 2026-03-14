"use client"

import dynamic from "next/dynamic"
import "mapbox-gl/dist/mapbox-gl.css"
import type { MapEventItem } from "@/lib/queries/events"

const EventsMap = dynamic(() => import("./events-map").then((mod) => ({ default: mod.EventsMap })), {
  ssr: false,
  loading: () => <div className="h-96 w-full rounded-lg bg-white/5 md:h-[600px]" />,
})

type EventsMapWrapperProps = {
  events: MapEventItem[]
}

const EventsMapWrapper = ({ events }: EventsMapWrapperProps) => {
  return <EventsMap events={events} />
}

export { EventsMapWrapper }
