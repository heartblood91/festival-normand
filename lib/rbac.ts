import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { Role } from "@prisma/client"

export type AuthenticatedUser = {
  id: string
  name: string
  email: string
  role: Role
}

/**
 * Get the current authenticated user with their role from DB.
 * Returns null if no session.
 */
export const getAuthenticatedUser = async (): Promise<AuthenticatedUser | null> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) return null

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, role: true },
  })

  return user
}

/**
 * Require a minimum role for a server action.
 * Throws if the user doesn't have the required role.
 */
export const requireRole = async (minimumRole: Role): Promise<AuthenticatedUser> => {
  const user = await getAuthenticatedUser()

  if (!user) {
    throw new Error("Unauthorized: not authenticated")
  }

  const roleHierarchy: Record<Role, number> = {
    EDITOR: 1,
    ADMIN: 2,
  }

  if (roleHierarchy[user.role] < roleHierarchy[minimumRole]) {
    throw new Error(`Unauthorized: requires ${minimumRole} role`)
  }

  return user
}
