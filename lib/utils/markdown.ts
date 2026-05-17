import { marked } from "marked"
import TurndownService from "turndown"

/**
 * Markdown ↔ HTML round-trip used by the TipTap page editor.
 *
 * Storage stays Markdown (column `content_fr`/`content_en`). TipTap works in
 * HTML internally; the public site renders Markdown via react-markdown +
 * remark-gfm. The two helpers below bridge those formats without losing
 * structure when editing legacy content with mixed inline tags, tables,
 * embedded media, etc. Replaces a brittle regex-based implementation that
 * was dropping paragraphs containing links/bold, GFM tables, and YouTube
 * embeds on round-trip.
 */

// Sync mode + GFM (tables, strikethrough, task lists).
marked.setOptions({
  gfm: true,
  breaks: false,
})

export const markdownToHtml = (markdown: string): string => {
  if (!markdown) return ""
  const html = marked.parse(markdown, { async: false }) as string
  return html.trim()
}

const turndown = new TurndownService({
  headingStyle: "atx", // # H1, ## H2 (matches our seed)
  bulletListMarker: "-",
  codeBlockStyle: "fenced",
  emDelimiter: "*",
  strongDelimiter: "**",
  hr: "---", // align with the seeded markdown rather than the default '* * *'
})

// GFM strikethrough — TipTap emits <s> from its strike mark
turndown.addRule("strikethrough", {
  filter: ["s", "del", "strike"] as Array<keyof HTMLElementTagNameMap>,
  replacement: (content) => `~~${content}~~`,
})

// GFM tables — turndown does not ship table support out of the box
turndown.addRule("table", {
  filter: "table",
  replacement: (_content, node) => {
    const tableEl = node as HTMLTableElement
    const rows = Array.from(tableEl.querySelectorAll("tr"))
    if (rows.length === 0) return ""

    const renderRow = (row: HTMLTableRowElement): string => {
      const cells = Array.from(row.querySelectorAll("th, td"))
      return "| " + cells.map((c) => (c.textContent ?? "").trim()).join(" | ") + " |"
    }

    const [headerRow, ...bodyRows] = rows
    if (!headerRow) return ""

    const lines = [renderRow(headerRow)]
    // Add a separator after the first row so GFM treats it as the header
    const sepCount = headerRow.querySelectorAll("th, td").length
    lines.push("| " + Array.from({ length: sepCount }, () => "---").join(" | ") + " |")
    for (const row of bodyRows) lines.push(renderRow(row))
    return "\n\n" + lines.join("\n") + "\n\n"
  },
})

// YouTube iframes emitted by the @tiptap/extension-youtube — round-trip
// them as plain markdown links so the public ReactMarkdown YouTube
// auto-embed still kicks in.
turndown.addRule("youtube", {
  filter: (node) => {
    if (node.nodeName !== "IFRAME") return false
    const src = (node as HTMLIFrameElement).getAttribute("src") ?? ""
    return /youtube(-nocookie)?\.com|youtu\.be/.test(src)
  },
  replacement: (_content, node) => {
    const src = (node as HTMLIFrameElement).getAttribute("src") ?? ""
    return `[YouTube](${src})`
  },
})

export const htmlToMarkdown = (html: string): string => {
  if (!html) return ""
  // Turndown pads each list item with 3 spaces after the marker ("-   item").
  // CommonMark accepts that, but our seeded files use the more conventional
  // single-space form, so normalize it to keep diffs small on round-trips.
  return turndown
    .turndown(html)
    .replace(/^(\s*[-*+])   +/gm, "$1 ")
    .replace(/^(\s*\d+\.)   +/gm, "$1 ")
    .trim()
}
