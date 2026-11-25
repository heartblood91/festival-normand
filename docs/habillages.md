# Thématiques par année et habillages du site

## Ce que règle l'admin

Le formulaire d'une thématique (`/admin/themes`, carte « Période et habillage ») a trois champs :

- **Années d'affichage** : vide = toutes les éditions. Avec « 2027 », la thématique n'existe
  sur le site public que pour l'édition 2027 : filtre du programme, section d'accueil, lien sur
  les fiches, épingles de la carte, carnet de voyage. L'année comparée est celle de l'édition
  courante (`/admin/edition`). En 2028, la thématique disparaît d'elle-même. Les événements
  restent rattachés en base : remettre l'année suffit à la faire revenir.
- **Habillage du site** : un décor appliqué à tout le site public, tant que la thématique est
  affichée. Il suit donc les mêmes années. « Aucun habillage » le retire tout de suite.

- **Logo de l'habillage** : l'image du bandeau, à côté du titre. Le Millénaire part de
  l'emblème d'exemple (`/themes/millennium-emblem.svg`) ; téléverser le logo officiel le remplace
  sur tout le site, « Retirer » revient à l'exemple. Image décorative (`alt=""`) : le titre du
  bandeau est déjà écrit à côté.

Si plusieurs thématiques affichées ont un habillage, la première dans l'ordre d'affichage
l'emporte (ordre, puis nom).

La migration `20261111180000_add_theme_years_and_skin` règle le thème Millénaire sur 2027 avec
l'habillage « Millénaire de Guillaume le Conquérant », sauf si un éditeur l'a déjà réglé.
`20261112050000_add_theme_skin_logo` lui donne l'emblème d'exemple comme logo de bandeau.

## L'habillage Millénaire

Il est dans `components/skins/millennium/` :

| Fichier      | Rôle                                                                                                                                                                                      |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ribbon.tsx` | Bandeau rouge au-dessus de l'en-tête : emblème, titre, dates, lien vers les événements de la thématique. C'est une région `complementary` nommée par le titre.                            |
| `frieze.tsx` | Frise de la Tapisserie de Bayeux : photographies de ses vraies bordures, la haute sous l'en-tête, la basse au-dessus du pied de page. Décorative : `aria-hidden`, masquée à l'impression. |
| `copy.ts`    | Textes FR et EN de l'habillage.                                                                                                                                                           |
| `index.ts`   | Emplacements utilisés (`beforeHeader`, `afterHeader`, `beforeFooter`).                                                                                                                    |

Les visuels sont dans `public/themes/` : `millennium-emblem.svg` (bandeau),
`millennium-marker.svg` (épingle de carte) et `millennium-wordmark.svg` (logotype avec texte,
pour la communication). Ils ont été dessinés pour le site : écu rouge, donjon crénelé, bougie.
Ils ne reprennent pas le logo officiel « MILLENIUM – 2027 » de la Région.

### La frise

La « frise officielle » du Millénaire est la Tapisserie de Bayeux elle-même : l'identité
visuelle de la Région (logo, aplats rouges et noirs) n'a pas de frise. La frise du site est donc
faite de **vraies photographies** des bordures de la Tapisserie, pas d'un dessin :

- `millennium-frieze-upper.avif` / `.webp` : bordure haute (animaux affrontés, bandes obliques),
  tirée des scènes 19 (Dinan), 51 (Hastings) et 23 (serment d'Harold) ;
- `millennium-frieze-lower.avif` / `.webp` : bordure basse, tirée des scènes 51, 55 (les
  archers) et 19.

La bordure haute est sous l'en-tête et la basse au-dessus du pied de page : la page se lit
comme la scène principale entre les deux. Chaque bande est encadrée d'un filet ambré
(`border-primary/40`) sur fond `ed-bg-deep`, comme une pièce éclairée dans une vitrine.

Chaque image fait 3820 × 112 px, sans répétition. Elle est centrée et affichée à 44 px de haut
sur mobile (le milieu de la bande : oiseaux affrontés en haut, archers en bas) et à 56 px dès la
tablette (presque toute la bande sur un écran de 1920 px). Au-delà, ses bords se fondent dans le
fond. La hauteur est fixe : pas de décalage de mise en page. La bande du haut est chargée tout de
suite, celle du bas en différé (`loading="lazy"`). L'AVIF pèse 44 et 54 Ko, le WebP de secours
58 et 60 Ko.

Préparation (non versionnée) : chaque bordure a été redressée sur son fil de séparation rouge,
ramenée à la même hauteur et à la même teinte de lin, puis les morceaux ont été raccordés dans
des zones de lin nu, avec un fondu de quelques pixels.

Captures dans `docs/screenshots/frieze-v2/` : accueil en 1920 px (haut et pied de page), en
390 px, et `reference-side-by-side.png`, qui place la bande du site sous la photo de la scène
dont elle est tirée.

**Source et licence.** Photos de Myrabella sur Wikimedia Commons, versées dans le domaine public
(`{{Licensed-PD-Art|1=PD-old-100-expired|2=CC-zero}}`) ; l'œuvre (XIe siècle) est elle-même dans
le domaine public. Aucune mention n'est obligatoire, le crédit est gardé ici :

- https://commons.wikimedia.org/wiki/File:Bayeux_Tapestry_scene19_Dinan.jpg
- https://commons.wikimedia.org/wiki/File:Bayeux_Tapestry_scene23_Harold_oath_William.jpg
- https://commons.wikimedia.org/wiki/File:Bayeux_Tapestry_scene51_Battle_of_Hastings_Norman_knights_and_archers.jpg
- https://commons.wikimedia.org/wiki/File:Bayeux_Tapestry_scene55_William_Hastings_battlefield.jpg

Pour changer d'images, rester sur des photos CC0 ou domaine public dont la page Commons a été
vérifiée. Ne pas reprendre les numérisations du musée de Bayeux : les conditions d'utilisation de
son site encadrent leur réutilisation.

Le contraste du bandeau est de 8,5:1 (crème `#f4ebd9` sur rouge `#7f1d1d`). Il n'y a aucune
animation.

