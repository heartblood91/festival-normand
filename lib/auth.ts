import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { magicLink } from "better-auth/plugins"
import { createAuthMiddleware, APIError } from "better-auth/api"
import { Resend } from "resend"
import { prisma } from "@/lib/prisma"

const resend = new Resend(process.env.RESEND_API_KEY)

export const auth = betterAuth({
  basePath: "/api/auth",
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3010",
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: false,
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      // Only allow emails registered in AdminUser table
      if (ctx.path === "/sign-in/magic-link") {
        const email = ctx.body?.email as string | undefined
        if (!email) return

        const adminUser = await prisma.adminUser.findUnique({
          where: { email },
        })

        if (!adminUser) {
          throw new APIError("FORBIDDEN", {
            message: "This email is not authorized to access the admin area.",
          })
        }
      }
    }),
  },
  plugins: [
    magicLink({
      expiresIn: 600,
      sendMagicLink: async ({ email, url }) => {
        await resend.emails.send({
          from: "Pierres en Lumières <noreply@pierresenlumieres.fr>",
          to: email,
          subject: "Connexion à l'administration Pierres en Lumières",
          html: `
            <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #f59e0b; font-size: 24px;">Pierres en Lumières</h1>
              <p>Cliquez sur le lien ci-dessous pour vous connecter à l'administration :</p>
              <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #f59e0b; color: #0f172a; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Se connecter
              </a>
              <p style="color: #666; font-size: 12px; margin-top: 20px;">
                Ce lien expire dans 10 minutes. Si vous n'avez pas demandé cette connexion, ignorez cet email.
              </p>
            </div>
          `,
        })
      },
    }),
  ],
})
