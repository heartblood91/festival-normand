import { getAdminUsers } from "@/lib/actions/users"
import { isEmailEnabled } from "@/lib/email"
import { getAuthenticatedUser } from "@/lib/rbac"
import { AdminUsersPage } from "@/components/admin/users/admin-users-page"

export const metadata = {
  title: "Utilisateurs - Administration",
  robots: { index: false, follow: false },
}

const AdminUsersRoute = async () => {
  const [users, currentUser] = await Promise.all([getAdminUsers(), getAuthenticatedUser()])

  return (
    <AdminUsersPage
      users={users}
      currentUserId={currentUser?.id || ""}
      emailEnabled={isEmailEnabled()}
    />
  )
}

export default AdminUsersRoute
