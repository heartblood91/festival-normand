"use client"

import { useActionState } from "react"
import { useEffect, useRef } from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { Send } from "lucide-react"
import { DEPARTMENT_OPTIONS } from "@/lib/contact-schema"
import { sendContactEmail, type ContactActionResult } from "@/lib/actions/contact"

const initialState: ContactActionResult = {
  success: false,
  message: "",
}

const labelClass = "text-primary mb-2 block font-mono text-[10.5px] tracking-[0.18em] uppercase"
const fieldClass =
  "border-primary/30 bg-ed-bg-soft text-foreground placeholder:text-ed-mute focus-visible:border-primary focus-visible:ring-primary/30 w-full border px-4 py-3 font-serif text-base transition-colors focus-visible:ring-2 focus-visible:outline-none"

const ContactForm = () => {
  const t = useTranslations()
  const [state, formAction, isPending] = useActionState(sendContactEmail, initialState)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (!state.message) return
    if (state.success) {
      toast.success(state.message)
      formRef.current?.reset()
    } else if (state.message && !state.errors) {
      toast.error(state.message)
    }
  }, [state])

  return (
    <form ref={formRef} action={formAction} className="space-y-6" noValidate>
      {/* Honeypot - hidden from real users */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="honeypot">Ne pas remplir</label>
        <input type="text" id="honeypot" name="honeypot" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <label htmlFor="name" className={labelClass}>
          {t("contact.name")} <span className="text-primary">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          minLength={2}
          maxLength={100}
          className={fieldClass}
          placeholder={t("contact.name")}
          aria-describedby={state.errors?.name ? "name-error" : undefined}
          aria-invalid={state.errors?.name ? true : undefined}
        />
        {state.errors?.name && (
          <p id="name-error" className="mt-1.5 font-sans text-sm text-red-400" role="alert">
            {state.errors.name[0]}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>
          {t("contact.email")} <span className="text-primary">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          className={fieldClass}
          placeholder={t("contact.email")}
          aria-describedby={state.errors?.email ? "email-error" : undefined}
          aria-invalid={state.errors?.email ? true : undefined}
        />
        {state.errors?.email && (
          <p id="email-error" className="mt-1.5 font-sans text-sm text-red-400" role="alert">
            {state.errors.email[0]}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="department" className={labelClass}>
          {t("contact.departmentLabel")} <span className="text-primary">*</span>
        </label>
        <select
          id="department"
          name="department"
          required
          className={fieldClass}
          defaultValue=""
          aria-describedby={state.errors?.department ? "department-error" : undefined}
          aria-invalid={state.errors?.department ? true : undefined}
        >
          <option value="" disabled className="bg-slate-900">
            {t("contact.departmentPlaceholder")}
          </option>
          {DEPARTMENT_OPTIONS.map((dept) => (
            <option key={dept.value} value={dept.value} className="bg-slate-900">
              {dept.label}
            </option>
          ))}
        </select>
        {state.errors?.department && (
          <p id="department-error" className="mt-1.5 font-sans text-sm text-red-400" role="alert">
            {state.errors.department[0]}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="message" className={labelClass}>
          {t("contact.message")} <span className="text-primary">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          minLength={10}
          maxLength={5000}
          rows={6}
          className={`${fieldClass} resize-y`}
          placeholder={t("contact.message")}
          aria-describedby={state.errors?.message ? "message-error" : undefined}
          aria-invalid={state.errors?.message ? true : undefined}
        />
        {state.errors?.message && (
          <p id="message-error" className="mt-1.5 font-sans text-sm text-red-400" role="alert">
            {state.errors.message[0]}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="bg-primary text-primary-foreground hover:bg-ed-amber-deep focus-visible:ring-ring inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 px-6 py-4 font-sans text-xs font-semibold tracking-[0.16em] uppercase transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-50"
      >
        {isPending ? (
          t("contact.sending")
        ) : (
          <>
            <Send className="size-4" aria-hidden="true" />
            {t("contact.send")}
          </>
        )}
      </button>
    </form>
  )
}

export { ContactForm }
