"use client"

import { useEffect, useState, type ReactNode } from "react"

// Set once the first page has hydrated: the initial load must not fade in (it would
// delay the largest paint), only the pages reached by client navigation.
let navigated = false

/** Remounts on every navigation, so each new page eases in while header and footer stay. */
const PublicTemplate = ({ children }: { children: ReactNode }) => {
  const [animate] = useState(() => typeof window !== "undefined" && navigated)

  useEffect(() => {
    navigated = true
  }, [])

  return <div className={animate ? "ed-page-enter" : undefined}>{children}</div>
}

export default PublicTemplate
