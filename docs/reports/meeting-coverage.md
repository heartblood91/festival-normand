# Couverture du bilan PEL 2026 (réunion du 29/06/2026)

Relecture de la transcription complète (420 lignes), item F1 du goal
`pel-design-rgaa`. Chaque demande est rapprochée du code et d'un test.

Les tests cités passent sur le build de production local (`pnpm build`, `next start`,
`pnpm test:e2e` : 235 tests verts le 2026-11-11, commit `dd75c59`).

## Vérifié de bout en bout (F1)

| Fonction | Test e2e | Commit |
| --- | --- | --- |
| Thème Millénaire : filtre, section d'accueil, marqueur de carte, admin | `themes.spec.ts` (2 tests) | `37be1ad` |
| Carnet de voyage sans compte, impression, envoi, **liste partagée ouverte en lecture seule par un autre visiteur** | `travel-book.spec.ts` (4 tests) | `4ceaabf` |
| Collectes de la Fondation près de chaque site | `fundraising.spec.ts` (3 tests) | `2c00a3e` |
| Crédit discret du développeur dans le pied de page, FR et EN | `layout.spec.ts` « footer credits the developer discreetly, in each language » | `556e927` |
| Date de publication par département (embargo des imports Tourinsoft) | `embargo.spec.ts` : masquage du programme, fiche en 404, retour après levée | `777a7cc`, `dd75c59` |

Le test d'embargo a révélé deux défauts, corrigés dans `dd75c59` :

- **Le programme restait périmé une visite de plus.** `revalidateTag(tag, "default")`
  ne fait que du stale-while-revalidate en Next 16. Les actions « Édition » et
  « Date de publication » utilisent maintenant `updateTag`.
- **La fiche restait en 404 après la levée de l'embargo.** Le 404 était gardé en
  cache ISR jusqu'à 30 minutes. L'action revalide aussi la route
  `/[locale]/(public)/evenement/[slug]`.

Captures : `docs/screenshots/design/f1/f1-embargo-admin-1920.png` et
`docs/screenshots/design/f1/f1-embargo-lifted-1920.png`.

## Toutes les demandes de la réunion

