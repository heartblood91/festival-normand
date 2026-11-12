"use client"

import { useEffect, useRef, useCallback } from "react"
import { useLocale, useTranslations } from "next-intl"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { mapboxLocale } from "@/lib/map/mapbox-locale"
import { formatEventDate } from "@/lib/utils/format-date"
import type { MapEventItem } from "@/lib/queries/events"
import { DEFAULT_EVENT_IMAGE } from "@/lib/events/default-image"
import { isInNormandyBounds } from "@/lib/geo/normandy"

type EventsMapProps = {
  events: MapEventItem[]
}

const escapeHtml = (str: string): string =>
  str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

/** Rasterizes each marker image once; markers that fail to load fall back to a pin. */
const loadMarkers = async (map: mapboxgl.Map, urls: string[]): Promise<Set<string>> => {
  const loaded = await Promise.all(
    urls.map(async (url) => {
      try {
        const img = new Image(64, 80)
        img.crossOrigin = "anonymous"
        img.src = url
        await img.decode()
        if (!map.hasImage(url)) map.addImage(url, img, { pixelRatio: 2 })
        return url
      } catch {
        return null
      }
    })
  )
  return new Set(loaded.filter((url): url is string => url !== null))
}

const EventsMap = ({ events }: EventsMapProps) => {
  const locale = useLocale()
  const t = useTranslations()
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)

  const validEvents = events.filter(
    (e) =>
      e.latitude !== null &&
      e.longitude !== null &&
      (e.latitude !== 0 || e.longitude !== 0) &&
      isInNormandyBounds(e)
  )

  const initMap = useCallback(() => {
    if (!mapContainer.current || mapRef.current) return

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ""

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [-0.5, 48.8],
      zoom: 7,
      scrollZoom: true,
      attributionControl: true,
      locale: mapboxLocale(locale),
    })

    map.addControl(new mapboxgl.NavigationControl(), "top-right")

    map.on("load", async () => {
      const markers = await loadMarkers(map, [
        ...new Set(validEvents.flatMap((event) => (event.pin.marker ? [event.pin.marker] : []))),
      ])
      // The component may have unmounted while the images loaded.
      if (mapRef.current !== map) return
      const geojson: GeoJSON.FeatureCollection = {
        type: "FeatureCollection",
        features: validEvents.map((event) => ({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [event.longitude!, event.latitude!],
          },
          properties: {
            id: event.id,
            title: event.title,
            slug: event.slug,
            category: event.category,
            categoryLabel: t(`categories.${event.category}`),
            city: event.city || "",
            dateStart: event.dateStart ? formatEventDate(event.dateStart, locale) : "",
            timeStart: event.timeStart?.slice(0, 5) || "",
            coverImage: event.coverImage || DEFAULT_EVENT_IMAGE,
            pinColor: event.pin.color,
            ...(event.pin.marker && markers.has(event.pin.marker)
              ? { pinMarker: event.pin.marker }
              : {}),
          },
        })),
      }

      map.addSource("events", {
        type: "geojson",
        data: geojson,
        cluster: true,
        clusterMaxZoom: 12,
        clusterRadius: 60,
        generateId: true,
      })

      // Cluster circles — amber with count
      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "events",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": "#f59e0b",
          "circle-radius": ["step", ["get", "point_count"], 22, 10, 28, 50, 36, 100, 44],
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 3,
          "circle-opacity": 0.9,
        },
      })

      // Cluster count text
      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "events",
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["get", "point_count_abbreviated"],
          "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
          "text-size": 14,
        },
        paint: {
          "text-color": "#0f172a",
        },
      })

      // Individual markers — pins in the colour of the event's theme (amber by default)
      // Amber glow under the hovered pin (feature-state, no animation)
      map.addLayer({
        id: "unclustered-halo",
        type: "circle",
        source: "events",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": "#f59e0b",
          "circle-radius": 20,
          "circle-blur": 0.8,
          "circle-opacity": ["case", ["boolean", ["feature-state", "hover"], false], 0.6, 0],
        },
      })

      map.addLayer({
        id: "unclustered-point",
        type: "circle",
        source: "events",
        filter: ["all", ["!", ["has", "point_count"]], ["!", ["has", "pinMarker"]]],
        paint: {
          "circle-color": ["get", "pinColor"],
          "circle-radius": ["case", ["boolean", ["feature-state", "hover"], false], 11, 8],
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 2.5,
          "circle-opacity": 0.9,
        },
      })

      // Themed events with a custom marker image (e.g. Millennium)
      map.addLayer({
        id: "themed-point",
        type: "symbol",
        source: "events",
        filter: ["all", ["!", ["has", "point_count"]], ["has", "pinMarker"]],
        layout: {
          "icon-image": ["get", "pinMarker"],
          "icon-anchor": "bottom",
          "icon-allow-overlap": true,
        },
      })

      // Fit bounds to all events
      if (validEvents.length > 0) {
        const bounds = new mapboxgl.LngLatBounds()
        validEvents.forEach((e) => bounds.extend([e.longitude!, e.latitude!]))
        map.fitBounds(bounds, { padding: 60, maxZoom: 12 })
      }

      // Click on cluster → zoom in
      map.on("click", "clusters", (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ["clusters"] })
        if (!features.length) return
        const clusterId = features[0].properties?.cluster_id
        const source = map.getSource("events") as mapboxgl.GeoJSONSource
        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err || zoom === null || zoom === undefined) return
          map.easeTo({
            center: (features[0].geometry as GeoJSON.Point).coordinates as [number, number],
            zoom,
          })
        })
      })

      // Click on individual marker → rich popup
      const openPopup = (e: mapboxgl.MapLayerMouseEvent) => {
        const feature = e.features?.[0]
        if (!feature) return

        const props = feature.properties as Record<string, string>
        const coords = (feature.geometry as GeoJSON.Point).coordinates.slice() as [number, number]

        const safeTitle = escapeHtml(props.title)
        const safeCat = escapeHtml(props.categoryLabel)
        const safeCity = escapeHtml(props.city)
        const safeSlug = escapeHtml(props.slug)
        const imageHtml = `<img src="${escapeHtml(props.coverImage)}" alt="${safeTitle}" style="width:100%;height:120px;object-fit:cover;border-radius:8px 8px 0 0;" />`
        const viewLabel = locale === "en" ? "View event →" : "Voir l&#39;événement →"

        new mapboxgl.Popup({
          offset: 15,
          closeButton: true,
          maxWidth: "280px",
          className: "pel-popup",
        })
          .setLngLat(coords)
          .setHTML(
            `
            <div style="background:#1e293b;border-radius:8px;overflow:hidden;color:#e2e8f0;font-family:Inter,sans-serif;">
              ${imageHtml}
              <div style="padding:12px;">
                <h3 style="font-size:14px;font-weight:700;margin:0 0 6px;line-height:1.3;">${safeTitle}</h3>
                <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
                  <span style="background:#f59e0b22;color:#f59e0b;font-size:11px;padding:2px 8px;border-radius:12px;font-weight:600;">${safeCat}</span>
                </div>
                ${safeCity ? `<p style="font-size:12px;color:#94a3b8;margin:4px 0 0;">📍 ${safeCity}</p>` : ""}
                ${props.dateStart ? `<p style="font-size:12px;color:#94a3b8;margin:2px 0 0;">📅 ${escapeHtml(props.dateStart)}${props.timeStart ? ` · ${escapeHtml(props.timeStart)}` : ""}</p>` : ""}
                <a href="/${locale}/evenement/${safeSlug}" style="display:inline-block;margin-top:8px;font-size:12px;color:#f59e0b;text-decoration:none;font-weight:600;">
                  ${viewLabel}
                </a>
              </div>
            </div>
          `
          )
          .addTo(map)
      }
      map.on("click", "unclustered-point", openPopup)
      map.on("click", "themed-point", openPopup)

      // Cursor pointer on hover
      map.on("mouseenter", "clusters", () => {
        map.getCanvas().style.cursor = "pointer"
      })
      map.on("mouseleave", "clusters", () => {
        map.getCanvas().style.cursor = ""
      })
      let hovered: string | number | undefined
      const setHover = (id: string | number | undefined) => {
        if (hovered !== undefined)
          map.setFeatureState({ source: "events", id: hovered }, { hover: false })
        hovered = id
        if (id !== undefined) map.setFeatureState({ source: "events", id }, { hover: true })
      }
      for (const layer of ["unclustered-point", "themed-point"]) {
        map.on("mousemove", layer, (e) => {
          map.getCanvas().style.cursor = "pointer"
          setHover(e.features?.[0]?.id)
        })
        map.on("mouseleave", layer, () => {
          map.getCanvas().style.cursor = ""
          setHover(undefined)
        })
      }
    })

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [validEvents, locale, t])

  useEffect(() => {
    const cleanup = initMap()
    return cleanup
  }, [initMap])

  if (validEvents.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center rounded-xl border border-white/10 bg-white/5">
        <p className="text-muted-foreground">{t("a11y.noGpsEvents")}</p>
      </div>
    )
  }

  return (
    <>
      <div
        ref={mapContainer}
        className="h-[500px] w-full rounded-xl md:h-[650px]"
        role="region"
        aria-label={t("a11y.mapDescription")}
      />
      <p className="sr-only">{t("a11y.mapSrOnly")}</p>
    </>
  )
}

export { EventsMap }
