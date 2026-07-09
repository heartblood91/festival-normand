"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"

const posthogToken =
  process.env.NEXT_PUBLIC_POSTHOG_KEY ?? process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN

const isLocalHost = () =>
  typeof window !== "undefined" &&
  ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname)

const CookiePreferencesFooterItem = () => {
  const t = useTranslations("footer")
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(Boolean(posthogToken) && !isLocalHost())
  }, [])

  if (!isVisible) {
    return null
  }

  return (
    <li>
      <button
        type="button"
        className="text-muted-foreground hover:text-primary focus-visible:ring-primary/50 rounded-sm text-left text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
        data-cookie-preferences
      >
        {t("manageCookies")}
      </button>
    </li>
  )
}

export { CookiePreferencesFooterItem }
