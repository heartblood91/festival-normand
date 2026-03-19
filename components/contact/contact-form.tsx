"use client"

import { useActionState } from "react"
import { useEffect, useRef } from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DEPARTMENT_OPTIONS } from "@/lib/contact-schema"
import {
  sendContactEmail,
  type ContactActionResult,
} from "@/lib/actions/contact"

const initialState: ContactActionResult = {
  success: false,
  message: "",
}

const ContactForm = () => {
  const t = useTranslations()
  const [state, formAction, isPending] = useActionState(
    sendContactEmail,
    initialState
  )

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
    <form
      ref={formRef}
      action={formAction}
      className="space-y-6"
      noValidate
    >
      {/* Honeypot - hidden from real users */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="honeypot">Ne pas remplir</label>
        <input
          type="text"
          id="honeypot"
          name="honeypot"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div>
        <label
          htmlFor="name"
          className="mb-2 block text-sm font-medium text-white/80"
        >
          {t("contact.name")} <span className="text-amber-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          minLength={2}
          maxLength={100}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white backdrop-blur-xl placeholder:text-white/40 focus-visible:border-amber-500/50 focus-visible:ring-2 focus-visible:ring-amber-500/20 focus-visible:outline-none"
          placeholder={t("contact.name")}
          aria-describedby={state.errors?.name ? "name-error" : undefined}
          aria-invalid={state.errors?.name ? true : undefined}
        />
        {state.errors?.name && (
          <p id="name-error" className="mt-1 text-sm text-red-400" role="alert">
            {state.errors.name[0]}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-medium text-white/80"
        >
          {t("contact.email")} <span className="text-amber-500">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white backdrop-blur-xl placeholder:text-white/40 focus-visible:border-amber-500/50 focus-visible:ring-2 focus-visible:ring-amber-500/20 focus-visible:outline-none"
          placeholder={t("contact.email")}
          aria-describedby={state.errors?.email ? "email-error" : undefined}
          aria-invalid={state.errors?.email ? true : undefined}
        />
        {state.errors?.email && (
          <p
            id="email-error"
            className="mt-1 text-sm text-red-400"
            role="alert"
          >
            {state.errors.email[0]}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="department"
          className="mb-2 block text-sm font-medium text-white/80"
        >
          {t("contact.departmentLabel")} <span className="text-amber-500">*</span>
        </label>
        <select
          id="department"
          name="department"
          required
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white backdrop-blur-xl focus-visible:border-amber-500/50 focus-visible:ring-2 focus-visible:ring-amber-500/20 focus-visible:outline-none"
          defaultValue=""
          aria-describedby={
            state.errors?.department ? "department-error" : undefined
          }
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
          <p
            id="department-error"
            className="mt-1 text-sm text-red-400"
            role="alert"
          >
            {state.errors.department[0]}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="message"
          className="mb-2 block text-sm font-medium text-white/80"
        >
          {t("contact.message")} <span className="text-amber-500">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          minLength={10}
          maxLength={5000}
          rows={6}
          className="w-full resize-y rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white backdrop-blur-xl placeholder:text-white/40 focus-visible:border-amber-500/50 focus-visible:ring-2 focus-visible:ring-amber-500/20 focus-visible:outline-none"
          placeholder={t("contact.message")}
          aria-describedby={
            state.errors?.message ? "message-error" : undefined
          }
          aria-invalid={state.errors?.message ? true : undefined}
        />
        {state.errors?.message && (
          <p
            id="message-error"
            className="mt-1 text-sm text-red-400"
            role="alert"
          >
            {state.errors.message[0]}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isPending}
        size="lg"
        className="min-h-[44px] w-full cursor-pointer bg-amber-500 py-3 text-base font-semibold text-slate-900 hover:bg-amber-400 disabled:opacity-50"
      >
        {isPending ? (
          t("contact.sending")
        ) : (
          <>
            <Send className="mr-2 size-4" aria-hidden="true" />
            {t("contact.send")}
          </>
        )}
      </Button>
    </form>
  )
}

export { ContactForm }
