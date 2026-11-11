"use client"

import type { ReactNode } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import type { Components } from "react-markdown"
import { useTranslations } from "next-intl"
import { extractYouTubeId, YouTubeEmbed } from "@/components/news/youtube-embed"
import { parseCalloutVariant, type CalloutVariant } from "@/lib/admin/editor-blocks"

type HastNode = { properties?: Record<string, unknown> }

// Blocks inserted by the page editor carry a data-block attribute.
const blockOf = (node: HastNode | undefined) => node?.properties?.dataBlock

const Callout = ({ variant, children }: { variant: CalloutVariant; children: ReactNode }) => {
  const t = useTranslations("a11y")
  const label = variant === "important" ? t("calloutImportant") : t("calloutInfo")
  return (
    <div
      role="note"
      aria-label={label}
      data-block="callout"
      data-variant={variant}
      className={
        variant === "important"
          ? "border-primary bg-ed-bg-soft my-8 border-2 px-6 pt-5 pb-1"
          : "border-primary/60 bg-ed-bg-soft my-8 border-l-2 px-6 pt-5 pb-1"
      }
    >
      <p
        aria-hidden="true"
        className="text-primary mb-3 font-mono text-xs tracking-[0.16em] uppercase"
      >
        {label}
      </p>
      {children}
    </div>
  )
}

const CtaLink = ({ href, children }: { href?: string; children: ReactNode }) => {
  const t = useTranslations("a11y")
  const external = !!href?.startsWith("http")
  return (
    <a
      href={href}
      data-block="cta-link"
      className="bg-primary text-primary-foreground hover:bg-ed-amber-deep focus-visible:ring-ring inline-flex min-h-11 items-center justify-center px-8 py-4 font-sans text-xs font-semibold tracking-[0.14em] uppercase no-underline transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
      {external && <span className="sr-only"> {t("newTab")}</span>}
    </a>
  )
}

const components: Components = {
  // Page already has an h1, so markdown headings start at h2.
  h1: ({ children }) => (
    <h2 className="text-foreground font-display mt-10 mb-5 text-3xl font-normal tracking-tight italic md:text-4xl">
      {children}
    </h2>
  ),
  h2: ({ children }) => (
    <h2 className="text-primary font-display mt-10 mb-4 text-2xl font-normal tracking-tight italic md:text-3xl">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-foreground font-display mt-8 mb-3 text-xl font-normal italic md:text-2xl">
      {children}
    </h3>
  ),
  div: ({ children, node, ...props }) =>
    blockOf(node) === "callout" ? (
      <Callout variant={parseCalloutVariant(String(node?.properties?.dataVariant ?? ""))}>
        {children}
      </Callout>
    ) : (
      <div {...props}>{children}</div>
    ),
  p: ({ children, node }) => {
    if (blockOf(node) === "cta") {
      return <div className="my-8">{children}</div>
    }
    const hasBlockChildren = node?.children?.some(
      (child: { type?: string; tagName?: string; properties?: { href?: string } }) =>
        child.type === "element" &&
        (["img", "iframe"].includes(child.tagName ?? "") ||
          (child.tagName === "a" &&
            !!child.properties?.href &&
            !!extractYouTubeId(child.properties.href)))
    )
    const Tag = hasBlockChildren ? "div" : "p"
    return (
      <Tag className="text-ed-bone mb-5 font-serif text-lg leading-relaxed font-light md:text-xl">
        {children}
      </Tag>
    )
  },
  ul: ({ children }) => (
    <ul className="text-ed-bone marker:text-primary mb-5 ml-6 list-disc space-y-2 font-serif text-lg font-light">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="text-ed-bone marker:text-primary mb-5 ml-6 list-decimal space-y-2 font-serif text-lg font-light">
      {children}
    </ol>
  ),
  // Links in a list item sit in a sentence: inline links, exempt from target size (WCAG 2.5.8).
  li: ({ children }) => (
    <li data-inline-links className="leading-relaxed">
      {children}
    </li>
  ),
  strong: ({ children }) => <strong className="text-foreground font-medium">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  a: ({ href, children, node }) => {
    if (blockOf(node) === "cta-link") return <CtaLink href={href}>{children}</CtaLink>
    if (href) {
      const youtubeId = extractYouTubeId(href)
      if (youtubeId) {
        return (
          <YouTubeEmbed
            videoId={youtubeId}
            title={typeof children === "string" ? children : undefined}
          />
        )
      }
    }
    return (
      <a
        href={href}
        className="text-primary hover:text-ed-amber-soft focus-visible:ring-primary/50 underline underline-offset-4 transition-colors focus-visible:rounded-sm focus-visible:ring-2 focus-visible:outline-none"
        {...(href?.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
      </a>
    )
  },
  iframe: ({ src, title }) => {
    const youtubeId = typeof src === "string" ? extractYouTubeId(src) : null
    if (youtubeId) return <YouTubeEmbed videoId={youtubeId} title={title} />
    return (
      <div className="border-primary/20 my-7 aspect-video w-full overflow-hidden border">
        <iframe
          src={src}
          title={title || "Contenu intégré"}
          className="h-full w-full"
          loading="lazy"
        />
      </div>
    )
  },
  img: ({ src, alt }) => (
    <figure className="my-7">
      {/* CMS markdown images have unpredictable dimensions — keep native <img> to avoid layout issues */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt ?? ""} className="border-primary/20 w-full border" loading="lazy" />
      {alt ? (
        <figcaption className="text-ed-mute mt-2.5 text-center font-mono text-xs tracking-[0.14em] uppercase">
          {alt}
        </figcaption>
      ) : null}
    </figure>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-primary text-foreground font-display my-7 border-l-2 pl-6 text-xl font-light italic">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="border-primary/20 my-10" aria-hidden="true" />,
}

type MarkdownContentProps = {
  content: string
}

const MarkdownContent = ({ content }: MarkdownContentProps) => {
  return (
    <div className="max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

export { MarkdownContent }
