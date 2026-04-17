"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import type { Components } from "react-markdown"

const YOUTUBE_REGEX = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]+)/

const extractYouTubeId = (url: string): string | null => {
  const match = url.match(YOUTUBE_REGEX)
  return match ? match[1] : null
}

const components: Components = {
  // Page already has an h1, so markdown headings start at h2
  h1: ({ children }) => (
    <h2 className="text-foreground mb-6 font-serif text-2xl font-bold md:text-3xl">{children}</h2>
  ),
  h2: ({ children }) => (
    <>
      <hr className="my-8 border-white/10" aria-hidden="true" />
      <h2 className="text-foreground mb-4 font-serif text-xl font-bold md:text-2xl">{children}</h2>
    </>
  ),
  h3: ({ children }) => (
    <h3 className="border-primary/50 text-foreground mt-8 mb-3 border-l-2 pl-4 font-serif text-lg font-bold md:text-xl">
      {children}
    </h3>
  ),
  p: ({ children, node }) => {
    const hasBlockChildren = node?.children?.some(
      (child: { type?: string; tagName?: string; properties?: { href?: string } }) =>
        child.type === "element" &&
        (["img"].includes(child.tagName ?? "") ||
          (child.tagName === "a" &&
            child.properties?.href &&
            YOUTUBE_REGEX.test(child.properties.href)))
    )
    const Tag = hasBlockChildren ? "div" : "p"
    return <Tag className="text-muted-foreground mb-4 leading-relaxed">{children}</Tag>
  },
  ul: ({ children }) => (
    <ul className="text-muted-foreground mb-4 ml-6 list-disc space-y-1">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="text-muted-foreground mb-4 ml-6 list-decimal space-y-1">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => <strong className="text-foreground font-semibold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  a: ({ href, children }) => {
    if (href) {
      const youtubeId = extractYouTubeId(href)
      if (youtubeId) {
        return (
          <div className="my-6 aspect-video w-full overflow-hidden rounded-xl">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
              title={typeof children === "string" ? children : "YouTube video"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
              loading="lazy"
            />
          </div>
        )
      }
    }
    return (
      <a
        href={href}
        className="text-primary hover:text-primary/80 focus-visible:ring-primary/50 underline underline-offset-4 transition-colors focus-visible:rounded-sm focus-visible:ring-2 focus-visible:outline-none"
        {...(href?.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
      </a>
    )
  },
  img: ({ src, alt }) => (
    <figure className="my-6">
      <img
        src={src}
        alt={alt ?? ""}
        width={896}
        height={504}
        className="w-full rounded-xl"
        loading="lazy"
      />
      {alt && (
        <figcaption className="text-muted-foreground mt-2 text-center text-sm">{alt}</figcaption>
      )}
    </figure>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-primary/50 text-muted-foreground my-4 border-l-4 pl-4 italic">
      {children}
    </blockquote>
  ),
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