## Travailler un habillage

1. Les composants reçoivent `{ locale, themeSlug, slot }` (`components/skins/types.ts`).
2. Les emplacements sont posés dans `app/[locale]/(public)/layout.tsx` par `<SkinSlot>`. Pour
   un nouvel emplacement, l'ajouter au type `SkinSlot`, puis dans le layout.
3. La racine du site porte `data-skin="millennium"` tant que l'habillage est actif. Un style
   ciblé peut s'y accrocher (`[data-skin="millennium"] …`) sans toucher le reste du site.
4. Vérifier : `pnpm test components/skins`, puis `e2e/skins.spec.ts` et `e2e/a11y-axe.spec.ts`
   sur un build de production.

Pour ajouter un autre habillage : un dossier `components/skins/<clé>/`, une entrée dans
`lib/skins/registry.ts` (clé et libellé de l'admin) et une dans `components/skins/index.tsx`.

## Retirer l'habillage

- **Sans toucher au code** : dans l'admin, mettre « Aucun habillage » ou changer les années.
  L'effet est immédiat.
- **Du code** :
  1. supprimer `components/skins/millennium/` (avec `trash-put`) ;
  2. retirer `millennium` de `lib/skins/registry.ts` et de `components/skins/index.tsx` ;
  3. retirer le premier test « dresses the 2027 site » de `e2e/skins.spec.ts`, ou le fichier si
     plus aucun habillage n'existe ;
  4. facultatif : supprimer `millennium-emblem.svg`, `millennium-wordmark.svg` et les quatre
     `millennium-frieze-*` (`.avif`, `.webp`) de `public/themes/`.

  Un thème qui pointe encore vers `millennium` en base affiche alors le site normal : la clé
  inconnue est ignorée. Aucune migration n'est nécessaire.
