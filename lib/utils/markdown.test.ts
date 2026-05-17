// @vitest-environment jsdom
import { describe, it, expect } from "vitest"
import { markdownToHtml, htmlToMarkdown } from "./markdown"

describe("markdownToHtml", () => {
  it("renders headings", () => {
    const html = markdownToHtml("# Title\n\n## Sub")
    expect(html).toContain("<h1>Title</h1>")
    expect(html).toContain("<h2>Sub</h2>")
  })

  it("preserves inline links inside paragraphs (the regression that broke legacy pages)", () => {
    const html = markdownToHtml("Visit [our site](https://example.com) for more.")
    expect(html).toMatch(/<p>Visit <a href="https:\/\/example\.com">our site<\/a> for more\.<\/p>/)
  })

  it("supports horizontal rules", () => {
    const html = markdownToHtml("Para 1\n\n---\n\nPara 2")
    expect(html).toContain("<hr>")
  })

  it("renders GFM tables", () => {
    const md = "| H1 | H2 |\n|---|---|\n| a | b |\n| c | d |"
    const html = markdownToHtml(md)
    expect(html).toContain("<table>")
    expect(html).toContain("<th>H1</th>")
    expect(html).toContain("<td>a</td>")
  })

  it("renders ordered and unordered lists with inline children", () => {
    const html = markdownToHtml("- **bold** item\n- plain")
    expect(html).toContain("<li><strong>bold</strong> item</li>")
  })
})

describe("htmlToMarkdown", () => {
  it("collapses paragraphs with inline children back to markdown", () => {
    const html = "<p>Visit <a href=\"https://example.com\">our site</a> for more.</p>"
    expect(htmlToMarkdown(html)).toBe("Visit [our site](https://example.com) for more.")
  })

  it("preserves horizontal rules", () => {
    const html = "<p>A</p><hr><p>B</p>"
    const md = htmlToMarkdown(html)
    expect(md).toContain("---")
  })

  it("converts strikethrough from <s> back to ~~", () => {
    expect(htmlToMarkdown("<p>Hello <s>old</s> world</p>")).toBe("Hello ~~old~~ world")
  })

  it("converts GFM tables back to markdown", () => {
    const html = "<table><tr><th>H1</th><th>H2</th></tr><tr><td>a</td><td>b</td></tr></table>"
    const md = htmlToMarkdown(html)
    expect(md).toContain("| H1 | H2 |")
    expect(md).toContain("| --- | --- |")
    expect(md).toContain("| a | b |")
  })

  it("rewrites a YouTube iframe back to a markdown link the public renderer will embed", () => {
    const html = `<iframe src="https://www.youtube-nocookie.com/embed/AHnGhy1o0pA"></iframe>`
    expect(htmlToMarkdown(html)).toBe("[YouTube](https://www.youtube-nocookie.com/embed/AHnGhy1o0pA)")
  })
})

describe("round-trip", () => {
  const cases: Array<{ name: string; input: string }> = [
    { name: "headings + paragraph", input: "# Title\n\nFirst paragraph." },
    {
      name: "paragraph with inline link (the legacy regression)",
      input: "Visit [our site](https://example.com) today.",
    },
    {
      name: "unordered list with inline emphasis",
      input: "- **bold** item\n- plain item",
    },
    {
      name: "horizontal rule between sections",
      input: "Section A.\n\n---\n\nSection B.",
    },
    {
      name: "blockquote",
      input: "> A quote here.",
    },
  ]

  for (const c of cases) {
    it(`survives a markdown → html → markdown round-trip for: ${c.name}`, () => {
      const html = markdownToHtml(c.input)
      const back = htmlToMarkdown(html)
      // Normalize whitespace for the comparison — turndown sometimes adds
      // trailing newlines and we don't care about that, only about content.
      const normalize = (s: string) =>
        s
          .split("\n")
          .map((l) => l.trimEnd())
          .filter((l, i, arr) => !(l === "" && (i === 0 || arr[i - 1] === "")))
          .join("\n")
          .trim()
      expect(normalize(back)).toBe(normalize(c.input))
    })
  }
})
