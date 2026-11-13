import { describe, expect, it, vi } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import type { ReactNode } from "react"

vi.mock("@/lib/i18n/routing", () => ({
  Link: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={`/fr${href}`} {...props}>
      {children}
    </a>
  ),
}))

import { SkinSlot } from "@/components/skins"

const millennium = { key: "millennium" as const, themeSlug: "millenaire", logo: null }

describe("SkinSlot", () => {
  it("renders nothing without an active skin", () => {
    expect(renderToStaticMarkup(<SkinSlot skin={null} slot="beforeHeader" locale="fr" />)).toBe("")
  })

  it("renders the millennium ribbon as a labelled region linking to the theme", () => {
    const html = renderToStaticMarkup(
      <SkinSlot skin={millennium} slot="beforeHeader" locale="en" />
    )
    expect(html).toContain('<aside aria-label="Millennium of William the Conqueror"')
    expect(html).toContain('href="/fr/evenements?theme=millenaire"')
    expect(html).toContain('alt=""')
    expect(html).toContain('src="/themes/millennium-emblem.svg"')
  })

  it("shows the logo chosen in the theme form instead of the example", () => {
    const html = renderToStaticMarkup(
      <SkinSlot
        skin={{ ...millennium, logo: "/uploads/millenaire-officiel.png" }}
        slot="beforeHeader"
        locale="fr"
      />
    )
    expect(html).toContain('src="/uploads/millenaire-officiel.png"')
    expect(html).not.toContain("millennium-emblem.svg")
  })

  it("keeps the frieze out of the accessibility tree", () => {
    const html = renderToStaticMarkup(
      <SkinSlot skin={millennium} slot="beforeFooter" locale="fr" />
    )
    expect(html).toMatch(/^<div aria-hidden="true"/)
    expect(html).toContain('id="millennium-frieze-beforeFooter"')
  })
})
