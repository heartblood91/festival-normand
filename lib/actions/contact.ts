"use server"

import { Resend } from "resend"
import { contactSchema, DEPARTMENT_EMAILS } from "@/lib/contact-schema"
import { isEmailEnabled } from "@/lib/email"
import { createRateLimiter } from "@/lib/rate-limit"
import { verifyTurnstile } from "@/lib/turnstile"

const getResend = () => new Resend(process.env.RESEND_API_KEY)

type ContactValues = {
  name: string
  email: string
  department: string
  message: string
}

export type ContactActionResult = {
  success: boolean
  message: string
  errors?: Record<string, string[]>
  /** Submitted values, so a failed attempt does not wipe what the visitor typed. */
  values?: ContactValues
  /** Set when outbound email is not configured: the visitor writes from their own mailbox. */
  fallback?: { email: string; href: string }
}

const mailtoHref = (to: string, name: string, message: string) =>
  `mailto:${to}?subject=${encodeURIComponent(`[Contact] Message de ${name}`)}&body=${encodeURIComponent(message)}`

// One message per sender address per minute.
const isRateLimited = createRateLimiter({ name: "contact", windowMs: 60_000, max: 1 })

export const sendContactEmail = async (
  _prevState: ContactActionResult,
  formData: FormData
): Promise<ContactActionResult> => {
  const values: ContactValues = {
    name: (formData.get("name") as string) ?? "",
    email: (formData.get("email") as string) ?? "",
    department: (formData.get("department") as string) ?? "",
    message: (formData.get("message") as string) ?? "",
  }
  try {
    const raw = { ...values, honeypot: (formData.get("honeypot") as string) ?? "" }

    // Honeypot check
    if (raw.honeypot) {
      return { success: true, message: "Message envoyé avec succès !" }
    }

    const result = contactSchema.safeParse(raw)

    if (!result.success) {
      return {
        success: false,
        message: "Veuillez corriger les erreurs dans le formulaire.",
        errors: result.error.flatten().fieldErrors as Record<string, string[]>,
        values,
      }
    }

    const { name, email, department, message } = result.data

    if (!(await verifyTurnstile(formData))) {
      return {
        success: false,
        message:
          "La vérification anti-spam n’a pas abouti. Rechargez la page et réessayez ; si un bloqueur de contenu est actif, autorisez challenges.cloudflare.com.",
        values,
      }
    }

    // Rate limiting
    if (await isRateLimited(email)) {
      return {
        success: false,
        message: "Veuillez patienter une minute avant d'envoyer un nouveau message.",
        values,
      }
    }

    const recipientEmail = DEPARTMENT_EMAILS[department]

    if (!recipientEmail) {
      return {
        success: false,
        message: "Département invalide.",
        values,
      }
    }

    if (!isEmailEnabled()) {
      return {
        success: false,
        message: "L'envoi en ligne est indisponible : écrivez directement au département.",
        values,
        fallback: { email: recipientEmail, href: mailtoHref(recipientEmail, name, message) },
      }
    }

    await getResend().emails.send({
      from: "Pierres en Lumières <contact@pierresenlumieres.fr>",
      to: recipientEmail,
      replyTo: email,
      subject: `[Contact] Message de ${name}`,
      text: `Nom: ${name}\nEmail: ${email}\nDépartement: ${department}\n\nMessage:\n${message}`,
    })

    return {
      success: true,
      message: "Votre message a été envoyé avec succès !",
    }
  } catch {
    return {
      success: false,
      message: "Une erreur est survenue lors de l'envoi du message. Veuillez réessayer.",
      values,
    }
  }
}
