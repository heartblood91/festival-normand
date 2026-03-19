import type { Metadata } from "next"
import Link from "next/link"
import { getTranslations } from "next-intl/server"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pierresenlumieres.fr"

export const generateMetadata = async ({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> => {
  const { locale } = await params
  const frenchTitle = "Déclaration d'accessibilité"
  const englishTitle = "Accessibility Statement"
  const frenchDesc = "Déclaration d'accessibilité du site Pierres en Lumières conformément au RGAA 4.1."
  const englishDesc = "Accessibility statement for the Stones in Lights website in accordance with RGAA 4.1."

  const title = locale === "en" ? englishTitle : frenchTitle
  const description = locale === "en" ? englishDesc : frenchDesc

  return {
    title,
    description,
    alternates: {
      languages: {
        fr: `${BASE_URL}/fr/accessibilite`,
        en: `${BASE_URL}/en/accessibilite`,
      },
    },
  }
}

export const revalidate = 86400

type AccessibilitePageProps = {
  params: Promise<{ locale: string }>
}

const AccessibilitePage = async ({ params }: AccessibilitePageProps) => {
  const { locale } = await params
  const t = await getTranslations()
  const isEnglish = locale === "en"

  return (
  <div className="mx-auto max-w-3xl px-4 py-12 md:py-16">
    <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
      {isEnglish ? "Accessibility Statement" : "Déclaration d'accessibilité"}
    </h1>

    <div className="mt-8 space-y-6 text-muted-foreground">
      <p>
        {isEnglish
          ? "Pierres en Lumières is committed to making its website accessible in accordance with RGAA 4.1."
          : "Pierres en Lumières s'engage à rendre son site internet accessible conformément à l'article 47 de la loi n° 2005-102 du 11 février 2005."}
      </p>

      <div>
        <h2 className="font-serif text-xl font-bold text-foreground">
          {isEnglish ? "Conformity Status" : "État de conformité"}
        </h2>
        <p className="mt-2">
          {isEnglish
            ? "This website is non-conformant with the General Reference for Digital Accessibility Improvement (RGAA), version 4.1. No conformity audit has been conducted yet."
            : "Ce site est "}
          {!isEnglish && <strong className="text-foreground">non conforme</strong>}
          {!isEnglish && " avec le référentiel général d'amélioration de l'accessibilité (RGAA), version 4.1. Aucun audit de conformité n'a encore été réalisé."}
        </p>
      </div>

      <div>
        <h2 className="font-serif text-xl font-bold text-foreground">
          {isEnglish ? "Non-accessible Content" : "Contenus non accessibles"}
        </h2>
        <ul className="mt-2 list-disc space-y-2 pl-6">
          {isEnglish ? (
            <>
              <li>Some externally sourced images may lack optimal text alternatives.</li>
              <li>The interactive map (Mapbox) has limited accessibility for screen reader users.</li>
            </>
          ) : (
            <>
              <li>Certaines images importées depuis des sources externes peuvent ne pas disposer d'alternatives textuelles optimales.</li>
              <li>La carte interactive (Mapbox) dispose d'une accessibilité limitée pour les utilisateurs de lecteurs d'écran.</li>
            </>
          )}
        </ul>
      </div>

      <div>
        <h2 className="font-serif text-xl font-bold text-foreground">
          {isEnglish ? "Accessibility Measures Implemented" : "Mesures d'accessibilité mises en œuvre"}
        </h2>
        <ul className="mt-2 list-disc space-y-2 pl-6">
          {isEnglish ? (
            <>
              <li>Skip link to main content</li>
              <li>Complete keyboard navigation</li>
              <li>Consistent heading hierarchy</li>
              <li>Identified navigation zones (ARIA landmarks)</li>
              <li>Compliant contrast ratios (minimum 4.5:1)</li>
              <li>Text alternatives for images</li>
              <li>Forms with associated labels</li>
              <li>Breadcrumbs on detail pages</li>
              <li>Respect for prefers-reduced-motion setting</li>
            </>
          ) : (
            <>
              <li>Lien d'évitement vers le contenu principal</li>
              <li>Navigation complète au clavier</li>
              <li>Hiérarchie de titres cohérente</li>
              <li>Zones de navigation identifiées (landmarks ARIA)</li>
              <li>Ratios de contraste conformes (minimum 4.5:1)</li>
              <li>Alternatives textuelles sur les images</li>
              <li>Formulaires avec étiquettes associées</li>
              <li>Fil d'Ariane sur les pages de détail</li>
              <li>Respect du paramètre prefers-reduced-motion</li>
            </>
          )}
        </ul>
      </div>

      <div>
        <h2 className="font-serif text-xl font-bold text-foreground">
          {isEnglish ? "Feedback and Contact" : "Retour d'information et contact"}
        </h2>
        <p className="mt-2">
          {isEnglish
            ? "If you are unable to access content or a service, you can contact the site administrator to be directed to an accessible alternative or to obtain the content in another format."
            : "Si vous n'arrivez pas à accéder à un contenu ou à un service, vous pouvez contacter le responsable du site pour être orienté vers une alternative accessible ou obtenir le contenu sous une autre forme."}
        </p>
        <p className="mt-2">
          {isEnglish ? "Contact us via our " : "Contactez-nous via notre "}
          <Link href={`/${locale}/contact`} className="text-primary underline hover:text-primary/80">
            {isEnglish ? "contact form" : "formulaire de contact"}
          </Link>
          {isEnglish ? "." : "."}
        </p>
      </div>

      <div>
        <h2 className="font-serif text-xl font-bold text-foreground">
          {isEnglish ? "Legal Recourse" : "Voies de recours"}
        </h2>
        <p className="mt-2">
          {isEnglish
            ? "If you encounter an accessibility problem preventing you from accessing content or a site feature, and you are unable to obtain a response from us, you have the right to submit a complaint to the French Data Protection Authority (CNIL)."
            : "Si vous constatez un défaut d'accessibilité vous empêchant d'accéder à un contenu ou une fonctionnalité du site, que vous nous le signalez et que vous ne parvenez pas à obtenir une réponse de notre part, vous êtes en droit de faire parvenir vos doléances ou une demande de saisine au Défenseur des droits."}
        </p>
      </div>

      <p className="text-sm">
        {isEnglish ? "Last updated: March 2026" : "Dernière mise à jour : mars 2026"}
      </p>
    </div>
  </div>
  )
}

export default AccessibilitePage
