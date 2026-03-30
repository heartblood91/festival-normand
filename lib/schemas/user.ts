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
