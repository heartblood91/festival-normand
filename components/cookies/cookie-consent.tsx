"use client"

import type { KeyboardEvent } from "react"
import { useCallback, useEffect, useRef, useState } from "react"
import posthog from "posthog-js"
import {
  CookieBanner,
  CookiePreferencesModal,
  CookieStatusPill,
  type CookieConsentValue,
} from "@/components/cookies/cookie-consent-ui"

const storageKey = "pierres-en-lumieres-cookie-consent"
const posthogToken =
  process.env.NEXT_PUBLIC_POSTHOG_KEY ?? process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com"

let isPostHogEnabled = false

const isLocalHost = () =>
  typeof window !== "undefined" &&
  ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname)

const isPostHogAvailable = () => Boolean(posthogToken) && !isLocalHost()

const enablePostHog = () => {
  const token = posthogToken

  if (!token || !isPostHogAvailable()) {
    return
  }

  if (isPostHogEnabled) {
    posthog.opt_in_capturing()
    return
  }

  posthog.init(token, {
    api_host: posthogHost,
    autocapture: true,
    capture_pageview: "history_change",
    defaults: "2026-05-30",
    disable_session_recording: true,
    person_profiles: "identified_only",
  })
  isPostHogEnabled = true
}

const CookieConsent = () => {
  const [isReady, setIsReady] = useState(false)
  const [consent, setConsent] = useState<CookieConsentValue | null>(null)
  const [isManageOpen, setIsManageOpen] = useState(false)
  const [isFooterCookieControlVisible, setIsFooterCookieControlVisible] = useState(false)
  const [statsEnabled, setStatsEnabled] = useState(false)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const modalRef = useRef<HTMLDivElement | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    const storedConsent = window.localStorage.getItem(storageKey)
    const validatedConsent =
      storedConsent === "accepted" || storedConsent === "refused" ? storedConsent : null

    setConsent(validatedConsent)
    setStatsEnabled(validatedConsent === "accepted")
    setIsReady(true)
  }, [])

  useEffect(() => {
    if (consent === "accepted") {
      enablePostHog()
      return
    }

    if (consent === "refused" && isPostHogEnabled) {
      posthog.opt_out_capturing()
    }
  }, [consent])

  const persistConsent = (value: CookieConsentValue) => {
    window.localStorage.setItem(storageKey, value)
    setConsent(value)
    setStatsEnabled(value === "accepted")
    setIsManageOpen(false)
  }

  const acceptStatistics = () => persistConsent("accepted")
  const refuseStatistics = () => persistConsent("refused")

  const openManage = useCallback(() => {
    previousFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    setStatsEnabled(consent === "accepted")
    setIsManageOpen(true)
  }, [consent])

  useEffect(() => {
    const openPreferences = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Element) || !target.closest("[data-cookie-preferences]")) {
        return
      }

      event.preventDefault()
      openManage()
    }

    document.addEventListener("click", openPreferences)
    return () => document.removeEventListener("click", openPreferences)
  }, [openManage])

  useEffect(() => {
    const footerCookieControl = document.querySelector("[data-cookie-preferences]")

    if (!footerCookieControl || !("IntersectionObserver" in window)) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsFooterCookieControlVisible(Boolean(entry?.isIntersecting)),
      { threshold: 0.1 }
    )

    observer.observe(footerCookieControl)
    return () => observer.disconnect()
  }, [])

  const closeManage = () => {
    setIsManageOpen(false)
    window.setTimeout(() => previousFocusRef.current?.focus(), 0)
  }

  const saveManage = () => persistConsent(statsEnabled ? "accepted" : "refused")

  const handleModalKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      closeManage()
      return
    }

    if (event.key !== "Tab" || !modalRef.current) {
      return
    }

    const focusableElements = Array.from(
      modalRef.current.querySelectorAll<HTMLElement>(
        "button, [href], input, [tabindex]:not([tabindex='-1'])"
      )
    ).filter((element) => !element.hasAttribute("disabled"))

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    if (!firstElement || !lastElement) {
      return
    }

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault()
      lastElement.focus()
      return
    }

    if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault()
      firstElement.focus()
    }
  }

  useEffect(() => {
    if (!isManageOpen) {
      return
    }

    closeButtonRef.current?.focus()
  }, [isManageOpen])

  if (!isReady || !isPostHogAvailable()) {
    return null
  }

  return (
    <>
      {!consent && !isManageOpen ? (
        <CookieBanner onAccept={acceptStatistics} onRefuse={refuseStatistics} />
      ) : null}

      {consent && !isFooterCookieControlVisible ? (
        <CookieStatusPill consent={consent} onManage={openManage} />
      ) : null}

      {isManageOpen ? (
        <CookiePreferencesModal
          closeButtonRef={closeButtonRef}
          modalRef={modalRef}
          statsEnabled={statsEnabled}
          onClose={closeManage}
          onRefuse={refuseStatistics}
          onSave={saveManage}
          onToggleStats={() => setStatsEnabled((value) => !value)}
          onKeyDown={handleModalKeyDown}
        />
      ) : null}
    </>
  )
}

export { CookieConsent }
