import type { Metadata } from "next"
import Link from "next/link"
import { Mail, CalendarPlus } from "lucide-react"
import { ContactForm } from "@/components/contact/contact-form"

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contactez l'équipe Pierres en Lumières. Envoyez-nous un message pour toute question concernant le festival du patrimoine normand.",
  openGraph: {
    title: "Contact - Pierres en Lumières",
    description:
      "Contactez l'équipe Pierres en Lumières pour toute question concernant le festival du patrimoine normand.",
  },
}

const ContactPage = () => {
  return (
    <section className="mx-auto max-w-6xl px-4 py-8 md:py-12 lg:py-16">
      <h1 className="mb-8 font-serif text-3xl font-bold text-white md:text-4xl lg:text-5xl">
        Contactez-nous
      </h1>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Left column - Info */}
        <div className="space-y-6">
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl md:p-8">
            <div className="mb-4 flex items-center gap-3">
              <Mail
                className="size-6 text-amber-500"
                aria-hidden="true"
              />
              <h2 className="font-serif text-xl font-semibold text-white md:text-2xl">
                Nous écrire
              </h2>
            </div>
            <p className="leading-relaxed text-white/70">
              Vous avez une question sur le festival Pierres en Lumières ?
              Vous souhaitez obtenir des informations sur un événement dans
              votre département ? N&apos;hésitez pas à nous contacter via le
              formulaire ci-contre. Nous vous répondrons dans les meilleurs
              délais.
            </p>
            <p className="mt-4 leading-relaxed text-white/70">
              Votre message sera automatiquement transmis au correspondant
              de votre département.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl md:p-8">
            <div className="mb-4 flex items-center gap-3">
              <CalendarPlus
                className="size-6 text-amber-500"
                aria-hidden="true"
              />
              <h2 className="font-serif text-xl font-semibold text-white md:text-2xl">
                Inscrivez votre événement
              </h2>
            </div>
            <p className="mb-4 leading-relaxed text-white/70">
              Vous êtes propriétaire ou gestionnaire d&apos;un site
              patrimonial en Normandie ? Participez à Pierres en Lumières
              en inscrivant votre événement.
            </p>
            <Link
              href="/inscription"
              className="inline-flex min-h-[44px] items-center rounded-lg border border-amber-500/30 bg-amber-500/10 px-6 py-3 font-medium text-amber-400 transition-colors hover:bg-amber-500/20 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
            >
              Inscrivez votre événement
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
