import { getAdminGallery } from "@/lib/actions/gallery"
import { getCurrentEdition } from "@/lib/queries/edition"
import { AdminGalleryPage } from "@/components/admin/gallery/admin-gallery-page"

export const metadata = {
  title: "Retour en images - Administration",
  robots: { index: false, follow: false },
}

const AdminGalleryRoute = async () => {
  const [photos, edition] = await Promise.all([getAdminGallery(), getCurrentEdition()])

  return <AdminGalleryPage photos={photos} defaultYear={edition.year} />
}

export default AdminGalleryRoute
