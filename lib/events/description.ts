// Tourinsoft imports plain text with line breaks; the admin editor saves HTML, and
// always wraps it in block tags. Inline tags alone do not make a description HTML.
const HTML_TAG = /<\/?(p|ul|ol|li|h[1-6]|blockquote)\b[^>]*>/i

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&nbsp;": " ",
}

const escapeHtml = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

export const isHtmlDescription = (text: string): boolean => HTML_TAG.test(text)

/** Plain-text paragraphs become <p> blocks, so the editor keeps them apart. */
export const descriptionToEditorHtml = (text: string): string =>
  isHtmlDescription(text)
    ? text
    : text
        .split("\n")
        .filter((line) => line.trim().length > 0)
        .map((line) => `<p>${escapeHtml(line.trim())}</p>`)
        .join("")

/** One-line text for meta descriptions, whatever the stored format. */
export const descriptionToPlainText = (text: string): string =>
  (isHtmlDescription(text) ? text.replace(/<[^>]+>/g, " ") : text)
    .replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (entity) => ENTITIES[entity])
    .replace(/\s+/g, " ")
    .trim()
