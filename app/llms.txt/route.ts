import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://pierresenlumieres.fr"
const isProduction = process.env.VERCEL_ENV === "production"
const EXCERPT_LENGTH = 300

const stripHtml = (html: string): string =>
  html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim()

const excerpt = (html: string | null): string => {
  if (!html) return ""
  const text = stripHtml(html)
  return text.length > EXCERPT_LENGTH ? `${text.slice(0, EXCERPT_LENGTH)}...` : text
}

const formatDate = (date: Date) =>
  date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })

export const GET = async () => {
  if (!isProduction) {
    return new NextResponse("Not available in preview/staging.", { status: 404 })
  }

  const [featuredEvents, upcomingEvents, news, pages] = await Promise.all([
    prisma.event.findMany({
      where: { published: true, featured: true },
      select: { titleFr: true, slug: true, city: true, department: true, dateStart: true, descriptionFr: true },
      orderBy: { dateStart: "asc" },
      take: 5,
    }).catch(() => []),
    prisma.event.findMany({
      where: { published: true },
      select: { titleFr: true, slug: true, city: true, department: true, category: true, dateStart: true, descriptionFr: true },
      orderBy: { dateStart: "asc" },
      take: 20,
    }).catch(() => []),
    prisma.news.findMany({
      where: { published: true },
      select: { titleFr: true, slug: true, publishedAt: true, excerptFr: true, contentFr: true },
      orderBy: { publishedAt: "desc" },
      take: 10,
    }).catch(() => []),
    prisma.page.findMany({
      select: { titleFr: true, slug: true },
    }).catch(() => []),
  ])

  const departmentLabels: Record<string, string> = {
    CALVADOS: "Calvados",
    EURE: "Eure",
    MANCHE: "Manche",
    ORNE: "Orne",
    SEINE_MARITIME: "Seine-Maritime",
  }

  const lines = [
    "# Pierres en Lumières",
    "> Festival du patrimoine normand en nocturne. Chaque année fin mai, des centaines de sites patrimoniaux s'illuminent à travers les 5 départements de Normandie.",
    "",
    `Site: ${SITE_URL}`,
    "Langues: Français, English",
    "Dates: 29, 30 & 31 mai 2026",
    "Région: Normandie (Calvados, Eure, Manche, Orne, Seine-Maritime)",
    "",
    "## Pages",
    "",
    `- [Accueil](${SITE_URL}/fr): Découvrez le festival Pierres en Lumières`,
    `- [Événements](${SITE_URL}/fr/evenements): ${upcomingEvents.length} événements à travers la Normandie`,
    `- [Actualités](${SITE_URL}/fr/actualites): Les dernières nouvelles du festival`,
    `- [Le Festival](${SITE_URL}/fr/festival): Pierres en Lumières, un festival unique`,
    `- [Contact](${SITE_URL}/fr/contact): Contacter l'équipe du festival`,
    `- [Inscription](${SITE_URL}/fr/inscription): Inscrivez votre événement`,
    ...pages.map((p) => `- [${p.titleFr}](${SITE_URL}/fr/${p.slug})`),
    "",
    "## Événements à la une",
    "",
    ...(featuredEvents.length > 0
      ? featuredEvents.flatMap((e) => [
          `- [${e.titleFr}](${SITE_URL}/fr/evenement/${e.slug}): ${e.city ? `${e.city}, ` : ""}${departmentLabels[e.department] || e.department} — ${formatDate(e.dateStart)}`,
          `  ${excerpt(e.descriptionFr)}`,
        ])
      : ["- Aucun événement à la une"]),
    "",
    "## Prochains événements",
    "",
    ...(upcomingEvents.length > 0
      ? upcomingEvents.map((e) =>
          `- [${e.titleFr}](${SITE_URL}/fr/evenement/${e.slug}): ${e.city ? `${e.city}, ` : ""}${departmentLabels[e.department] || e.department} — ${formatDate(e.dateStart)} — ${e.category}`
        )
      : ["- Aucun événement à venir"]),
    "",
    "## Actualités récentes",
    "",
    ...(news.length > 0
      ? news.flatMap((n) => [
          `- [${n.titleFr}](${SITE_URL}/fr/actualite/${n.slug}): ${n.publishedAt ? formatDate(n.publishedAt) : ""}`,
          `  ${excerpt(n.excerptFr || n.contentFr)}`,
        ])
      : ["- Aucune actualité publiée"]),
    "",
  ]

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  })
}
