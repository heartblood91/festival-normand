import { describe, expect, it } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { NextIntlClientProvider } from "next-intl"
import { MarkdownContent } from "@/components/news/markdown-content"
import fr from "@/lib/i18n/messages/fr.json"
import en from "@/lib/i18n/messages/en.json"

const render = (content: string, locale: "fr" | "en" = "fr") =>
  renderToStaticMarkup(
    <NextIntlClientProvider locale={locale} messages={locale === "fr" ? fr : en}>
      <MarkdownContent content={content} />
    </NextIntlClientProvider>
  )

describe("MarkdownContent editor blocks", () => {
  it("renders a callout as a labelled note", () => {
    const html = render(
      '<div data-block="callout" data-variant="important"><p>Réservation obligatoire.</p></div>'
    )
    expect(html).toContain('role="note"')
    expect(html).toContain('aria-label="Important"')
    expect(html).toContain("Réservation obligatoire.")
  })

  it("falls back to the info variant and translates its label", () => {
    const html = render('<div data-block="callout" data-variant="bogus"><p>Free.</p></div>', "en")
    expect(html).toContain('aria-label="Note"')
    expect(html).toContain('data-variant="info"')
  })

  it("renders a call-to-action as a button-styled link announcing a new tab", () => {
    const html = render(
      '<p data-block="cta"><a href="https://forms.test/inscription" data-block="cta-link">S\'inscrire</a></p>'
    )
    expect(html).toMatch(
      /<a href="https:\/\/forms\.test\/inscription" data-block="cta-link"[^>]*target="_blank"/
    )
    expect(html).toContain("min-h-11")
    expect(html).toContain("(nouvel onglet)")
    expect(html).not.toMatch(/<p[^>]*><a[^>]*cta-link/)
  })

  it("keeps internal call-to-action links in the same tab", () => {
    const html = render(
      '<p data-block="cta"><a href="/fr/evenements" data-block="cta-link">Programme</a></p>'
    )
    expect(html).not.toContain("_blank")
    expect(html).not.toContain("nouvel onglet")
  })

  it("strips javascript: targets from call-to-action links", () => {
    const html = render(
      '<p data-block="cta"><a href="javascript:alert(1)" data-block="cta-link">Piège</a></p>'
    )
    expect(html).not.toContain("javascript:")
  })

  it("leaves plain divs and paragraphs untouched", () => {
    const html = render("<div><p>Texte</p></div>")
    expect(html).not.toContain('role="note"')
    expect(html).toContain("Texte")
  })
})
