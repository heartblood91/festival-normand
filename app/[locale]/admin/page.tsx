import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { prisma } from "@/lib/prisma"

const AdminPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/admin/login")
  }

  const [
    eventCount, newsCount, partnerCount, pageCount,
    draftEventCount, draftNewsCount,
    depublishedEventCount, depublishedNewsCount,
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
  ])

  return (
    <AdminDashboard
      user={session.user}
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
    />
  )
}

export default AdminPage
