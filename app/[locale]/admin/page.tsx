import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { prisma } from "@/lib/prisma"
import { eventListWhere, parisToday } from "@/lib/admin/event-list"
import { getLastTourinsoftRun } from "@/lib/tourinsoft/sync"

export const metadata = {
  title: "Tableau de bord - Administration",
  robots: { index: false, follow: false },
}

const AdminPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/admin/login")
  }

  const [
    eventCount,
    newsCount,
    partnerCount,
    pageCount,
    draftEventCount,
    draftNewsCount,
    depublishedEventCount,
    depublishedNewsCount,
    lastSyncRun,
    missingEn,
    missingAlt,
    missingGps,
  ] = await Promise.all([
    prisma.event.count({ where: { published: true } }),
    prisma.news.count({ where: { published: true } }),
    prisma.partner.count(),
    prisma.page.count(),
    // Drafts: never published (no publishedAt, no unpublishedAt)
    prisma.event.count({ where: { published: false, publishedAt: null, unpublishedAt: null } }),
    prisma.news.count({ where: { published: false, publishedAt: null, unpublishedAt: null } }),
    // Depublished: was published or has unpublishedAt
    prisma.event.count({ where: { published: false, unpublishedAt: { not: null } } }),
    prisma.news.count({ where: { published: false, unpublishedAt: { not: null } } }),
    getLastTourinsoftRun(),
    ...(["missing-en", "missing-alt", "missing-gps"] as const).map((todo) =>
      prisma.event.count({ where: eventListWhere({ todo }, parisToday()) })
    ),
  ])

  return (
    <AdminDashboard
      user={session.user}
      lastSyncRun={lastSyncRun}
      stats={{
        events: eventCount,
        news: newsCount,
        partners: partnerCount,
        pages: pageCount,
        draftEvents: draftEventCount,
        draftNews: draftNewsCount,
        depublishedEvents: depublishedEventCount,
        depublishedNews: depublishedNewsCount,
      }}
      todo={{ missingEn, missingAlt, missingGps }}
    />
  )
}

export default AdminPage
