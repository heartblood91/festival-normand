# Récupérer en prod les sites oubliés de l'ancien site (R1)

Constat du 2026-11-11 (`docs/reports/v1-vs-prod.md`) : **100 événements publiés sur
l'ancien site pour 2026 manquent en prod.**

| Département | Manquants |
| --- | --- |
| Seine-Maritime | 55 |
| Eure | 15 |
| Calvados | 14 |
| Manche | 13 |
| Orne | 3 |

Le flux Tourinsoft n'est pas en cause : la prod a toutes ses offres (4/4), et les 413
fiches sont accessibles depuis le programme (`docs/reports/tourinsoft-prod-diagnostic.md`).

Je n'ai rien écrit en prod. L'import se fait après le déploiement de la branche
`feat/pel-design-rgaa`, par l'une des deux voies ci-dessous.

## Voie 1 : l'admin, sans accès à la base (recommandée)

1. Se connecter à l'admin avec un compte **Éditeur** ou **Admin**.
2. Ouvrir **Sites à récupérer** (`/fr/admin/recovery`) dans le menu, puis choisir l'édition (2026 par défaut).
   La page lit l'API publique de l'ancien site, en lecture seule, et affiche trois compteurs :
   - publiés sur l'ancien site ;
   - déjà présents ici ;
   - à récupérer.
3. Choisir au plus 20 sites par import, un par un ou avec **Cocher les 20 premiers**, puis cliquer **Importer en brouillon (n)**.
   - Cocher **Télécharger aussi les photos** seulement si l'import a le temps : chaque photo est copiée sur le stockage Blob.
   - Le message annonce le résultat : créés, déjà présents, échecs. La liste se met à jour.
4. Recommencer jusqu'à ce que le compteur « À récupérer » soit à 0. Il faut 5 tours pour 100 sites.
5. Relire les brouillons dans **Événements** (filtre « Brouillon »), compléter la photo ou la traduction si besoin, puis publier.

## Voie 2 : la ligne de commande (accès à la base requis)

Cette voie demande `DATABASE_URL` vers la base de prod dans l'environnement. Ne pas coller la valeur dans un ticket ou un chat.

```bash
# 1. Simulation : liste ce qui serait créé, n'écrit rien
pnpm tsx scripts/import-directus.ts --year 2026 --dry-run

# 2. Import en brouillons, par lots de 20, photos comprises
pnpm tsx scripts/import-directus.ts --year 2026 --limit 20
```

Options :
- `--skip-images` saute les photos ;
- `--no-translate` saute la traduction anglaise ;
- `--publish` publie directement. **Déconseillé** : relire d'abord.

Exemple de simulation contre la base locale (2026-11-11). La base locale ne contient pas les offres Tourinsoft, d'où 423 sites :

```
{"year":"2026","publish":false,"downloadPhotos":true,"translate":true,"dryRun":true,"limit":"all","total":423,"knownById":0,"knownBySite":{},"created":0,"failed":0,"planned":423}
```

## Garanties

Les deux voies partagent le même code (`lib/directus/import.ts`) :

- **Brouillons seulement.** Rien n'est visible du public avant relecture.
- **Idempotent.** Un site déjà présent est ignoré, qu'il soit reconnu par son identifiant Tourinsoft ou par son lieu. Relancer ne crée pas de doublon.
- **Aucune modification d'existant.** Ni mise à jour, ni dépublication, ni suppression.
- **Photos.** Une photo en échec n'arrête pas l'import : le brouillon est créé sans elle.
- **Traduction.** Elle utilise OpenRouter. Si la clé manque, le brouillon est créé en français seulement.
- **Accès.** L'action serveur vérifie `requireRole("EDITOR")` avant toute lecture.

## Preuves

- Tests unitaires : `lib/actions/recovery.test.ts`, `lib/directus/import.test.ts`.
- Test de bout en bout : `e2e/recovery.spec.ts`. Il couvre l'import d'un site en brouillon, la fiche publique en 404, la ligne qui disparaît de la liste, les lots limités à 20 et l'envoi vide refusé.
- Balayage axe de `/fr/admin/recovery` : `e2e/a11y-axe.spec.ts`.
- Captures : `docs/screenshots/design/r1/r1-recovery-1920.png`, `docs/screenshots/design/r1/r1-recovery-390.png`.
