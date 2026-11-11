# Passe design + RGAA + lecteur d'écran — rapport final

Branche locale `feat/pel-design-rgaa`, créée depuis `feat/pel-2027`, le 2026-11-11.
Rien n'a été poussé, fusionné ni déployé. La prod, la préprod et la v1 n'ont été lues
qu'en GET public.

## Résultat

Les 12 items du fichier d'objectif (les 11 prévus, plus F2 ajouté depuis la réunion) sont terminés, avec leurs preuves.

| Item | Statut | Commit(s) | Preuve principale |
| --- | --- | --- | --- |
| D1 Audit visuel de la prod | fait | `682c89c` | `docs/reports/design-audit.md` (21 constats), 42 captures `before/` |
| A1 RGAA automatisé (axe) | fait | `7109234` | `e2e/a11y-axe.spec.ts` : 51 couples page × règle graves ou critiques → **0** |
| A2 Lecteur d'écran (arbre d'accessibilité) | fait | `9d54339`, `aafd3c0` | `e2e/a11y-screen-reader.spec.ts`, `docs/reports/rgaa-screen-reader.md` |
| D2 Correctifs propres | fait | `d2cddcc`, `5d6adf3` | e2e `design:*`, `programme-edition.spec.ts`, captures `d2/` |
| A3 Clavier et cibles de 44 px | fait | `a689a01` | `e2e/a11y-keyboard.spec.ts` (8 parcours), cibles 44 px en tactile et 24 px à la souris |
| D3 Touche « lumière » (animations) | fait | `eb9d219` | `e2e/motion.spec.ts` 8/8, aucune animation en mouvement réduit |
| D4 Finitions de l'admin | fait | `904b0c8` | `admin-dashboard.spec.ts`, `admin-mobile.spec.ts`, captures `d4/` |
| F1 Demandes de la réunion | fait | `dd75c59`, `1c9f658` | `embargo.spec.ts` (2 bugs de cache corrigés), `docs/reports/meeting-coverage.md` |
| F2 Lien « Histoire du lieu » | fait | `059e2fb` | `event-history.spec.ts`, migration `20261111010000_add_event_history_url` |
| R1 Sites manquants en prod | fait | `b5bcbdc`, `ae397e0` | 100 sites manquants ; page admin « Sites à récupérer » ; `docs/reports/ops-recovery.md` |
| A4 Déclaration d'accessibilité | fait | `a0aec64` | `accessibility-statement.spec.ts` (3), `declaration.test.ts` (4) |
| P1 Preview pour le test VoiceOver | fait | `b9164fa`, ce commit | checklist `docs/reports/voiceover-checklist.md` ; preview HTTPS vérifiée, capture `p1/p1-preview-https-1920.png` |

Le détail des preuves de chaque item est dans `.claude/goals/pel-design-rgaa.md`.

## Vérification finale (build neuf de HEAD `94ab261`)

| Contrôle | Résultat |
| --- | --- |
| `pnpm tsc --noEmit` | 0 erreur |
| `pnpm lint` | 0 erreur, 4 avertissements antérieurs à la branche |
| `pnpm test` | 70 fichiers, **472/472** |
| `pnpm build` + `next start` (127.0.0.1:3013) + `pnpm test:e2e --retries=0` | build neuf sous `flock` (compilé en 13,0 s, 56 pages statiques) ; **243/243** en 1,9 min |
| Balayage axe (inclus dans l'e2e) | 0 violation grave ou critique : 13 pages publiques en FR/EN à 1440/390, et 13 écrans admin à 1440/390 |
| Parcours clavier (inclus dans l'e2e) | 8/8 |
| `prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma` | `-- This is an empty migration.` |
| Captures après, `docs/screenshots/design/after/` | 21 captures à 1440 et 21 à 390 (comme `before/`) ; 20 pages mesurées à chaque largeur : 0 débordement horizontal, 1 h1 par page, 0 image sans alt, 0 image cassée |
| Base locale après les tests | aucun réglage de département, aucun événement dépublié, `history_url` partout null |

Seule erreur console dans les captures : le statut 404 attendu de `/fr/page-inexistante`.

`booster-capacity` refusait d'abord le build : disque à 92,7 %. Avec l'accord de Cédric, j'ai purgé le cache de build Docker inutilisé (`docker builder prune`), ce qui a libéré 13,6 Go. Le disque est passé à 89,7 % (21,5 Gio libres) et les travaux lourds sont de nouveau autorisés. J'ai ensuite fait un build neuf, puis lancé `next start` et l'e2e complet.

## Rejeu par item (build de HEAD `0a90e8f`, 2026-11-11)

`pnpm build` sous `flock`, puis `next start` sur 127.0.0.1:3013, `playwright --retries=0 --reporter=json` et `vitest run --reporter=json`. Chaque cellule indique « réussis / échecs ».

| Item | e2e | Unitaires |
| --- | --- | --- |
| D1 | `http-status.spec.ts` 3/0 ; audit `docs/reports/design-audit.md` ; captures `before/` | – |
| A1 | `a11y-axe.spec.ts` 6/0 (0 violation grave ou critique) | `design-tokens-contrast.test.ts` 15/0 |
| A2 | `a11y-screen-reader.spec.ts` 20/0 ; `not-found.spec.ts` 12/0 | – |
| D2 | `design-states.spec.ts` 7/0 ; `programme-edition.spec.ts` 5/0 ; `contact.spec.ts` 10/0 | `hero-video` 3/0 ; `programme-edition` 4/0 ; `contact` 9/0 |
| A3 | `a11y-keyboard.spec.ts` 8/0 | – |
| D3 | `motion.spec.ts` 8/0 | `tween.test.ts` 6/0 |
| D4 | `admin-dashboard.spec.ts` 2/0 ; `admin-mobile.spec.ts` 6/0 ; `admin-publish.spec.ts` 5/0 | – |
| F1 | `themes` 2/0 ; `travel-book` 4/0 ; `fundraising` 3/0 ; `layout` 11/0 ; `embargo` 1/0 | `edition` 3/0 ; `department-settings` 4/0 |
| F2 | `event-history.spec.ts` 2/0 | `event` 25/0 ; `events` 30/0 ; `synced-fields` 3/0 |
| R1 | `recovery.spec.ts` 2/0 | `recovery` 6/0 ; `import` 5/0 |
| A4 | `accessibility-statement.spec.ts` 3/0 | `declaration.test.ts` 4/0 |
| P1 | Preview reconstruite sur `0a90e8f` (build de 11:12). En HTTPS avec le lien `#access=` : `/fr`, `/en` (`lang=en`), `/fr/evenements`, la fiche Pontécoulant, `/fr/accessibilite` et `/fr/admin/login` répondent 200, et aucune requête n'échoue. | – |

Total : e2e 243 réussis, 0 échec, 0 instable ; unitaires 472 réussis, 0 échec. La base locale est propre ensuite : 0 réglage de département, 0 événement dépublié, 0 `history_url`.

## Avant / après

- **Captures** : `docs/screenshots/design/before/` (prod, 2026-11-11) et `docs/screenshots/design/after/`. Mêmes noms, préfixe `before-` ou `after-`, largeurs 1440 et 390.
- **Points visibles** :
  - vidéo d'accueil absente remplacée par une affiche ;
  - plus de texte sous 12 px en mobile ;
  - logos partenaires sans cases vides ;
  - actualités sans couverture illustrées ;
  - programme par édition, avec un badge « archive » ;
  - halos ambrés et révélation au défilement ;
  - statuts en toutes lettres et compteurs « Aucun » dans l'admin ;
  - galerie photo accessible.
- **axe** : 51 couples page × règle graves ou critiques avant, sur 6 règles : `label-content-name-mismatch`, `button-name`, `aria-allowed-attr`, `aria-prohibited-attr`, `color-contrast` et `nested-interactive`. **0 après.**

## Preview pour le test VoiceOver

- **Passerelle** : `booster-preview-gateway.service` était arrêté depuis le 2026-11-11 à 02:17:08 UTC. Il a reçu un SIGTERM pendant une session SSH, à la même seconde que la preview `a11y-audioguide`. Cédric a autorisé sa relance. Le service est actif sur 127.0.0.1:18080, et la preview répond 401 sans cookie d'accès.
- **Preview** : `pel-design-rgaa` tourne en mode figé sur `a0aec64`, avec la base locale `pel-audit-db:5435`.
- **Contrôle** : vérification en headless à 1920×1080 en ouvrant le lien `#access=`. `/fr`, `/en/accessibilite` et `/fr/evenement/lumieres-au-chateau-de-pontecoulant` répondent 200. Le fragment disparaît de l'URL et aucune requête n'échoue. Capture : `docs/screenshots/design/p1/p1-preview-https-1920.png`.
- **Images locales** : les images envoyées en local (`public/uploads/`, ignoré par git) manquaient au worktree de la preview. Je les ai copiées, puis j'ai redémarré seulement `next start`.
- **Preview reconstruite** : après la purge du cache Docker, la preview a été reconstruite sur `0a90e8f`, la même version que le rejeu ci-dessus.
- **Le lien** : il est donné à Cédric dans la conversation et n'est écrit dans aucun fichier. Pour en obtenir un nouveau : `wtn preview pel-design-rgaa`. Le jeton d'ouverture vaut 15 minutes ; une fois le lien ouvert, le cookie dure une journée.

## Valeurs provisoires (configurables, à confirmer)

| Valeur | Où | Provisoire | À confirmer par |
| --- | --- | --- | --- |
| `HERO_VIDEO_URL` | variable d'environnement | absente, l'affiche s'affiche à la place | fichier vidéo du festival |
| `PROGRAMME_DEFAULT_EDITION` | variable d'environnement | `all` | édition à montrer par défaut |
| `DECLARATION_DATE` | `lib/accessibility/declaration.ts` | `2026-11-11` | date de mise en ligne, ou date de l'audit RGAA |
| Éditeur de la déclaration | `lib/accessibility/declaration.ts` | « Le Département de l'Orne… », repris des mentions légales de prod | les données de démo (seed) disent « Région Normandie » : qui est l'éditeur légal ? |

## Points à connaître

- **Conformité RGAA** : la déclaration indique « non conforme » parce qu'aucun audit complet n'a été fait. Les tests automatisés et manuels ne donnent pas de taux de conformité. Il faut un audit RGAA sur un échantillon de pages pour pouvoir annoncer un taux.
- **Attribution Mapbox** : ses liens font moins de 24 px. Ce sont des mentions obligatoires d'un service tiers ; elles sont exemptées dans `e2e/helpers/targets.ts`.
- **Compteurs de l'admin** : un compteur à 0 affiche « Aucun » et n'est pas un lien. C'est voulu : il n'y a pas de liste vide à ouvrir.
- **Embargo** : les deux bugs de cache trouvés par l'e2e (`dd75c59`) touchaient aussi la prod actuelle. Un embargo ou un changement d'édition ne s'affichait pas tout de suite, et une fiche dont on levait l'embargo restait en 404.
- **Nettoyage des tests e2e** : ils ne suppriment que les brouillons locaux qu'ils ont eux-mêmes créés. Ils ne suppriment jamais un événement publié ; un événement se dépublie.
- **Récupération des 100 sites** : à faire en prod après le déploiement, avec la page admin « Sites à récupérer » (5 tours de 20, en brouillons). La marche à suivre est dans `docs/reports/ops-recovery.md`. Je n'ai rien écrit en prod.

## Questions pour Cédric

1. **« Connexion sur mes comptes »** : de quels comptes s'agit-il (Vercel, admin du site, Tourinsoft, réseaux sociaux) ? Je n'ai utilisé que le compte éditeur de test local, et aucun identifiant de l'ancien serveur.
2. **La demande oubliée** : je n'ai pas retrouvé laquelle c'était. Les 34 demandes de la réunion sont suivies dans `docs/reports/meeting-coverage.md`. Laquelle manque ?
3. **Logo du Millénaire** (réunion #11) : le code est prêt, avec l'upload dans le formulaire du thème et le logo à la place du rond sur la carte. Il manque le fichier : Marc l'a-t-il envoyé ?
4. **« Petits blocs » pour les pages** (réunion #18, partiel) : les pages ont un éditeur riche FR/EN, mais pas de blocs structurés. Quels blocs manquent (chiffres clés, appel à l'action, galerie, partenaires…) ?
5. **Éditeur légal et date de la déclaration d'accessibilité** : voir les valeurs provisoires ci-dessus.

## Test VoiceOver

La checklist est dans `docs/reports/voiceover-checklist.md`. Elle couvre Mac et iPhone avec Safari, les pages publiques et, en option, l'admin. Le lien de la preview est donné dans la conversation ; le jeton n'est écrit dans aucun fichier.
