import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { AdminShell } from "@/components/admin/layout/admin-shell"

const AdminLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  // No session → minimal wrapper (login page, or middleware will redirect)
  if (!session) {
    return (
      <div className="flex min-h-dvh flex-col bg-slate-950">
        {children}
      </div>
    )
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })

  return (
    <AdminShell user={{
      name: session.user.name ?? "",
      email: session.user.email,
      role: user?.role ?? "EDITOR",
    }}>
      {children}
    </AdminShell>
  )
}

export default AdminLayout
