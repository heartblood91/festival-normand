"use client"

import dynamic from "next/dynamic"
import "mapbox-gl/dist/mapbox-gl.css"
import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

const EventsMap = dynamic(
  () => import("./events-map").then((mod) => ({ default: mod.EventsMap })),
  {
    ssr: false,
    loading: () => <div className="size-full bg-white/5" />,
  }
)

type EventsMapWrapperProps = ComponentProps<typeof EventsMap>

// The frame takes the requested size, so the placeholder and the map share it and the
// page does not jump when the Mapbox chunk arrives.
const EventsMapWrapper = ({
  className = "h-[500px] w-full rounded-xl md:h-[650px]",
  ...props
}: EventsMapWrapperProps) => (
  <div className={cn("overflow-hidden", className)}>
    <EventsMap {...props} className="size-full" />
  </div>
)

export { EventsMapWrapper }
