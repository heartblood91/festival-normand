"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { MapPin, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const NearbyButton = () => {
  const t = useTranslations()
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const isActive = searchParams.has("lat") && searchParams.has("lng")

  const handleClick = () => {
    if (isActive) {
      // Remove geolocation params
      const params = new URLSearchParams(searchParams.toString())
      params.delete("lat")
      params.delete("lng")
      params.delete("page")
      router.push(`/evenements${params.toString() ? `?${params.toString()}` : ""}`)
      return
    }

    if (!navigator.geolocation) {
      toast.error(t("filters.geoNotSupported"))
      return
    }

    setIsLoading(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set("lat", position.coords.latitude.toFixed(4))
        params.set("lng", position.coords.longitude.toFixed(4))
        params.delete("page")
        router.push(`/evenements?${params.toString()}`)
        setIsLoading(false)
      },
      (error) => {
        setIsLoading(false)
        if (error.code === error.PERMISSION_DENIED) {
          toast.error(t("filters.geoDenied"))
        } else {
          toast.error(t("filters.geoError"))
        }
      },
      { enableHighAccuracy: false, timeout: 10000 }
    )
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      className={cn(
        "min-h-10 min-w-10 inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-sm font-medium transition-all whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        isActive
          ? "border-primary bg-primary text-primary-foreground"
          : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground",
        isLoading && "opacity-50 cursor-wait"
      )}
      aria-label={t("filters.nearbyLabel")}
    >
      {isLoading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <MapPin className="size-4" />
      )}
      <span className="hidden sm:inline">{t("filters.nearby")}</span>
    </button>
  )
}

export { NearbyButton }
