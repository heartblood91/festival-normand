# Passe lecteur d'écran (Linux) — Pierres en Lumières

Branche `feat/pel-design-rgaa`, build de production local (`next start`, 127.0.0.1:3013), 2026-11-10.

## Méthode

Sous Linux, il n'y a pas de VoiceOver. Les contrôles ont porté sur l'arbre d'accessibilité de Chromium, c'est-à-dire ce que reçoivent VoiceOver, NVDA et Orca.

- `scripts/aria-report.ts` exporte l'arbre de chaque page clé (`ariaSnapshot` Playwright) dans `/tmp/aria/<page>.yaml`. Il donne aussi, page par page, les régions (landmarks), le nombre de h1, les sauts de niveau de titre, les régions live, le premier élément focalisable, la langue et le titre.
  ```
  pnpm tsx scripts/aria-report.ts --base http://127.0.0.1:3013 --out /tmp/aria [--admin]
  ```
- `e2e/a11y-screen-reader.spec.ts` fige les corrections : 19 tests, exécutés sur le build de production.
- La relecture humaine sur VoiceOver reste à faire par Cédric. La checklist est dans `docs/reports/voiceover-checklist.md`, et le lien de preview figure dans le rapport final.

## Constats et corrections

| # | Critère RGAA | Constat | Correction | Test |
| --- | --- | --- | --- | --- |
| 1 | 8.3 langue par défaut | `<html lang="fr">` sur toutes les pages, y compris `/en` : VoiceOver lisait l'anglais avec la voix française. | `<html>` déplacé dans `app/[locale]/layout.tsx`, `lang={locale}` (FR, EN, admin, 404). | `page language › /en… declares lang=en` (6 tests) |
| 2 | 12.6, 12.7 | 404 hors gabarit : ni en-tête, ni `main`, ni pied de page, ni lien d'évitement, texte toujours en français. `/fr/accessibilite` tombait dessus en local (page CMS absente, voir A4). | Route `[...rest]`, puis `not-found.tsx` éditorial dans le layout public, traduit FR/EN. Code 404 conservé. | `landmarks and skip links › /fr/page-inexistante…`, `an unknown page answers 404 inside the site layout` |
| 3 | 12.7 lien d'évitement | « Aller au contenu principal » faisait défiler la page sans y placer le focus : la touche Tab suivante repartait du haut. | `main#main-content` reçoit `tabIndex={-1}`. | `expectSkipLinkReachesMain` (public et admin) |
| 4 | 12.7, 8.6 | Admin : aucun lien d'évitement ; titre générique (« Pierres en Lumières - Festival… ») sur le tableau de bord, les paramètres et la double authentification. | Lien d'évitement dans `AdminShell`, `main` focalisable, titres « Tableau de bord - Administration », etc. | `admin pages have a skip link, a specific title and the page language` |
| 5 | 9.3 listes | Chiffres clés de l'accueil : chaque `<dd>` était placé avant son `<dt>` (« 4 », puis « lieux illuminés »). Départements : 4 `<dt>` sans `<dd>` (compteur masqué à 0). | `dt` avant `dd` dans le DOM, ordre visuel gardé par `flex-col-reverse`. « Programme à venir » quand un département n'a encore rien publié (constat 2 de l'audit design). | `definition lists read term then value` |
| 6 | 6.1 intitulé de lien | Cartes « nuit » lues « 21 Vendredi mai 2027 L'ouverture… ». | Date lisible en `sr-only` (« Vendredi 21 mai 2027 »), date visuelle en `aria-hidden`. | `festival nights read as a full date` |
| 7 | 1.2, 6.1 | Les liens des cartes d'événements et d'actualités commençaient par l'alt générique de la photo (« Monument illuminé de nuit pendant le festival »), répété sur chaque carte. | Vignettes décoratives (`alt=""`, repli dégradé `aria-hidden`) : la carte est déjà nommée par son titre. Les pages de détail gardent l'alt rédigé par l'éditeur. | `event and news card links start with their title, not a picture` |
| 8 | 13.2 / 6.1 | Liens ouvrant un nouvel onglet sans le dire : Facebook, Instagram (en-tête, menu mobile, pied de page), partenaires, site de l'organisateur. | Mention « (nouvel onglet) » / « (new tab) » dans le nom accessible. | `links opening a new tab say so` |
| 9 | 8.2 code valide, 7.1 | Admin : 9 liens contenant un `<button>` (« Nouvel événement », crayons « Modifier », « Retour », « Annuler », barre d'aperçu) : élément interactif imbriqué, lu deux fois. | `Button asChild` + `Link` : un seul lien. Liens admin préfixés par la langue (plus de redirection 307). | `the new-event action is a single link, not a button inside a link` |
| 10 | — | Presse : e-mail et téléphone en texte brut sur la page contact. | Liens `mailto:` et `tel:`. | `press email and phone are links` |
| 11 | 12.x | Menu mobile : vérifié, c'est un dialog base-ui. Le focus reste piégé dans le menu, Échap le ferme et le focus revient sur « Ouvrir le menu ». | Aucune correction, test ajouté. | `the mobile menu traps focus, closes on Escape and gives focus back` |

Tests e2e fiabilisés au passage :
- `deleteThemeIfPresent` (themes) et `republishEvent` / `describeCoverIfMissing` (helpers admin) lisaient `count()` avant la fin du chargement de l'écran admin. Ils sautaient parfois la suppression ou la republication, ce qui laissait des données de test en base locale (thématique e2e, événements dépubliés) et cassait d'autres specs.
- `admin-lists` et `admin-tourinsoft` préfixaient `/fr` à des liens admin qui le contiennent désormais.
- Résultat : 201/201 sans retry sur le build de production.

Également corrigé au passage : les scripts Vercel Analytics et Speed Insights ne sont plus chargés hors Vercel (constat 17 de l'audit design). Ils provoquaient deux 404 par page en local et en preview.

## Déjà conforme (vérifié dans l'arbre)

- Un seul `h1` par page, aucun saut de niveau de titre (sortie JSON de `aria-report`).
- Régions présentes sur les pages publiques : `banner`, `search` (« Rechercher un événement par ville »), `navigation` « Navigation principale » et « Navigation du pied de page », `main`, `contentinfo`.
- Régions présentes dans l'admin : barre latérale `complementary` avec sa `navigation` « Navigation principale », puis `main`.
- Formulaires (contact, admin) : chaque champ a un libellé visible relié, l'astérisque est dans le nom.
- Régions live :
  - nombre de résultats du programme (`role="status"`) ;
  - filtres (`aria-live="polite"`) ;
  - carnet : ajout, partage, liste vide ;
  - notifications « Notifications alt+T » (sonner).
- Boutons du carnet : « Ajouter « X » au carnet de voyage », avec `aria-pressed`.
- Bascules Grille/Carte : `aria-pressed`.
- Carte de l'événement :
  - région nommée « Carte : X et N sites voisins numérotés » ;
  - marqueurs nommés par le titre de l'événement (et « Vous êtes ici » pour l'événement courant) ;
  - liste « Le même jour, à proximité » en équivalent textuel.
- Lecteur YouTube : bouton « Lire la vidéo : titre », la vidéo ne se charge qu'au clic, puis le focus est placé sur le lecteur (A1).

## Ordre de lecture des pages clés (après corrections)

### Accueil `/fr`

1. Liens d'évitement « Aller au contenu principal », « Aller à la navigation du pied de page ».
2. En-tête (`banner`) : Contraste, « Switch to English » (annoncé en anglais), recherche par ville, Facebook (nouvel onglet), Instagram (nouvel onglet), « Pierres en Lumières — Retour à l'accueil », navigation principale (Accueil, Programme, Actualités, Le Festival, Contact), Mon carnet de voyage, Inscrire un événement.
3. `main` :
   - hero : « 18ᵉ édition · 21 — 23 mai 2027 », h1 « Pierres en Lumières », sous-titre, chiffres clés (« lieux illuminés : 4 », « départements : 5 », « nuits : 3 »), Découvrir le programme, Voir la carte, compte à rebours ;
   - h2 « Trois soirs, trois ambiances. », avec un lien par nuit (« Vendredi 21 mai 2027 L'ouverture … 2 animations ») ;
   - citation du festival ;
   - région « Millénaire de Guillaume le Conquérant » ;
   - h2 « Les nouvelles du festival. », puis les cartes d'actualités (titre en premier) ;
   - programme et temps forts (cartes nommées par le titre) ;
   - h2 « Toute la Normandie, allumée. » : départements (« 14 · CALVADOS : 4 lieux », les autres « Programme à venir ») ;
   - partenaires (nom + nouvel onglet).
4. Pied de page (`contentinfo`) : logo, réseaux, navigation du pied de page, liens légaux, gestion des cookies.

### Programme `/fr/evenements`

1. Liens d'évitement, en-tête.
2. `main` :
   - h1 ;
   - barre de filtres : recherche, catégories, dates (« Ven. 21, vendredi 21 mai »), départements, groupe « Thématiques » ;
   - nombre de résultats (`status`, annoncé à chaque filtre) ;
   - Grille/Carte (`aria-pressed`) ;
   - liste des cartes : titre, lieu, date, puis bouton carnet séparé ;
   - pagination.
3. Pied de page.

### Fiche événement `/fr/evenement/…`

1. Liens d'évitement, en-tête.
2. `main` > `article` :
   - fil d'Ariane ;
   - photo (alt éditeur) ;
   - catégorie, Accessible PMR ;
   - h1, puis lieu et commune ;
   - « Ajouter au carnet » ;
   - `complementary` « Informations pratiques » : liste de définitions Date, Horaires, Lieu, Tarification, Organisateur, Thématiques ;
   - h2 « Description » ;
   - `complementary` « Localisation » : carte nommée et liste textuelle « Le même jour, à proximité » ;
   - h2 « Organisateur », puis e-mail et site (nouvel onglet).
3. Pied de page.

### Inscription `/fr/inscription`

1. `main` > `article` : fil d'Ariane, h1, région « Inscrire votre événement en 3 étapes » (liste ordonnée de h3), région « Choisissez votre département ».
2. Les liens des départements portent la mention « Accéder au formulaire (nouvel onglet) ».
3. Ensuite : vidéo (bouton au clic), « Critères de participation », « Dates limites ».

### Contact `/fr/contact`

1. `main` : h1 « Allumons une pierre ensemble. ».
2. h2 « Nous écrire » : Nom complet *, Email *, Département * (liste), Message *, Envoyer.
3. h2 « Coordonnées » : Coordination régionale, puis Presse & médias (liens e-mail et téléphone), puis Inscrivez votre événement.

### Carnet `/fr/carnet`

1. `main` : h1 « Mon carnet de voyage », explication (pas de compte, pas de donnée personnelle).
2. État vide annoncé, puis « Parcourir le programme ».
3. Carnet rempli : regroupement (`aria-pressed`), sections par jour ou département, « Retirer « X » », partage.

### 404 `/fr/page-inexistante`

1. Liens d'évitement, en-tête complet.
2. `main` : « Erreur 404 », h1 « Page introuvable », explication, Retour à l'accueil, Voir les événements.
3. Pied de page.
4. En anglais : `lang="en"`, h1 « Page not found ».

### Admin (tableau de bord, liste des événements, formulaire)

1. Lien d'évitement « Aller au contenu principal ».
2. Barre latérale : Administration, langue, Contraste, Retour au site, navigation principale, utilisateur, Déconnexion.
3. `main` :
   - h1 de l'écran ;
   - liste : recherche, filtres nommés (Statut, Département…), tableau avec en-têtes de colonnes, case « Sélectionner X », liens « Modifier X », boutons « Dépublier X » ;
   - formulaire : statut, actions IA (désactivées, raison annoncée), Publier, onglets de langue (`tablist`), champs libellés, barre d'outils de l'éditeur.

## Limites connues

- **404 rendue côté client.** Next 16.1.6 renvoie un document minimal (`<html id="__next_error__">`) pour tout appel à `notFound()` sur une route dynamique. Le contenu de la 404 est inclus dans la même réponse (payload RSC) et s'affiche sans requête supplémentaire. Le code HTTP reste 404.
  - Vérifié sur un serveur de dev, avec une route minimale et sans les modifications de cette branche : ce comportement existait déjà.
  - Sans JavaScript, la page reste vide. VoiceOver n'est pas concerné.
- **Carte d'un événement.** Les autres événements du festival sont aussi des marqueurs focalisables, soit une vingtaine d'arrêts Tab. L'équivalent textuel « Le même jour, à proximité » est plus court. À arbitrer avec le retour VoiceOver de Cédric : on pourrait ne rendre focalisables que les marqueurs numérotés.
- `/fr/accessibilite` dépend de la page CMS « accessibilite ». Une déclaration par défaut est prévue en A4.
