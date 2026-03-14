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
  // Downgrade h1 to h2 since the page already has an h1
  h1: ({ children }) => (
    <h2 className="mb-6 font-serif text-2xl font-bold text-foreground md:text-3xl">
      {children}
    </h2>
  ),
  h2: ({ children }) => (
    <h3 className="mb-4 mt-8 font-serif text-xl font-bold text-foreground md:text-2xl">
      {children}
    </h3>
  ),
  h3: ({ children }) => (
    <h4 className="mb-3 mt-6 font-serif text-lg font-bold text-foreground md:text-xl">
      {children}
    </h4>
  ),
  p: ({ children, node }) => {
    const hasBlockChildren = node?.children?.some(
      (child: any) => child.type === 'element' && (['img'].includes(child.tagName) ||
        (child.tagName === 'a' && child.properties?.href && YOUTUBE_REGEX.test(child.properties.href)))
    )
    const Tag = hasBlockChildren ? 'div' : 'p'
    return (
      <Tag className="mb-4 leading-relaxed text-muted-foreground">
        {children}
      </Tag>
    )
  },
  ul: ({ children }) => (
    <ul className="mb-4 ml-6 list-disc space-y-1 text-muted-foreground">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-4 ml-6 list-decimal space-y-1 text-muted-foreground">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="leading-relaxed">{children}</li>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic">{children}</em>
  ),
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
        className="text-primary underline underline-offset-4 transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:rounded-sm"
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
        className="w-full rounded-xl"
        loading="lazy"
      />
      {alt && (
        <figcaption className="mt-2 text-center text-sm text-muted-foreground">
          {alt}
        </figcaption>
      )}
    </figure>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-4 border-l-4 border-primary/50 pl-4 italic text-muted-foreground">
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
