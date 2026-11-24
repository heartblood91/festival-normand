"use client"

import { useEffect, useRef, useState } from "react"
import { useLocale } from "next-intl"
import { EventsMapWrapper } from "@/components/events/events-map-wrapper"
import { loadHomeMapEvents } from "@/lib/actions/home-map"
import type { MapEventItem } from "@/lib/queries/events"

const MAP_CLASS = "aspect-[4/3] w-full rounded-sm md:aspect-[16/10]"

/** Real Mapbox map of the edition's places; map and places load only when it nears the viewport. */
const HomeMap = () => {
  const locale = useLocale()
  const placeholder = useRef<HTMLDivElement>(null)
  const [events, setEvents] = useState<MapEventItem[] | null>(null)

  useEffect(() => {
    const node = placeholder.current
    if (!node) return
    let cancelled = false
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        observer.disconnect()
        loadHomeMapEvents(locale)
          .catch(() => [])
          .then((loaded) => {
            if (!cancelled) setEvents(loaded)
          })
      },
      { rootMargin: "400px 0px" }
    )
    observer.observe(node)
    return () => {
      cancelled = true
      observer.disconnect()
    }
  }, [locale])

  return (
    <div className="border-primary/25 overflow-hidden rounded-sm border" data-testid="home-map">
      {events ? (
        <EventsMapWrapper
          events={events}
          showWholeNormandy
          cooperativeGestures
          className={MAP_CLASS}
        />
      ) : (
        <div ref={placeholder} className={`${MAP_CLASS} bg-white/5`} />
      )}
    </div>
  )
}

export { HomeMap }
