"use client"

import { useEffect, useRef } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"

type Neighbour = {
  slug: string
  title: string
  latitude: number
  longitude: number
  city: string
  distanceKm: number
}

type EventMapProps = {
  latitude: number
  longitude: number
  title: string
  locale: string
  neighbours: Neighbour[]
}

const popupHtml = (title: string, body: string, href?: string) => {
  const link = href
    ? `<a href="${href}" style="display:block;margin-top:6px;color:#f59e0b;font-weight:600;text-decoration:none;">${body} →</a>`
    : `<p style="margin:0;color:#94a3b8;font-size:12px;">${body}</p>`
  // Self-contained dark background to match the rest of the site;
  // globals.css forces .mapboxgl-popup-content to bg-transparent.
  return `<div style="background:#1e293b;border-radius:8px;padding:10px 12px;min-width:180px;font-family:Inter,sans-serif;color:#e2e8f0;"><p style="margin:0 0 4px;font-size:14px;font-weight:700;line-height:1.3;">${title}</p>${link}</div>`
}

const buildMarker = (color: string, size: number, ring: string) => {
  const el = document.createElement("div")
  el.style.cssText = `width:${size}px;height:${size}px;background:${color};border:3px solid ${ring};border-radius:50%;box-shadow:0 2px 12px rgba(0,0,0,0.5);cursor:pointer;`
  return el
}

const EventMap = ({ latitude, longitude, title, locale, neighbours }: EventMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<mapboxgl.Map | null>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ""

    const map = new mapboxgl.Map({
      container: mapRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [longitude, latitude],
      zoom: 11,
      scrollZoom: false,
      attributionControl: true,
    })

    map.addControl(new mapboxgl.NavigationControl(), "top-right")

    // Current event — bigger red marker on top
    new mapboxgl.Marker({ element: buildMarker("#ef4444", 30, "#fff") })
      .setLngLat([longitude, latitude])
      .setPopup(new mapboxgl.Popup({ offset: 22, closeButton: false }).setHTML(popupHtml(title, "Vous y êtes")))
      .addTo(map)

    // Neighbour events — amber markers, clickable to navigate
    neighbours.forEach((n) => {
      const el = buildMarker("#f59e0b", 22, "rgba(255,255,255,0.85)")
      const href = `/${locale}/evenement/${n.slug}`
      const cta = `${n.city} · ${n.distanceKm} km`
      el.addEventListener("click", (e) => {
        e.stopPropagation()
        window.location.href = href
      })
      new mapboxgl.Marker({ element: el })
        .setLngLat([n.longitude, n.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 18, closeButton: false }).setHTML(popupHtml(n.title, cta, href))
        )
        .addTo(map)
    })

    // Fit map to all markers if we have neighbours, otherwise stay zoomed on the event
    if (neighbours.length > 0) {
      const bounds = new mapboxgl.LngLatBounds([longitude, latitude], [longitude, latitude])
      neighbours.forEach((n) => bounds.extend([n.longitude, n.latitude]))
      map.fitBounds(bounds, { padding: 60, maxZoom: 12, duration: 0 })
    }

    mapInstanceRef.current = map

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [latitude, longitude, title, locale, neighbours])

  return (
    <div
      ref={mapRef}
      className="h-[300px] w-full rounded-xl md:h-[400px]"
      role="img"
      aria-label={`Carte montrant ${title} et ${neighbours.length} événement(s) à proximité`}
    />
  )
}

export { EventMap }
