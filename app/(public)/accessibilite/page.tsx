import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Déclaration d'accessibilité",
  description: "Déclaration d'accessibilité du site Pierres en Lumières conformément au RGAA 4.1.",
}

export const revalidate = 86400

const AccessibilitePage = () => (
  <div className="mx-auto max-w-3xl px-4 py-12 md:py-16">
    <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
      Déclaration d'accessibilité
    </h1>

    <div className="mt-8 space-y-6 text-muted-foreground">
      <p>
        Pierres en Lumières s'engage à rendre son site internet accessible conformément
        à l'article 47 de la loi n° 2005-102 du 11 février 2005.
      </p>

      <div>
        <h2 className="font-serif text-xl font-bold text-foreground">
          État de conformité
        </h2>
        <p className="mt-2">
          Ce site est <strong className="text-foreground">non conforme</strong> avec
          le référentiel général d'amélioration de l'accessibilité (RGAA), version 4.1.
          Aucun audit de conformité n'a encore été réalisé.
        </p>
      </div>

      <div>
        <h2 className="font-serif text-xl font-bold text-foreground">
          Contenus non accessibles
        </h2>
        <ul className="mt-2 list-disc space-y-2 pl-6">
          <li>Certaines images importées depuis des sources externes peuvent ne pas disposer d'alternatives textuelles optimales.</li>
          <li>La carte interactive (Mapbox) dispose d'une accessibilité limitée pour les utilisateurs de lecteurs d'écran.</li>
        </ul>
      </div>

      <div>
        <h2 className="font-serif text-xl font-bold text-foreground">
          Mesures d'accessibilité mises en œuvre
        </h2>
        <ul className="mt-2 list-disc space-y-2 pl-6">
          <li>Lien d'évitement vers le contenu principal</li>
          <li>Navigation complète au clavier</li>
          <li>Hiérarchie de titres cohérente</li>
          <li>Zones de navigation identifiées (landmarks ARIA)</li>
          <li>Ratios de contraste conformes (minimum 4.5:1)</li>
          <li>Alternatives textuelles sur les images</li>
          <li>Formulaires avec étiquettes associées</li>
          <li>Fil d'Ariane sur les pages de détail</li>
          <li>Respect du paramètre prefers-reduced-motion</li>
        </ul>
      </div>

      <div>
        <h2 className="font-serif text-xl font-bold text-foreground">
          Retour d'information et contact
        </h2>
        <p className="mt-2">
          Si vous n'arrivez pas à accéder à un contenu ou à un service, vous pouvez
          contacter le responsable du site pour être orienté vers une alternative accessible
          ou obtenir le contenu sous une autre forme.
        </p>
        <p className="mt-2">
          Contactez-nous via notre <Link href="/contact" className="text-primary underline hover:text-primary/80">formulaire de contact</Link>.
        </p>
      </div>

      <div>
        <h2 className="font-serif text-xl font-bold text-foreground">
          Voies de recours
        </h2>
        <p className="mt-2">
          Si vous constatez un défaut d'accessibilité vous empêchant d'accéder à un contenu
          ou une fonctionnalité du site, que vous nous le signalez et que vous ne parvenez pas
          à obtenir une réponse de notre part, vous êtes en droit de faire parvenir vos doléances
          ou une demande de saisine au Défenseur des droits.
        </p>
      </div>

      <p className="text-sm">
        Dernière mise à jour : mars 2026
      </p>
    </div>
  </div>
)

export default AccessibilitePage
