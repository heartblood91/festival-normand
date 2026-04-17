"use server"

import { revalidatePath } from "next/cache"
import { Resend } from "resend"
import { prisma } from "@/lib/prisma"
import { requireRole, getAuthenticatedUser } from "@/lib/rbac"
import { inviteUserSchema, updateRoleSchema } from "@/lib/schemas/user"
import type { Role } from "@prisma/client"

const resend = new Resend(process.env.RESEND_API_KEY)

export type UserActionResult = {
  success: boolean
  message: string
  errors?: Record<string, string[]>
  userId?: string
}

export const getAdminUsers = async () => {
  await requireRole("ADMIN")

  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  })
}

export type AdminUser = Awaited<ReturnType<typeof getAdminUsers>>[number]

const generateRandomPassword = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
  let password = ""
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

const generateToken = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export const inviteUser = async (formData: FormData): Promise<UserActionResult> => {
  try {
    await requireRole("ADMIN")

    const raw = {
      email: formData.get("email") as string,
      role: formData.get("role") as string,
    }

    const result = inviteUserSchema.safeParse(raw)

    if (!result.success) {
      return {
        success: false,
        message: "Veuillez corriger les erreurs du formulaire.",
        errors: result.error.flatten().fieldErrors as Record<string, string[]>,
      }
    }

    const data = result.data

    // Check if email already registered
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existing) {
      return {
        success: false,
        message: "Cet email est déjà enregistré.",
        errors: { email: ["Cet email est déjà utilisé"] },
      }
    }

    // Generate password and token
    const password = generateRandomPassword()
    const token = generateToken()
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3010"

    // Create user
    const user = await prisma.user.create({
      data: {
        name: data.email.split("@")[0],
        email: data.email,
        role: data.role as Role,
      },
    })

    // Create account with password
    await prisma.account.create({
      data: {
        userId: user.id,
        accountId: user.id,
        providerId: "credential",
        password,
      },
    })

    // Create verification token
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    await prisma.verification.create({
      data: {
        identifier: `invite-${user.id}`,
        value: token,
        expiresAt,
      },
    })

    // Send invitation email
    const setupUrl = `${baseUrl}/fr/admin/setup-account?token=${token}&email=${encodeURIComponent(data.email)}`

    await resend.emails.send({
      from: "Pierres en Lumières <noreply@pierresenlumieres.fr>",
      to: data.email,
      subject: "Invitation - Accès administrateur Pierres en Lumières",
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #f59e0b; font-size: 24px;">Pierres en Lumières</h1>
          <p>Vous avez été invité à rejoindre l'administration de Pierres en Lumières en tant que <strong>${data.role === "ADMIN" ? "Administrateur" : "Éditeur"}</strong>.</p>
          <p>Cliquez sur le lien ci-dessous pour définir votre mot de passe :</p>
          <a href="${setupUrl}" style="display: inline-block; padding: 12px 24px; background-color: #f59e0b; color: #0f172a; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Configurer mon compte
          </a>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            Ce lien expire dans 24 heures. Si vous n'avez pas demandé cette invitation, ignorez cet email.
          </p>
        </div>
      `,
    })

    revalidatePath("/admin/users")

    return {
      success: true,
      message: "Utilisateur invité avec succès. Un email a été envoyé.",
      userId: user.id,
    }
  } catch (error) {
    console.error("Invite user error:", error)
    return {
      success: false,
      message: "Une erreur est survenue lors de l'invitation.",
    }
  }
}

export const updateUserRole = async (formData: FormData): Promise<UserActionResult> => {
  try {
    await requireRole("ADMIN")

    const raw = {
      userId: formData.get("userId") as string,
      role: formData.get("role") as string,
    }

    const result = updateRoleSchema.safeParse(raw)

    if (!result.success) {
      return {
        success: false,
        message: "Données invalides.",
        errors: result.error.flatten().fieldErrors as Record<string, string[]>,
      }
    }

    const data = result.data

    // Prevent demoting sole admin
    if (data.role === "EDITOR") {
      const adminCount = await prisma.user.count({
        where: { role: "ADMIN" },
      })

      const targetUser = await prisma.user.findUnique({
        where: { id: data.userId },
        select: { role: true },
      })

      if (targetUser?.role === "ADMIN" && adminCount === 1) {
        return {
          success: false,
          message: "Impossible de rétrograder le dernier administrateur.",
        }
      }
    }

    await prisma.user.update({
      where: { id: data.userId },
      data: { role: data.role as Role },
    })

    revalidatePath("/admin/users")

    return {
      success: true,
      message: "Rôle mis à jour avec succès.",
    }
  } catch (error) {
    console.error("Update role error:", error)
    return {
      success: false,
      message: "Une erreur est survenue lors de la mise à jour du rôle.",
    }
  }
}

export const deleteUser = async (id: string): Promise<UserActionResult> => {
  try {
    await requireRole("ADMIN")

    // Prevent deleting sole admin
    const user = await prisma.user.findUnique({
      where: { id },
      select: { role: true },
    })

    if (user?.role === "ADMIN") {
      const adminCount = await prisma.user.count({
        where: { role: "ADMIN" },
      })

      if (adminCount === 1) {
        return {
          success: false,
          message: "Impossible de supprimer le dernier administrateur.",
        }
      }
    }

    // Delete user (cascade will handle sessions/accounts)
    await prisma.user.delete({ where: { id } })

    revalidatePath("/admin/users")

    return {
      success: true,
      message: "Utilisateur supprimé avec succès.",
    }
  } catch (error) {
    console.error("Delete user error:", error)
    return {
      success: false,
      message: "Une erreur est survenue lors de la suppression.",
    }
  }
}
