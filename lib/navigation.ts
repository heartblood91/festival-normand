export type NavItem = {
  key: string
  href: string
}

export const NAV_ITEMS: NavItem[] = [
  { key: "home", href: "/" },
  { key: "events", href: "/evenements" },
  { key: "news", href: "/actualites" },
  { key: "festival", href: "/festival" },
  { key: "contact", href: "/contact" },
]

export const CTA_HREF = "/inscription"

export const SOCIAL_LINKS = {
  facebook: "https://www.facebook.com/pierresenlumieres",
  instagram: "https://www.instagram.com/pierresenlumieres",
}
