"use client"

import { useEffect, useRef } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"

type EventMapProps = {
  latitude: number
  longitude: number
  title: string
}

const EventMap = ({ latitude, longitude, title }: EventMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<mapboxgl.Map | null>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ""

    const map = new mapboxgl.Map({
      container: mapRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [longitude, latitude],
      zoom: 14,
      scrollZoom: false,
      attributionControl: true,
    })

    map.addControl(new mapboxgl.NavigationControl(), "top-right")

    // Custom amber marker
    const markerEl = document.createElement("div")
    markerEl.style.cssText = "width:28px;height:28px;background:#f59e0b;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 12px rgba(0,0,0,0.4);cursor:pointer;"

    new mapboxgl.Marker({ element: markerEl })
      .setLngLat([longitude, latitude])
      .setPopup(
        new mapboxgl.Popup({ offset: 20, closeButton: false })
          .setHTML(`<p style="font-weight:600;margin:0;padding:4px 8px;">${title}</p>`)
      )
      .addTo(map)

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
