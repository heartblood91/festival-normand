# Backlog PEL 2027 — hors périmètre du goal `pel-2027`

Ces items viennent du bilan PEL 2026 (réunion du 29/06/2026). Ils sont listés
ici seulement, sans code. Chaque fiche indique le besoin exprimé, une piste
technique et ce qu'il faut décider avant de commencer.

| ID | Sujet | Priorité proposée | Prérequis |
| --- | --- | --- | --- |
| M8/M9 | Questionnaire visiteurs (et retour organisateurs) | Haute avant mai 2027 | Questions validées par les délégations, RGPD |
| M10 | Statistiques publiques | Moyenne | Choix des chiffres publiés, source des comptages |
| M11 | Galerie photos | Moyenne | Droits à l'image, modération, stockage |
| M5 | Bannière de dons sur le site de la Fondation | Moyenne | Accès au CMS de fondation-patrimoine.org (hors de ce dépôt) |
| M15 | Site actif toute l'année | Basse | Contenu éditorial hors festival |
| M12/M13 | Non définis dans l'extrait de réunion | — | Définition par Cédric |
| M14 | Nettoyage IA des textes Tourinsoft | Basse | `OPENROUTER_API_KEY`, validation éditeur |

## M8/M9 — Questionnaire visiteurs

**Besoin.** En 2026, les délégations ont reçu peu de réponses : 28 pour une
délégation, 37 pour une autre, contre environ 3 000 à 9 000 visiteurs. Les
participants ont mis en cause le QR code des supports papier. Les organisateurs
ont aussi un questionnaire, géré hors du site.

**Piste.**
- Formulaire court sur le site : 5 questions maximum, sans compte, sans donnée
  personnelle obligatoire.
- Le lien est mis en avant pendant et après le festival : bandeau sur l'accueil
  en mode bilan, rappel sur la fiche événement, lien dans le carnet de voyage
  (P3.2).
- Modèle `SurveyResponse` qui stocke l'édition, l'événement facultatif et les
  réponses en JSON.
- Export CSV dans l'admin, protégé par `requireRole("EDITOR")`.
- Anti-spam : honeypot et limite de débit.
- Garder une version papier comme alternative, car le QR code seul ne
  fonctionne pas.

**À décider.**
- Liste des questions.
- Durée de conservation des réponses.
- Mention RGPD si un e-mail est demandé.
- Gestion du questionnaire organisateurs : sur le site, ou garder l'outil
  actuel.

## M10 — Statistiques publiques

**Besoin.** Pendant la réunion, Marc Boucaut a proposé de rendre les
statistiques accessibles au public, et Cédric était d'accord. Les chiffres
existent déjà dans les bilans des délégations : visiteurs, communes,
manifestations, porteurs de projet.

**Piste.**
- Modèle `EditionStats` par édition et par département, saisi dans l'admin.
- Calcul automatique de ce qui est déjà en base (nombre d'événements publiés,
  communes, catégories).
- Bloc « L'édition en chiffres » dans l'accueil en mode bilan, plus une page
  `/[locale]/bilan/[annee]`.
- Graphiques accessibles : chaque graphique a aussi son tableau de données.

**À décider.**
- Quels chiffres sont publiables.
- Si les estimations de visiteurs sont publiées.
- Si les chiffres par délégation sont publiés, ou seulement le total régional.

## M11 — Galerie photos

**Besoin.** Les photos comptent beaucoup pour la communication et les réseaux
sociaux. Les délégations demandent aux porteurs de projet d'en envoyer.

**Piste.**
- Dépôt par les porteurs de projet via un lien par événement, sans compte : un
  jeton sur le modèle de `TravelBook`.
- Modération dans l'admin : chaque photo passe par l'état « en attente »,
  puis « publiée » ou « refusée ».
- Texte alternatif obligatoire, comme pour les couvertures (P2).
- Galerie sur la fiche événement et page « Retour en images » par édition.
- Stockage Vercel Blob (preset existant) et redimensionnement.

**À décider.**
- Cession des droits à l'image et autorisation des personnes photographiées.
- Crédit du photographe.
- Quota par événement.

## M5 — Bannière de dons sur le site de la Fondation

**Besoin.** Le site de la Fondation du patrimoine peut afficher des bannières
« faire un don » sur ses pages. Les participants ont proposé une bannière
Pierres en Lumières sur les pages des projets de la délégation Normandie.

**Piste.**
- Ce dépôt fournit seulement les visuels et un lien de campagne avec UTM, par
  exemple vers `/fr?utm_source=fondation-patrimoine`.
- La pose de la bannière se fait dans le CMS de fondation-patrimoine.org,
  hors de notre périmètre.
- La correspondance entre collectes et sites est déjà faite en P3.3
  (collectes proches). Elle peut servir à choisir les pages concernées.

**À décider.**
- Format de la bannière.
- Qui pose la bannière côté Fondation.
- Période d'affichage.

## M15 — Site actif toute l'année

**Besoin.** En dehors du week-end de mai, le site ne doit pas paraître vide.

**Piste.**
- Le mode bilan existe déjà (P1.2). Il faut l'enrichir :
  - les actualités ;
  - les thématiques (P3.1, par exemple le Millénaire) ;
  - les statistiques (M10) ;
  - la galerie (M11) ;
  - l'appel à inscription quand les inscriptions Tourinsoft sont ouvertes.
- Archives des éditions précédentes, à partir de l'import Directus v1
  (`scripts/import-directus-archive.ts`, WIP Hermès).

**À décider.**
- Rythme de publication des actualités.
- Publication ou non des archives v1 (424 événements).

## M12/M13 — À définir

Le goal cite M12 et M13 dans le lot P4, mais l'extrait de réunion ne les
définit pas. Cédric doit les préciser avant toute estimation.

## M14 — Nettoyage IA des textes Tourinsoft

Déplacé ici depuis P2.5.

**Piste.**
- Proposition de réécriture : orthographe, ton, longueur.
- La proposition s'affiche à côté du texte d'origine, et l'éditeur l'accepte
  champ par champ.
- On réutilise le client OpenRouter des boutons Traduire / SEO / RGAA (P2.2).
- Une resynchronisation Tourinsoft ne doit pas écraser un texte validé. Cela
  suit la règle « champs synchronisés » de P2.5.

**Bloqueur.** `OPENROUTER_API_KEY` est absente de l'environnement local.