| # | Demande | Statut | Preuve ou manque |
|---|---|---|---|
| 1 | Dates du festival modifiables sans développeur | fait | `71b99cc`, `edition-dates-form.tsx` |
| 2 | Édition 2027 les 21, 22 et 23 mai | fait | `71b99cc` (valeur par défaut) |
| 3 | Choisir plusieurs dates dans le filtre | fait | `0b9831b`, `events.spec` « several nights can be selected together » |
| 4 | Replacer en Normandie les événements mal géolocalisés | fait | `4054029`, `lib/geo/normandy.ts` |
| 5 | Carte de la fiche plus lisible, site courant en rouge | fait | `6186a8a`, `event-detail.spec` |
| 6 | Sur une fiche, proposer les sites proches le même jour | fait | `lib/events/nearby.ts`, `nearby-suggestions.tsx` |
| 7 | Favoris sans compte, tri, impression, envoi par mail | fait | `4ceaabf`, `travel-book.spec` |
| 8 | Partager la liste entre téléphone et ordinateur | fait, sans compte | Lien partagé en lecture seule et importable |
| 9 | « Infos en plus » dans le carnet imprimé | partiel | Contenu « à déterminer » en réunion : backlog M19 |
| 10 | Thème Millénaire filtrable, choisi depuis l'admin | fait | `37be1ad`, `themes.spec` |
| 11 | Logo Millénaire sur la carte à la place du rond | fait | Repère, emblème et logotype dessinés pour le site (`public/themes/`), sans copier le logo officiel de la Région. Remplaçables dans le formulaire du thème. Thème limité à 2027 et habillage du site : `docs/habillages.md`, `skins.spec` |
| 12 | Bloquer les offres d'un département jusqu'à sa conférence de presse | fait | `777a7cc`, `dd75c59`, `embargo.spec` |
| 13 | Lien vers la collecte en cours d'un site | fait | `2c00a3e`, `fundraising.spec` |
| 14 | Bannière PEL / Millénaire sur les pages don de la Fondation | hors dépôt | CMS de la Fondation : backlog M5 |
| 15 | Page d'inscription plus claire | fait | `d0615dd`, `inscription.spec` |
| 16 | Traduction auto, outils SEO et accessibilité, aperçu admin | fait | `ba598fb`, `admin-publish.spec` |
| 17 | Partenaires ordonnés, événement à la une, PMR | fait | champs `order`, `featured`, `accessible` |
| 18 | Pages modifiables, « il manque des petits blocs » | fait | Éditeur riche FR/EN, plus encadré « À noter » ou « Important » et bouton d'action (`markdown-content.test`, `admin-images.spec`) |
| 19 | Accessibilité du site public | fait | `7109234`, `a689a01`, specs `a11y-*` |
| 20 | Accueil vivant en deux états | fait | `f7c90be`, `eb9d219` |
| 21 | Correction auto des textes Tourinsoft | partiel | Outil manuel seulement : backlog M14, dépend de M16 |
| 22 | Import Tourinsoft en continu | fait | `f4f9b8b`, `232d775` |
| 23 | Préprod et prod | fait | Branches `staging` et `main` |
| 24 | Testable fin d'été, version officielle au 1er janvier 2027 | en cours | Bascule à autoriser par Cédric |
| 25 | Questionnaire visiteurs | pas fait | Backlog M8/M9 |
| 26 | Statistiques publiques | pas fait | Backlog M10 |
| 27 | Galerie « Retour en images » | pas fait | Backlog M11 |
| 28 | Avis et photos des visiteurs modérés par IA | pas fait | Backlog M17 |
| 29 | Réseaux sociaux par site | pas fait | Backlog M18 |
| 30 | Lien Wikipédia (historique du lieu) | **ajouté au goal (F2)** | Champ facultatif non synchronisé, lien sur la fiche |
| 31 | Comptes associations, site toute l'année | pas fait | Backlog M15 |
| 32 | Coordonnées du Midway | hors dépôt | Carte des projets du site de la Fondation |
| 33 | Liste des personnes ayant accès à l'admin | à organiser | Gestion des utilisateurs prête (`admin/users`) |
| 34 | Convention, cession de droits, concours photo | organisationnel | Les droits de l'Eure manquaient : bloquent la mise en ligne de ses offres |

Quatre sujets suivis par Cédric ne figurent pas dans la transcription : la barre de
crédit du pied de page, « la connexion sur mes comptes », les sites oubliés et le carnet
partagé en lecture seule. Ils sont couverts quand même : pied de page et carnet ci-dessus,
sites oubliés par l'item R1. « La connexion sur mes comptes » était une dictée qui
visait la barre de crédit du pied de page (liens vers les comptes de Cédric) : couverte
par la ligne « Crédit discret du développeur » (précision de Cédric, 11/11/2026).

## Décisions

- **Ajouté au périmètre : F2, lien « Historique du lieu ».** C'est simple et indépendant
  de Tourinsoft : un champ facultatif que la synchro ne touche pas, et un lien sur la fiche.
- **Au backlog (`docs/backlog-2027.md`)** :
  - **M16, verrou par champ des offres Tourinsoft.** La synchro réécrit 19 champs, dont
    les coordonnées et la description, donc une correction manuelle est perdue à la mise
    à jour amont suivante. Les délégations doivent choisir les champs verrouillables.
  - **M17, avis visiteurs.** Il faut un modérateur humain (Marc), et on attend peu d'avis
    pour environ 400 événements.
  - **M18, réseaux sociaux.** Marc et Alizée sont réservés sur l'utilité.
  - **M19, contenu du carnet imprimé.** Il est à définir avec Marc.
  - **M11, galerie.** Une version légère, sans dépôt par le public, est possible dès que
    les droits des photos du concours sont confirmés.
