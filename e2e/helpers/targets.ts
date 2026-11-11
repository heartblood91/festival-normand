import type { Page } from "@playwright/test"

/**
 * Visible controls smaller than `min` pixels on either side. Links inside running text are
 * exempt (WCAG "inline" exception), as are controls hidden from the pointer and the map
 * provider's own logo and attribution, which its terms forbid to restyle.
 */
export const smallTargets = (page: Page, min: number) =>
  page.evaluate((min) => {
    const small: string[] = []
    const controls = document.querySelectorAll<HTMLElement>(
      "a[href], button, input:not([type=hidden]), select, textarea, summary, [role=button], [role=tab], [role=switch], [role=checkbox]"
    )
    for (const control of controls) {
      const style = getComputedStyle(control)
      if (
        style.visibility === "hidden" ||
        style.display === "none" ||
        style.pointerEvents === "none"
      )
        continue
      const rect = control.getBoundingClientRect()
      if (rect.width <= 1 || rect.height <= 1) continue
      if (control.closest("p, dd, [data-inline-links]")) continue
      if (control.closest(".mapboxgl-ctrl-logo, .mapboxgl-ctrl-attrib")) continue
      // A checkbox or radio is enlarged by its label.
      const label = (control as HTMLInputElement).labels?.[0]?.getBoundingClientRect()
      const width = Math.max(rect.width, label?.width ?? 0)
      const height = Math.max(rect.height, label?.height ?? 0)
      if (width + 0.5 < min || height + 0.5 < min) {
        const name =
          control.getAttribute("aria-label") ??
          control.textContent?.trim().slice(0, 30) ??
          control.getAttribute("name") ??
          ""
        small.push(
          `${control.tagName.toLowerCase()} ${Math.round(width)}x${Math.round(height)} « ${name} »`
        )
      }
    }
    return small
  }, min)
