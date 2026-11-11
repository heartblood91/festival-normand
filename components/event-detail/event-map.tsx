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
  /** Numbered suggestions, same order as the list under the map */
  suggestions: Neighbour[]
  /** Other sites, shown as small dots for the regional picture */
  neighbours: Neighbour[]
  labels: { youAreHere: string; map: string }
}

// Titles come from editors and Tourinsoft: never inject them as raw HTML.
const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")

const popupHtml = (rawTitle: string, rawBody: string, href?: string) => {
  const title = escapeHtml(rawTitle)
  const body = escapeHtml(rawBody)
  const link = href
    ? `<a href="${href}" style="display:block;margin-top:6px;color:#f59e0b;font-weight:600;text-decoration:none;">${body} →</a>`
    : `<p style="margin:0;color:#94a3b8;font-size:12px;">${body}</p>`
  // Self-contained dark background to match the rest of the site;
  // globals.css forces .mapboxgl-popup-content to bg-transparent.
  return `<div style="background:#1e293b;border-radius:8px;padding:10px 12px;min-width:180px;font-family:Inter,sans-serif;color:#e2e8f0;"><p style="margin:0 0 4px;font-size:14px;font-weight:700;line-height:1.3;">${title}</p>${link}</div>`
}

const buildMarker = (name: string, color: string, size: number, ring: string, label?: string) => {
  // The wrapper is the hit area (globals.css: 24px, 44px on touch screens); the dot keeps its size.
  const el = document.createElement("div")
  el.className = "pel-map-target"
  // Mapbox keeps an existing aria-label instead of its generic "Map marker".
  el.setAttribute("aria-label", label ? `${label}. ${name}` : name)
  const dot = document.createElement("span")
  dot.style.cssText = `width:${size}px;height:${size}px;background:${color};border:${size > 12 ? 3 : 1}px solid ${ring};border-radius:50%;box-shadow:0 2px 12px rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;color:#0f172a;font:700 12px Inter,sans-serif;`
  if (label) dot.textContent = label
  el.append(dot)
  return el
}

const EventMap = ({
  latitude,
  longitude,
  title,
  locale,
  suggestions,
  neighbours,
  labels,
}: EventMapProps) => {
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

    const addNeighbour = (n: Neighbour, el: HTMLDivElement) => {
      const href = `/${locale}/evenement/${n.slug}`
      el.addEventListener("click", (e) => {
        e.stopPropagation()
        window.location.href = href
      })
      new mapboxgl.Marker({ element: el })
        .setLngLat([n.longitude, n.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 18, closeButton: false }).setHTML(
            popupHtml(n.title, `${n.city} · ${n.distanceKm} km`, href)
          )
        )
        .addTo(map)
    }

    // Regional picture first, so numbered suggestions and the event stay on top
    const suggested = new Set(suggestions.map((n) => n.slug))
    neighbours
      .filter((n) => !suggested.has(n.slug))
      .forEach((n) =>
        addNeighbour(n, buildMarker(n.title, "rgba(245,158,11,0.55)", 10, "rgba(15,23,42,0.8)"))
      )
    suggestions.forEach((n, index) =>
      addNeighbour(
        n,
        buildMarker(n.title, "#f59e0b", 24, "rgba(255,255,255,0.9)", String(index + 1))
      )
    )

    // Current event — bigger red marker
    new mapboxgl.Marker({
      element: buildMarker(`${title} — ${labels.youAreHere}`, "#ef4444", 30, "#fff"),
    })
      .setLngLat([longitude, latitude])
      .setPopup(
        new mapboxgl.Popup({ offset: 22, closeButton: false }).setHTML(
          popupHtml(title, labels.youAreHere)
        )
      )
      .addTo(map)

    // Frame the event and its suggestions; the rest of the region stays reachable by zooming out
    if (suggestions.length > 0) {
      const bounds = new mapboxgl.LngLatBounds([longitude, latitude], [longitude, latitude])
      suggestions.forEach((n) => bounds.extend([n.longitude, n.latitude]))
      map.fitBounds(bounds, { padding: 50, maxZoom: 12, duration: 0 })
    }

    mapInstanceRef.current = map

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [latitude, longitude, title, locale, suggestions, neighbours, labels])

  return (
    <div
      ref={mapRef}
      className="h-[300px] w-full rounded-xl md:h-[400px]"
      role="region"
      aria-label={labels.map}
    />
  )
}

export { EventMap }
