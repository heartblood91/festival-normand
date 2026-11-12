import { getAdminReviews, type ReviewFilter } from "@/lib/actions/reviews"
import { AdminReviewsPage } from "@/components/admin/reviews/admin-reviews-page"

export const metadata = {
  title: "Avis visiteurs - Administration",
  robots: { index: false, follow: false },
}

type Props = {
  searchParams: Promise<Record<string, string | undefined>>
}

const FILTERS: ReviewFilter[] = ["PENDING", "APPROVED", "REJECTED"]

const AdminReviewsRoute = async ({ searchParams }: Props) => {
  const requested = (await searchParams).statut?.toUpperCase() as ReviewFilter | undefined
  const status = requested && FILTERS.includes(requested) ? requested : "PENDING"
  const data = await getAdminReviews(status)

  return <AdminReviewsPage status={status} {...data} />
}

export default AdminReviewsRoute
