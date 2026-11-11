# Audit visuel — Pierres en Lumières (D1, 2026-11-10)

Lecture seule de la prod `https://pierres-en-lumieres.my-dev-box.ovh` (code `6b2ae78`) pour les
pages publiques. L'admin a été capturé sur un build de production local (`next start`, base
locale `pel-audit-db:5435`), parce que la connexion admin en prod demande un compte réel.

Captures : `docs/screenshots/design/before/before-<page>-<1440|390>.png` (12 pages publiques,
8 écrans admin et la page de connexion, à 1440 et 390 px). Script :
`pnpm tsx scripts/capture-pages.ts [--admin] --base <url> --out <dir> --prefix before`.

## Mesures automatiques (toutes les pages, 1440 et 390)

| Mesure | Résultat |
| --- | --- |
| Débordement horizontal | aucun (0/42) |
| Nombre de `h1` | 1 sur chaque page |
| Images sans attribut `alt` | 0 |
| Images cassées | 0 |
| Erreurs console | 2 × 404 `/_vercel/insights` et `/_vercel/speed-insights` sur chaque page (hébergement Dokploy, pas Vercel) |

## Constats et corrections prévues

| # | Page | Constat | Correction (item) |
| --- | --- | --- | --- |
| 1 | Accueil | Grille partenaires : une case vide (fond brun) quand le nombre de logos ne remplit pas la ligne. | Grille fluide centrée, sans case de remplissage (D2). |
| 2 | Accueil | Liste des départements : le nombre d'événements n'apparaît que pour le Calvados. | Afficher le nombre pour chaque département, « bientôt » si 0 (D2). |
| 3 | Accueil | `hero.mp4` renvoie 404 en prod : la vidéo est demandée mais absente. | Vidéo seulement si le fichier existe, sinon image fixe (D2). |
| 4 | Accueil (390) | Libellés en majuscules monospace très petits ; le surtitre du hero passe sur deux lignes. | Taille minimale 12 px, espacement des lettres réduit sur mobile (D2). |
| 5 | Accueil | Section Millénaire vide quand aucun site n'est marqué. | État vide explicite avec lien vers le programme (D2). |
| 6 | Accueil | Carte terne, petits marqueurs. | Marqueurs plus grands et lisibles, état survol/focus (D3). |
| 7 | Accueil | Aperçu du programme : Pontécoulant apparaît deux fois (doublon de données, voir 15). | Dédoublonnage des données (R1) ; l'aperçu reste piloté par les données. |
| 8 | Programme | 413 événements listés, dont ceux de 2026, sous l'en-tête 2027. La fiche d'un événement 2026 s'affiche sans indication d'archive. | Filtre par défaut sur l'édition en cours ; filtre « éditions précédentes » et badge « Édition 2026 » sur les fiches archivées (D2). Décision provisoire, configurable. |
| 9 | Inscription | Le `title` de l'iframe YouTube est l'URL brute (critère RGAA 2.2). | Titre explicite de l'iframe (D2). |
| 10 | Inscription | Texte CMS périmé (« édition 2026 … 17 novembre 2025 »). | Contenu éditeur : à mettre à jour dans l'admin (signalé, pas de correction de code). |
| 11 | Inscription | Cartes départements « bientôt en ligne » : liens d'inscription non renseignés en prod. | Données admin à renseigner (signalé). |
| 12 | Page festival | Contenu CMS avec les dates 2026. | Contenu éditeur (signalé). |
| 13 | 404 | Page hors charte (ancien style, sans en-tête ni pied de page). | Page 404 éditoriale avec en-tête, pied de page et liens utiles (D2). |
| 14 | Carnet | État vide très sobre (texte seul). | État vide illustré avec appel à l'action vers le programme (D2). |
| 15 | Données prod | Doublon `lumieres-au-chateau-de-pontecoulant-1` (saisi à la main, sans `tourinsoftId`) et `-2` (créé par la synchro). | La synchro rapproche titre + commune avant de créer (R1) ; l'éditeur dépublie le doublon. |
| 16 | Contact | Le formulaire échoue avec une erreur générique quand Resend n'est pas configuré (cas de la prod). | Message clair et lien `mailto:` vers le département quand l'envoi d'e-mails est désactivé (D2). |
| 17 | Toutes | Scripts Vercel Analytics chargés hors Vercel (404). | Ne charger Analytics que sur Vercel (D2). |
| 18 | Admin, formulaire (390) | Barre d'outils de l'éditeur riche : boutons de ~28 px (sous la cible de 44 px) ; la barre d'actions fixe recouvre le dernier champ visible. | Cibles de 44 px sur mobile, marge basse sous la barre fixe (A3/D4). |
| 19 | Admin, formulaire | « IA indisponible » en petit texte gris, sans explication. | Libellé plus clair (« IA non configurée ») avec infobulle (D4). |
| 20 | Admin, tableau de bord | Cartes de comptage et listes « Brouillons/Dépubliés » correctes ; les compteurs à 0 n'ont pas d'état vide. | État vide et lien direct vers la liste filtrée (D4). |
| 21 | Admin, événements | Lisible à 1440. À 390, le tableau garde 4 colonnes : le statut n'est plus qu'une icône (œil), les icônes d'action n'ont pas de libellé visible, les filtres font 32 px de haut. | Statut en texte court sur mobile, nom accessible et infobulle des icônes (A2/D4), filtres de 44 px (A3). |

## Ce qui fonctionne déjà

- Charte respectée sur les pages éditoriales (marine, ambre, Playfair/Inter), pas de débordement.
- Un seul `h1` par page, toutes les images ont un `alt`.
- L'admin est cohérent (barre latérale, filtres, badges de statut et de source).
