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

const NO_TEXTS = {
  ribbonTitleFr: null,
  ribbonTitleEn: null,
  ribbonDatesFr: null,
  ribbonDatesEn: null,
  ribbonCtaFr: null,
  ribbonCtaEn: null,
}

const millennium = {
  key: "millennium" as const,
  themeSlug: "millenaire",
  logo: null,
  texts: NO_TEXTS,
}

describe("SkinSlot", () => {
  it("renders nothing without an active skin", () => {
    expect(renderToStaticMarkup(<SkinSlot skin={null} slot="beforeHeader" locale="fr" />)).toBe("")
  })

  it("renders the millennium ribbon as a labelled region linking to the theme", () => {
    const html = renderToStaticMarkup(
      <SkinSlot skin={millennium} slot="beforeHeader" locale="en" />
    )
    expect(html).toContain('<aside aria-label="Millennium of William the Conqueror"')
    expect(html).toContain('href="/fr/thematique/millenaire"')
    expect(html).toContain("1027 – 2027")
    expect(html).toContain("Millennium events")
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

  it("uses the ribbon texts from the theme form, English falling back to French", () => {
    const skin = {
      ...millennium,
      texts: {
        ...NO_TEXTS,
        ribbonTitleFr: "Mille ans de Guillaume",
        ribbonDatesFr: "2027",
        ribbonCtaEn: "See the programme",
      },
    }
    const fr = renderToStaticMarkup(<SkinSlot skin={skin} slot="beforeHeader" locale="fr" />)
    const en = renderToStaticMarkup(<SkinSlot skin={skin} slot="beforeHeader" locale="en" />)

    expect(fr).toContain('aria-label="Mille ans de Guillaume"')
    expect(fr).toContain(">2027<")
    expect(fr).toContain("Les événements du millénaire")
    expect(en).toContain('aria-label="Mille ans de Guillaume"')
    expect(en).toContain("See the programme")
  })

  it("stitches a Latin titulus on each frieze", () => {
    const header = renderToStaticMarkup(
      <SkinSlot skin={millennium} slot="afterHeader" locale="fr" />
    )
    const footer = renderToStaticMarkup(
      <SkinSlot skin={millennium} slot="beforeFooter" locale="fr" />
    )
    expect(header).toContain("ISTI · MIRANT · STELLA")
    expect(footer).toContain("HIC · WILLELM · DUX")
  })

  it("keeps the frieze out of the accessibility tree", () => {
    const html = renderToStaticMarkup(
      <SkinSlot skin={millennium} slot="beforeFooter" locale="fr" />
    )
    expect(html).toMatch(/^<div aria-hidden="true"/)
    expect(html).toContain('data-millennium-frieze="beforeFooter"')
    expect(html).toContain('alt=""')
  })

  it("puts the tapestry's upper border under the header and its lower border above the footer", () => {
    const header = renderToStaticMarkup(
      <SkinSlot skin={millennium} slot="afterHeader" locale="fr" />
    )
    const footer = renderToStaticMarkup(
      <SkinSlot skin={millennium} slot="beforeFooter" locale="fr" />
    )
    expect(header).toContain('srcSet="/themes/millennium-frieze-upper.avif"')
    expect(header).toContain('loading="eager"')
    expect(footer).toContain('srcSet="/themes/millennium-frieze-lower.avif"')
    expect(footer).toContain('src="/themes/millennium-frieze-lower.webp"')
    expect(footer).toContain('loading="lazy"')
  })
})
