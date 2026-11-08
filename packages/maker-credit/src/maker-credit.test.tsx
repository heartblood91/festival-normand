import { describe, it, expect } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { MakerCredit } from "./maker-credit"

const credit = {
  name: "Cédric Freret",
  url: "https://cedric-freret.fr/",
  role: "lead dev bénévole — Délégation Normandie",
  links: [{ label: "LinkedIn", href: "https://www.linkedin.com/in/cedric-freret" }],
}

describe("MakerCredit", () => {
  it("renders the credit sentence with the name linking to the personal site", () => {
    const html = renderToStaticMarkup(<MakerCredit {...credit} />)
    expect(html).toContain("Site développé par")
    expect(html).toContain('href="https://cedric-freret.fr/"')
    expect(html).toContain(">Cédric Freret</a>")
    expect(html).toContain("lead dev bénévole — Délégation Normandie")
    expect(html).toContain('href="https://www.linkedin.com/in/cedric-freret"')
  })

  it("supports another language prefix and a light theme", () => {
    const html = renderToStaticMarkup(
      <MakerCredit {...credit} prefix="Site built by" theme="light" />
    )
    expect(html).toContain("Site built by")
    expect(html).toMatch(/color:\s*#475569/)
  })

  it("accepts custom theme colours", () => {
    const html = renderToStaticMarkup(
      <MakerCredit {...credit} theme={{ text: "#111111", accent: "#222222" }} />
    )
    expect(html).toContain("color:#111111")
    expect(html).toContain("color:#222222")
  })

  it("drops links that are not http(s)", () => {
    const html = renderToStaticMarkup(
      <MakerCredit
        {...credit}
        url="javascript:alert(1)"
        links={[{ label: "Bad", href: "javascript:alert(1)" }]}
      />
    )
    expect(html).not.toContain("javascript:")
    expect(html).toContain("Cédric Freret")
    expect(html).not.toContain("Bad")
  })
})
