import type { Metadata } from "next"
import { Link } from "@/lib/i18n/routing"
import { getTranslations } from "next-intl/server"
import { ContactForm } from "@/components/contact/contact-form"
import { Marker } from "@/components/editorial/primitives"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pierresenlumieres.fr"

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> => {
  const { locale } = await params
  const t = await getTranslations({ locale })

  return {
    title: t("contact.title"),
    description: t("contact.subtitle"),
    openGraph: {
      title: `${t("contact.title")} — Pierres en Lumières`,
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
  const isEn = locale === "en"

  const coordinates: { label: string; lines: { text: string; href?: string }[] }[] = [
    {
      label: isEn ? "Regional coordination" : "Coordination régionale",
      lines: [
        { text: "Fondation du Patrimoine" },
        { text: isEn ? "Normandy delegation" : "Délégation Normandie" },
        { text: "13 rue Saint-Romain, 76000 Rouen" },
      ],
    },
    {
      label: isEn ? "Press & media" : "Presse & médias",
      lines: [
        { text: "presse@pierresenlumieres.fr", href: "mailto:presse@pierresenlumieres.fr" },
        { text: "+33 2 32 76 24 80", href: "tel:+33232762480" },
      ],
    },
  ]

  return (
    <div>
      {/* Hero */}
      <div className="bg-ed-bg-deep border-primary/25 border-b px-4 py-16 md:px-6 md:py-20">
        <div className="mx-auto max-w-7xl">
          <Marker className="mb-5">{isEn ? "Write to us" : "Nous écrire"}</Marker>
          <h1 className="text-foreground font-display max-w-4xl text-[clamp(2.5rem,8vw,6.5rem)] leading-[0.95] font-normal tracking-[-0.025em] italic">
            {isEn ? (
              <>
                Let&apos;s light a stone <span className="text-primary">together.</span>
              </>
            ) : (
              <>
                Allumons une pierre <span className="text-primary">ensemble.</span>
              </>
            )}
          </h1>
          <p className="text-ed-bone mt-7 max-w-2xl font-serif text-xl font-light italic">
            {t("contact.subtitle")}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-16">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
          {/* Form */}
          <div>
            <Marker as="h2" className="mb-7">
              {t("contact.formTitle")}
            </Marker>
            <ContactForm />
          </div>

          {/* Coordinates */}
          <div className="lg:border-primary/25 lg:border-l lg:pl-16">
            <Marker as="h2" className="mb-7">
              {isEn ? "Contact details" : "Coordonnées"}
            </Marker>
            <div className="grid gap-8">
              {coordinates.map((block) => (
                <div key={block.label} className="border-primary/20 border-b pb-7">
                  <h3 className="text-primary mb-3 font-mono text-xs tracking-[0.2em] uppercase">
                    {block.label}
                  </h3>
                  {block.lines.map((line, i) => (
                    <p
                      key={line.text}
                      className={
                        i === 0
                          ? "text-foreground font-display text-xl font-normal italic"
                          : "text-ed-bone font-serif text-base opacity-80"
                      }
                    >
                      {line.href ? (
                        <a
                          href={line.href}
                          className="hover:text-primary focus-visible:ring-primary/50 underline-offset-4 transition-colors hover:underline focus-visible:rounded-sm focus-visible:ring-2 focus-visible:outline-none"
                        >
                          {line.text}
                        </a>
                      ) : (
                        line.text
                      )}
                    </p>
                  ))}
                </div>
              ))}

              {/* Register CTA */}
              <div className="bg-ed-bg-soft border-primary/25 border p-6">
                <h3 className="text-primary mb-3 font-mono text-xs tracking-[0.2em] uppercase">
                  {t("contact.registerTitle")}
                </h3>
                <p className="text-ed-bone mb-5 font-serif text-base font-light">
                  {t("contact.registerDescription")}
                </p>
                <Link
                  href="/inscription"
                  className="bg-primary text-primary-foreground hover:bg-ed-amber-deep focus-visible:ring-ring inline-flex items-center px-5 py-3 font-sans text-xs font-semibold tracking-[0.14em] uppercase transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  {t("contact.registerCta")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactPage
