# Pass Patrimoine

## Réglages (`/admin/reglages`)

- **Afficher le Pass Patrimoine sur les événements** : interrupteur général. Éteint, aucun
  encart, badge ni filtre n'apparaît, même si des fiches ont un lien.
- **Bandeau** : texte FR/EN, lien du bouton (une page https de pass-patrimoine.fr), dates de
  début et de fin facultatives (jours de Paris, inclus) et pages d'affichage (accueil,
  programme, fiches événement). Un visiteur qui ferme le bandeau ne le revoit plus tant que
  son contenu ne change pas.
- Sans réglage enregistré, tout est éteint. Les pages publiques se mettent à jour à
  l'enregistrement ; au pire après 5 min (accueil) ou 30 min (fiches) pour les dates.

## Lien d'un événement

Champ « Fiche du lieu sur pass-patrimoine.fr », sous la collecte. Seules les fiches
`https://www.pass-patrimoine.fr/fr/lieux-et-visites/{slug}` sont acceptées
(`lib/pass-patrimoine/url.ts`). La synchro Tourinsoft ne touche jamais ce champ.

## Étendre la liste des sites suggérés

Les suggestions viennent d'une liste fixe : `PASS_PATRIMOINE_NORMANDY_SITES` dans
`lib/pass-patrimoine/sites.ts`. Pour ajouter un site, ajouter une ligne avec son nom, sa
commune, le code du département (ou le code postal) et le slug, c'est-à-dire le dernier
segment de l'URL de sa fiche. Le test `lib/pass-patrimoine/sites.test.ts` vérifie que chaque
ligne forme une URL valide. Une suggestion n'est jamais appliquée seule : l'éditeur clique
« Associer » puis enregistre l'événement.
