export type NavItem = {
  label: string
  href: string
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Accueil", href: "/" },
  { label: "Événements", href: "/evenements" },
  { label: "Actualités", href: "/actualites" },
  { label: "Le Festival", href: "/festival" },
  { label: "Contact", href: "/contact" },
]

export const CTA_LINK = {
  label: "Inscrivez votre événement",
  href: "/inscription",
}

export const SOCIAL_LINKS = {
  facebook: "https://www.facebook.com/pierresenlumieres",
  instagram: "https://www.instagram.com/pierresenlumieres",
}

export const FESTIVAL_NAME = "Pierres en Lumières"
export const FESTIVAL_DATES = "29, 30 & 31 mai 2026"
