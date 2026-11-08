import type { CSSProperties } from "react"

export type MakerCreditLink = { label: string; href: string }

export type MakerCreditTheme = "dark" | "light" | { text: string; accent: string }

export type MakerCreditProps = {
  name: string
  /** Personal site, linked on the name */
  url?: string
  role?: string
  /** Extra profile links, e.g. LinkedIn */
  links?: MakerCreditLink[]
  /** Sentence start, e.g. "Site built by" for English pages */
  prefix?: string
  theme?: MakerCreditTheme
  className?: string
}

const THEMES: Record<"dark" | "light", { text: string; accent: string }> = {
  dark: { text: "#94a3b8", accent: "#f59e0b" },
  light: { text: "#475569", accent: "#b45309" },
}

const isHttpUrl = (value: string | undefined): value is string => {
  if (!value) return false
  try {
    const { protocol } = new URL(value)
    return protocol === "https:" || protocol === "http:"
  } catch {
    return false
  }
}

/**
 * Discreet "made by" line for a site footer. Self-contained (React only, inline
 * styles) so it can move to its own npm package unchanged.
 */
export const MakerCredit = ({
  name,
  url,
  role,
  links = [],
  prefix = "Site développé par",
  theme = "dark",
  className,
}: MakerCreditProps) => {
  const colors = typeof theme === "string" ? THEMES[theme] : theme
  const linkStyle: CSSProperties = {
    color: colors.accent,
    textDecoration: "underline",
    textUnderlineOffset: "3px",
  }
  const safeLinks = links.filter((link) => isHttpUrl(link.href))

  return (
    <p
      className={className}
      style={{ color: colors.text, fontSize: "12px", lineHeight: 1.6, margin: 0 }}
    >
      {prefix}{" "}
      {isHttpUrl(url) ? (
        <a href={url} rel="author" style={linkStyle}>
          {name}
        </a>
      ) : (
        name
      )}
      {role ? `, ${role}` : null}
      {safeLinks.map((link) => (
        <span key={link.href}>
          {" · "}
          <a href={link.href} rel="me noopener" style={linkStyle}>
            {link.label}
          </a>
        </span>
      ))}
    </p>
  )
}
