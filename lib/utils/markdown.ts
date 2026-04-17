export const markdownToHtml = (markdown: string): string => {
  if (!markdown) return ""

  let html = markdown

  // Escape HTML entities first
  html = html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

  // Blockquotes (before other patterns)
  html = html.replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")

  // Code blocks (before other patterns) - match triple backticks
  html = html.replace(/```[\s\S]*?```/g, (match) => {
    const content = match.slice(3, -3)
    return `<pre><code>${content}</code></pre>`
  })

  // Headings
  html = html.replace(/^###### (.+)$/gm, "<h6>$1</h6>")
  html = html.replace(/^##### (.+)$/gm, "<h5>$1</h5>")
  html = html.replace(/^#### (.+)$/gm, "<h4>$1</h4>")
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>")
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>")
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>")

  // Horizontal rules
  html = html.replace(/^---$/gm, "<hr />")

  // Unordered lists
  html = html.replace(/^[\*\-\+] (.+)$/gm, "<li>$1</li>")
  html = html.replace(/<li>[\s\S]*?<\/li>/g, (match) => `<ul>${match}</ul>`)

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, "<li>$1</li>")

  // Line breaks to paragraphs (double newline = paragraph break)
  html = html
    .split("\n\n")
    .map((paragraph) => {
      paragraph = paragraph.trim()
      if (!paragraph) return ""
      if (paragraph.match(/^<[^>]+>/)) return paragraph
      return `<p>${paragraph.replace(/\n/g, "<br />")}</p>`
    })
    .join("\n")

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
  html = html.replace(/__(.+?)__/g, "<strong>$1</strong>")

  // Italic
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>")
  html = html.replace(/_(.+?)_/g, "<em>$1</em>")

  // Strikethrough
  html = html.replace(/~~(.+?)~~/g, "<s>$1</s>")

  // Links
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')

  // Images
  html = html.replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1" />')

  // Inline code
  html = html.replace(/`(.+?)`/g, "<code>$1</code>")

  return html.trim()
}

export const htmlToMarkdown = (html: string): string => {
  if (!html) return ""

  let markdown = html

  // Remove wrapper divs but preserve content
  markdown = markdown.replace(/<div[^>]*?>/g, "")
  markdown = markdown.replace(/<\/div>/g, "")

  // Headings - use character class instead of dotall flag
  markdown = markdown.replace(/<h1[^>]*?>([^<]*)<\/h1>/g, "# $1\n")
  markdown = markdown.replace(/<h2[^>]*?>([^<]*)<\/h2>/g, "## $1\n")
  markdown = markdown.replace(/<h3[^>]*?>([^<]*)<\/h3>/g, "### $1\n")
  markdown = markdown.replace(/<h4[^>]*?>([^<]*)<\/h4>/g, "#### $1\n")
  markdown = markdown.replace(/<h5[^>]*?>([^<]*)<\/h5>/g, "##### $1\n")
  markdown = markdown.replace(/<h6[^>]*?>([^<]*)<\/h6>/g, "###### $1\n")

  // Paragraphs
  markdown = markdown.replace(/<p[^>]*?>([^<]*)<\/p>/g, "$1\n\n")

  // Bold
  markdown = markdown.replace(/<strong[^>]*?>([^<]*)<\/strong>/g, "**$1**")
  markdown = markdown.replace(/<b[^>]*?>([^<]*)<\/b>/g, "**$1**")

  // Italic
  markdown = markdown.replace(/<em[^>]*?>([^<]*)<\/em>/g, "*$1*")
  markdown = markdown.replace(/<i[^>]*?>([^<]*)<\/i>/g, "*$1*")

  // Strikethrough
  markdown = markdown.replace(/<s[^>]*?>([^<]*)<\/s>/g, "~~$1~~")
  markdown = markdown.replace(/<del[^>]*?>([^<]*)<\/del>/g, "~~$1~~")

  // Links
  markdown = markdown.replace(/<a[^>]*?href=["']([^"']*)["'][^>]*?>([^<]*)<\/a>/g, "[$2]($1)")

  // Images
  markdown = markdown.replace(
    /<img[^>]*?src=["']([^"']*)["'][^>]*?alt=["']([^"']*)["'][^>]*?\/?>/g,
    "![$2]($1)"
  )
  markdown = markdown.replace(
    /<img[^>]*?alt=["']([^"']*)["'][^>]*?src=["']([^"']*)["'][^>]*?\/?>/g,
    "![$1]($2)"
  )

  // Unordered lists
  markdown = markdown.replace(/<ul[^>]*?>([\s\S]*?)<\/ul>/g, (match, content) => {
    const items = content.match(/<li[^>]*?>([^<]*)<\/li>/g) || []
    return (
      items
        .map((item: string) => {
          const text = item.replace(/<li[^>]*?>([^<]*)<\/li>/g, "$1").trim()
          return `- ${text}`
        })
        .join("\n") + "\n"
    )
  })

  // Ordered lists
  markdown = markdown.replace(/<ol[^>]*?>([\s\S]*?)<\/ol>/g, (match, content) => {
    const items = content.match(/<li[^>]*?>([^<]*)<\/li>/g) || []
    return (
      items
        .map((item: string, idx: number) => {
          const text = item.replace(/<li[^>]*?>([^<]*)<\/li>/g, "$1").trim()
          return `${idx + 1}. ${text}`
        })
        .join("\n") + "\n"
    )
  })

  // Blockquotes
  markdown = markdown.replace(/<blockquote[^>]*?>([\s\S]*?)<\/blockquote>/g, (match, content) => {
    const text = content.trim()
    return `> ${text.replace(/\n/g, "\n> ")}\n`
  })

  // Horizontal rule
  markdown = markdown.replace(/<hr[^>]*?\/?>/g, "---\n")

  // Tables
  markdown = markdown.replace(/<table[^>]*?>([\s\S]*?)<\/table>/g, (match, content) => {
    const rows = content.match(/<tr[^>]*?>([\s\S]*?)<\/tr>/g) || []
    return (
      rows
        .map((row: string) => {
          const cells = row.match(/<(?:td|th)[^>]*?>([\s\S]*?)<\/(?:td|th)>/g) || []
          return (
            "| " +
            cells
              .map((cell: string) => {
                return cell.replace(/<(?:td|th)[^>]*?>([\s\S]*?)<\/(?:td|th)>/g, "$1").trim()
              })
              .join(" | ") +
            " |"
          )
        })
        .join("\n") + "\n"
    )
  })

  // Code blocks
  markdown = markdown.replace(/<pre[^>]*?><code[^>]*?>([\s\S]*?)<\/code><\/pre>/g, "```\n$1\n```\n")

  // Inline code
  markdown = markdown.replace(/<code[^>]*?>([^<]*)<\/code>/g, "`$1`")

  // Line breaks
  markdown = markdown.replace(/<br\s*\/?>/g, "\n")

  // Remove remaining HTML tags
  markdown = markdown.replace(/<[^>]*?>/g, "")

  // Clean up multiple spaces and newlines
  markdown = markdown.replace(/\n\n\n+/g, "\n\n")
  markdown = markdown.replace(/\s+$/gm, "")

  return markdown.trim()
}
