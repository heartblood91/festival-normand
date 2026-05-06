import { z } from "zod"

export const inviteUserSchema = z.object({
  email: z.string().email("Email invalide"),
  role: z.enum(["ADMIN", "EDITOR"]),
})

export type InviteUserInput = z.infer<typeof inviteUserSchema>

export const updateRoleSchema = z.object({
  userId: z.string().cuid(),
  role: z.enum(["ADMIN", "EDITOR"]),
})

export type UpdateRoleInput = z.infer<typeof updateRoleSchema>

export const setupAccountSchema = z.object({
  token: z.string().min(1, "Token manquant"),
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
})

export type SetupAccountInput = z.infer<typeof setupAccountSchema>
