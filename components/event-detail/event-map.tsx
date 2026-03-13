"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

type EventMapProps = {
  latitude: number
  longitude: number
  title: string
}

const EventMap = ({ latitude, longitude, title }: EventMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const map = L.map(mapRef.current, {
      center: [latitude, longitude],
      zoom: 15,
      scrollWheelZoom: false,
    })

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)

    const icon = L.divIcon({
      className: "custom-marker",
      html: `<div style="width:24px;height:24px;background:#f59e0b;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    })

    L.marker([latitude, longitude], { icon })
      .addTo(map)
      .bindPopup(title)

    mapInstanceRef.current = map

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [latitude, longitude, title])

  return (
    <div
      ref={mapRef}
      className="h-[300px] w-full rounded-xl md:h-[400px]"
      role="img"
      aria-label={`Carte montrant l'emplacement de ${title}`}
    />
  )
}

export { EventMap }
