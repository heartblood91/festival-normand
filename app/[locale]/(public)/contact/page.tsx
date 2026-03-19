import type { Metadata } from "next"
import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { Mail, CalendarPlus } from "lucide-react"
import { ContactForm } from "@/components/contact/contact-form"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pierresenlumieres.fr"

export const generateMetadata = async ({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> => {
  const { locale } = await params
  const t = await getTranslations({ locale })

  return {
    title: t("contact.title"),
    description: t("contact.subtitle"),
    openGraph: {
      title: `${t("contact.title")} - Pierres en Lumières`,
      description: t("contact.subtitle"),
    },
    alternates: {
      languages: {
        fr: `${BASE_URL}/fr/contact`,
        en: `${BASE_URL}/en/contact`,
      },
    },
  }
}

type ContactPageProps = {
  params: Promise<{ locale: string }>
}

const ContactPage = async ({ params }: ContactPageProps) => {
  const { locale } = await params
  const t = await getTranslations()

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 md:py-12 lg:py-16">
      <h1 className="mb-8 font-serif text-3xl font-bold text-white md:text-4xl lg:text-5xl">
        {t("contact.title")}
      </h1>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Left column - Info */}
        <div className="space-y-6">
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl md:p-8">
            <div className="mb-4 flex items-center gap-3">
              <Mail className="size-6 text-amber-500" aria-hidden="true" />
              <h2 className="font-serif text-xl font-semibold text-white md:text-2xl">
                {t("contact.formTitle")}
              </h2>
            </div>
            <p className="leading-relaxed text-white/70">
              {t("contact.subtitle")}
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl md:p-8">
            <div className="mb-4 flex items-center gap-3">
              <CalendarPlus className="size-6 text-amber-500" aria-hidden="true" />
              <h2 className="font-serif text-xl font-semibold text-white md:text-2xl">
                {t("contact.registerTitle")}
              </h2>
            </div>
            <p className="mb-4 leading-relaxed text-white/70">
              {t("contact.registerDescription")}
            </p>
            <Link
              href={`/${locale}/inscription`}
              className="inline-flex min-h-[44px] items-center rounded-lg border border-amber-500/30 bg-amber-500/10 px-6 py-3 font-medium text-amber-400 transition-colors hover:bg-amber-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              {t("contact.registerCta")}
            </Link>
          </div>
        </div>

        {/* Right column - Form */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl md:p-8">
          <ContactForm />
        </div>
      </div>
    </section>
  )
}

export default ContactPage
