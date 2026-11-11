import { Node, mergeAttributes } from "@tiptap/react"
import { parseCalloutVariant } from "@/lib/admin/editor-blocks"

/** Highlighted box ("À noter" / "Important") wrapping paragraphs and lists. */
export const Callout = Node.create({
  name: "callout",
  group: "block",
  content: "(paragraph | bulletList | orderedList)+",
  defining: true,
  addAttributes: () => ({
    variant: {
      default: "info",
      parseHTML: (element) => parseCalloutVariant(element.getAttribute("data-variant")),
      renderHTML: (attributes) => ({ "data-variant": parseCalloutVariant(attributes.variant) }),
    },
  }),
  parseHTML: () => [{ tag: 'div[data-block="callout"]' }],
  renderHTML: ({ HTMLAttributes }) => [
    "div",
    mergeAttributes(HTMLAttributes, { "data-block": "callout" }),
    0,
  ],
})

/** Call-to-action link displayed as a button (registration form, programme, PDF…). */
export const CtaButton = Node.create({
  name: "ctaButton",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,
  addAttributes: () => ({
    href: {
      default: "",
      parseHTML: (element) => element.querySelector("a")?.getAttribute("href") ?? "",
      renderHTML: () => ({}),
    },
    label: {
      default: "",
      parseHTML: (element) => element.querySelector("a")?.textContent?.trim() ?? "",
      renderHTML: () => ({}),
    },
  }),
  parseHTML: () => [{ tag: 'p[data-block="cta"]' }],
  renderHTML: ({ node }) => [
    "p",
    { "data-block": "cta" },
    ["a", { href: node.attrs.href, "data-block": "cta-link" }, node.attrs.label],
  ],
})
