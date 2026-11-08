# Collectes Fondation du patrimoine — constats et rapprochement (P3.3)

Exploration du 2026-11-08, en lecture seule. Aucune liste de collectes n'existait côté
festival : on part du site public de fondation-patrimoine.org.

## Ce qui est accessible publiquement

| Source | Usage | Remarque |
| --- | --- | --- |
| `robots.txt` | règles d'exploration | interdit seulement `/*preview*` |
| `sitemap.xml` | liste des pages projet | 6 322 URL `/les-projets/<slug>/<code>`, sans région ni statut : inutilisable seul |
| `POST /api/v2/search/projects` | recherche du site (index Algolia derrière) | **source retenue** |
| `GET /api/v2/projects/recommended/<code>?limit=&lat=&lng=` | projets proches d'un point | utile pour un contrôle ponctuel, pas pour un import |
| `GET /api/v2/projects/collect-counters` | compteurs globaux | non utilisé |

Endpoint trouvé en lisant le bundle JavaScript public du site (client axios avec
`baseURL /api/v2/search`). Aucune clé, aucun cookie n'est nécessaire.

### Requête utilisée

```json
POST https://www.fondation-patrimoine.org/api/v2/search/projects
{
  "location": { "target": "region", "value": "28" },
  "statuses": ["IN_PROGRESS"],
  "hitsPerPage": 100,
  "page": 0,
  "fetchAll": false
}
```

- La région Normandie a le code `28`. Un `filterString` dans le corps est ignoré : seul
  `location` filtre.
- Réponse : `hits`, `nbHits`, `page`, `nbPages`. Au 2026-11-08 : **247 collectes en
  cours** en Normandie, soit 3 pages : Eure 72, Calvados 60, Seine-Maritime 43, Orne 37,
  Manche 35.
- Champs utiles d'un hit : `code`, `slug`, `title`, `city`, `postalCode`, `departmentCode`,
  `regionCode`, `_geoloc {lat,lng}`, `image.thumbnailUrl` (hébergée sur
  `strapi-upload.cdn.fondation-patrimoine.org`), `collect.collectedPercent`,
  `collect.endDate`, `fundingStatus`.
- URL publique d'un projet : `https://www.fondation-patrimoine.org/les-projets/<slug>/<code>`.

### Usage poli

`lib/fundraising/fondation-client.ts` envoie un User-Agent explicite
(`PierresEnLumieres-collectes/1.0 (read-only)`), attend 2 s entre deux pages, s'arrête à
20 pages et échoue sur toute réponse HTTP en erreur. Une exécution complète fait 3
requêtes. Ce n'est pas une API documentée ni contractuelle : elle peut changer sans
préavis. En cas de rupture, le formulaire admin garde la saisie manuelle du lien.

## Qualité des données

- **GPS absent** : 4 projets sur 247 ont `_geoloc: {}` (Bretigny 27800, Chouain 14250,
  Vernon 27200, Ri 61210). Ils restent rapprochables par commune, pas par distance.
- **GPS faux** : exemple, « Le canot à misaine Le Kierborg » (Barfleur) est géolocalisé à
  1,8 km de Cherbourg. D'où la **validation par un éditeur** avant tout affichage public.
- Communes en majuscules sans accents ni tirets (`TOURVILLE SUR ARQUES`) : normalisées
  avant comparaison (accents, ponctuation, `saint` → `st`).
- 1 projet sans image ; tous ont un pourcentage collecté.

## Rapprochement

`lib/fundraising/match.ts`, testé dans `match.test.ts` :

1. **Même commune** : nom normalisé identique **et** même département (le code postal de
   l'événement commence par `departmentCode`), pour éviter les homonymes.
2. Sinon, **distance** à vol d'oiseau (haversine) inférieure au rayon.
3. Tri : même commune d'abord, puis par distance ; 3 suggestions au plus par événement.

Le rayon de **10 km est provisoire** (`DEFAULT_RADIUS_KM`, option `--radius`) : à
confirmer par l'équipe éditoriale.

Résultat sur la base locale (20 événements) : 19 événements reçoivent des suggestions, 45
au total (14 même commune, 31 par distance). Détail :
[`collectes-suggestions.json`](collectes-suggestions.json).

## Script

```bash
pnpm collectes:match                       # interroge le site, écrit le rapport JSON
pnpm collectes:match --save-snapshot s.json  # garde aussi les collectes normalisées
pnpm collectes:match --snapshot s.json     # rejoue sans appel réseau
pnpm collectes:match --radius 15 --limit 5
pnpm collectes:match --write               # enregistre les suggestions « à valider »
```

`--write` ne rattache **rien** à un événement : il crée ou met à jour des
`FundraisingSuggestion` en statut `PENDING`. Une suggestion déjà acceptée ou ignorée
garde son statut lors d'une nouvelle exécution.

## Côté admin et site public

- Fiche événement (admin) : carte « Collecte Fondation du patrimoine » avec le lien (seuls
  les liens `https://` vers fondation-patrimoine.org sont acceptés), un titre et une image
  facultative (CDN de la Fondation ou notre stockage). La liste « Collectes proches à
  valider » propose **Associer** (remplit les champs et marque la suggestion acceptée) ou
  **Ignorer**. Ces actions serveur appellent `requireRole("EDITOR")` en premier.
- Fiche publique : encart « Soutenir la restauration de ce lieu » avec le bouton « Faire un
  don » (nouvel onglet).
- Carte d'événement dans la liste : badge « Collecte ».

## À faire en production (non fait ici)

- Appliquer la migration `20261108030000_add_fundraising`.
- Lancer `pnpm collectes:match --write` contre la base de production, par une personne
  autorisée, puis faire valider les suggestions par les éditeurs.
- Relancer le script de temps en temps (les collectes se terminent) : aucune planification
  n'est mise en place.
