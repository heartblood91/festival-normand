"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { MapPin, Loader2, AlertCircle, X } from "lucide-react"
import { cn } from "@/lib/utils"

const ERROR_AUTODISMISS_MS = 10_000
const FIRST_TIMEOUT_MS = 15_000
const RETRY_TIMEOUT_MS = 25_000
// Accept a position cached up to 5 minutes ago to dodge GPS warm-up failures
const POSITION_MAX_AGE_MS = 5 * 60_000

type GeoErrorKey = "geoNotSupported" | "geoDenied" | "geoUnavailable" | "geoTimeout" | "geoError"

const errorKeyForCode = (code: number): GeoErrorKey => {
  if (code === 1) return "geoDenied"
  if (code === 2) return "geoUnavailable"
  if (code === 3) return "geoTimeout"
  return "geoError"
}

const requestPositionWithRetry = (): Promise<GeolocationPosition> =>
  new Promise((resolve, reject) => {
    const tryOnce = (timeout: number, isRetry: boolean) => {
      navigator.geolocation.getCurrentPosition(
        resolve,
        (error) => {
          // Retry once on transient failures (timeout / position unavailable)
          // with a longer deadline. Permission denied is final.
          if (!isRetry && (error.code === 2 || error.code === 3)) {
            tryOnce(RETRY_TIMEOUT_MS, true)
            return
          }
          reject(error)
        },
        { enableHighAccuracy: false, timeout, maximumAge: POSITION_MAX_AGE_MS }
      )
    }
    tryOnce(FIRST_TIMEOUT_MS, false)
  })

const NearbyButton = () => {
  const t = useTranslations()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const isActive = searchParams.has("lat") && searchParams.has("lng")

  useEffect(
    () => () => {
      if (dismissTimer.current) clearTimeout(dismissTimer.current)
    },
    []
  )

  const showError = (key: GeoErrorKey) => {
    setErrorMessage(t(`filters.${key}`))
    if (dismissTimer.current) clearTimeout(dismissTimer.current)
    dismissTimer.current = setTimeout(() => setErrorMessage(null), ERROR_AUTODISMISS_MS)
  }

  const handleClick = async () => {
    setErrorMessage(null)

    if (isActive) {
      const params = new URLSearchParams(searchParams.toString())
      params.delete("lat")
      params.delete("lng")
      params.delete("page")
      router.push(`/evenements${params.toString() ? `?${params.toString()}` : ""}`)
      return
    }

    if (!navigator.geolocation) {
      showError("geoNotSupported")
      return
    }

    setIsLoading(true)
    try {
      const position = await requestPositionWithRetry()
      const params = new URLSearchParams(searchParams.toString())
      params.set("lat", position.coords.latitude.toFixed(4))
      params.set("lng", position.coords.longitude.toFixed(4))
      params.delete("page")
      router.push(`/evenements?${params.toString()}`)
    } catch (error) {
      const code = (error as GeolocationPositionError).code ?? 0
      showError(errorKeyForCode(code))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        className={cn(
          "focus-visible:ring-primary/50 inline-flex min-h-10 min-w-10 items-center gap-1.5 rounded-full border px-3 py-2 text-sm font-medium whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:outline-none",
          isActive
            ? "border-primary bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground border-white/10 bg-white/5 hover:bg-white/10",
          isLoading && "cursor-wait opacity-50"
        )}
        aria-label={t("filters.nearbyLabel")}
        aria-describedby={errorMessage ? "nearby-error" : undefined}
      >
        {isLoading ? <Loader2 className="size-4 animate-spin" /> : <MapPin className="size-4" />}
        <span className="hidden sm:inline">{t("filters.nearby")}</span>
      </button>

      {errorMessage && (
        <div
          id="nearby-error"
          role="alert"
          aria-live="assertive"
          className="absolute top-full left-0 z-20 mt-2 flex w-max max-w-xs items-start gap-2 rounded-lg border border-red-500/30 bg-red-950/95 px-3 py-2 text-sm text-red-100 shadow-lg backdrop-blur-md sm:max-w-sm"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-300" aria-hidden />
          <p className="flex-1 leading-snug">{errorMessage}</p>
          <button
            type="button"
            onClick={() => {
              setErrorMessage(null)
              if (dismissTimer.current) clearTimeout(dismissTimer.current)
            }}
            className="focus-visible:ring-primary/50 -m-1 rounded p-1 text-red-200 transition-colors hover:text-white focus-visible:ring-2 focus-visible:outline-none"
            aria-label={t("filters.dismissError")}
          >
            <X className="size-4" />
          </button>
        </div>
      )}
    </div>
  )
}

export { NearbyButton }
