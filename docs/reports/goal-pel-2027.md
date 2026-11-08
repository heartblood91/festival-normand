# Rapport du goal `pel-2027` — Pierres en Lumières 2027

Branche locale `feat/pel-2027` (non poussée), 2026-11-08. Source de vérité :
`.claude/goals/pel-2027.md`. **Les 22 items sont `done`** (P0 à P3 avec preuve, P4 écrit
dans `docs/backlog-2027.md`). Rien n'a été poussé, fusionné ni déployé. Aucun appel au
cron de prod, aucune écriture en prod ; prod, v1 et fondation-patrimoine.org n'ont été
lus qu'en lecture seule. Base utilisée : base locale `pel-audit-db:5435`.

## Vérification finale (même code que le dernier commit applicatif `675e5e6`)

| Contrôle | Résultat |
| --- | --- |
| `pnpm tsc --noEmit` | exit 0, 0 erreur |
| `pnpm lint` | exit 0 : 0 erreur, 4 avertissements (déjà présents avant le goal) |
| `pnpm test` | 63 fichiers, **428/428** ; `middleware.test.ts`, qui échouait avant le goal, passe (6/6, corrigé dans `6de77b3`) |
| `pnpm test:e2e` | **175/175**, 0 ignoré, contre le build de production (`BASE_URL=http://127.0.0.1:3013`, `--workers=1 --retries=0`) |
| `pnpm build` | exit 0 (sous `flock`, après `booster-capacity` : heavyWorkAllowed true) |
| `next start` (127.0.0.1:3013) | `/fr` 200, `/fr/evenements` 200, `/fr/evenement/illumination-abbatiale-fecamp` 200, `/fr/evenement/slug-inexistant-xyz` **404** ; `/en`, `/fr/carnet`, `/fr/inscription` 200 |
| `prisma migrate diff --from-migrations … --to-schema … --exit-code` (shadow DB) | « No difference detected. », exit 0 |
| Captures 1440 et 390 | `docs/screenshots/2027/final-{home,programme,evenement,inscription,carnet,admin-dashboard,admin-event-form}-{1440,390}.png` : 14 pages en 200, `scrollWidth <= innerWidth` partout (1440/1440, 390/390) ; captures par lot `p31-*`, `p32-*`, `p33-*` |

### Défaut trouvé par la vérification sur build de production (corrigé)

Jusqu'ici, les e2e tournaient sur le serveur de dev, où le cache de données est
désactivé. Sur le build de production, ils ont révélé un défaut antérieur au goal. Les
actions admin invalidaient `/evenement/<slug>`, `/actualite/<slug>`, `/<page>` et `/`.
Or les URL publiques portent toujours la locale (`/fr/…`, `/en/…`) : aucune page ne
correspondait. En production, une modification restait donc invisible jusqu'à 30 min.
Le correctif `784eaf9` ajoute `lib/revalidate-public.ts`, testé, et l'applique aux
actions events, fundraising, news, pages et partners.

Preuve en navigateur headless (1920×1080) sur le build de production :
1. La fiche de Fécamp est en cache (`x-nextjs-cache: HIT`), sans encart.
2. « Associer » est cliqué dans l'admin.
3. `/fr` revient en `MISS` avec l'encart « Soutenir la restauration de ce lieu », et `/en`
   avec « Help restore this place », tous deux avec le lien du projet 104354.

Les e2e ont aussi été durcis pour le build de production (`675e5e6`) :
- une seule connexion éditeur par exécution, car better-auth limite les connexions en
  production ;
- attente de l'hydratation avant de lire ou de taper ;
- fixture autonome pour le cas « couverture sans texte alternatif ».

## Items

| ID | Item | Statut | Preuve |
| --- | --- | --- | --- |
| P0.1 | Add the missing Prisma migrations (`photos`, `registration_links`, `events.tourinsoft_*`, `published`… | done | 6de77b3: migration 20260501000000 (idempotent); `migrate diff --from-migrations --to-schema --exit-code` = No difference; fresh DB `migrate deploy` OK; seed publishes events+news |
| P0.2 | **All prod event pages `/fr/evenement/*` return 500** (even unknown slugs). Reproduce with a production… | done | 8ea7f18: reproduced (P2022 on old schema; DYNAMIC_SERVER_USAGE via SkipNav when built with 0 params); fix setRequestLocale in layouts + dynamic=error + drop (public)/loading; build on empty DB then serve full DB: unknown slug 404, known 200; e2e/http-status.spec.ts 3/3 |
| P0.3 | Cron EN translation always fails (`translateContent` calls `requireRole` with no session) → split an… | done | 415e6da: lib/ai/openrouter.ts (no requireRole) + lib/tourinsoft/sync.ts; tests lib/ai/openrouter.test.ts (7) + lib/tourinsoft/sync.test.ts 'creates unknown offers with EN translations and no session' (requireRole mock asserted not called) |
| P0.4 | Prod is missing the 4 current feed offers (Pontécoulant ×2, Canon, Colombières): `vercel.json` cron does… | done | 232d775: lib/tourinsoft/scheduler.ts+instrumentation.ts (TOURINSOFT_SYNC_INTERVAL_MINUTES; dev smoke: scheduler row SUCCESS 60s after boot), /api/healthz/tourinsoft (4 tests, 200 locally) + admin SyncStatusCard, scripts/sync-tourinsoft.ts (local: created 4 then skipped 4), read-only diagnostic docs/reports/tourinsoft-prod-diagnostic.md (prod: 3/4 feed offers missing, 1 search-only; 409 cards vs 302 distinct → pagination tie-breaker fix + test), sitemap revalidate=3600 (prod sitemap had 0 events), runbook docs/deploy-self-hosted.md. Applying in prod = blocker (deploy + migrate + env) |
| P0.5 | M1 embargo: per-department publication date (admin setting, default editable). New Tourinsoft events of… | done | 777a7cc: DepartmentSetting + migration 20261107010000; lib/queries/visibility.ts publicEventWhere() used by all public event queries; admin /admin/edition (updateDepartmentEmbargo requireRole EDITOR). Tests: lib/queries/visibility.test.ts (3), lib/actions/department-settings.test.ts (3). Local E2E on dev server: CALVADOS embargo 2027-03-15 → imported Canon detail 404 + search 0, manual Calvados event 200; date passed → 200 again. migrate diff: No difference. Default: no embargo (date to be set by editors) |
| P0.6 | Read-only comparison v1 (Directus published 2026) vs prod (public sitemap/listing): report… | done | 0b52043. `scripts/compare-v1-prod.ts` → docs/reports/v1-vs-prod.md: v1=423, prod=409, 323 matched (214 title+commune, 63 slug, 45 geo+title, 1 geo), **100 missing** (Seine-Maritime 55). Recovery `scripts/import-directus.ts` verified on local DB: dry-run planned 423; --limit 5 created 5 drafts with photos; full created 418; re-run created 0. Tests lib/directus/{map,match,import}.test.ts. Prod import = blocker (needs Dokploy/DB access). |
| P1.1 | Port the editorial redesign (+ uncommitted patch) onto current main logic, page by page: keep multi-day,… | done | 171da97 (editorial redesign ported: semantic headings, /accessibilite), 71b99cc (nights from edition, 0-value counters hidden in hero/three-nights/map), a6ceeb3 (no duplicated title heading; e2e specs structural). filters.accessible no longer referenced (PMR uses filters.pmr; static key scan of public t() calls: 0 missing). pnpm test 280 passed; public e2e festival/inscription/legal 19/19 on dev server; screenshots 1440 /fr + 390 /fr/evenements?date=22: 0px overflow |
| P1.2 | M16 edition dates/config editable in admin (DB-backed, replaces hard-coded `EDITION`), default 2027 =… | done | 71b99cc: Edition model + migration 20261107020000_add_editions; lib/festival/edition.ts (nights/roles/mode/countdown derived from dates, default 2027-05-21..23, provisional); getCurrentEdition (cached, tag edition, falls back to default); updateEdition requireRole EDITOR + validation; admin /admin/edition dates form. Home 2 states: upcoming (countdown 'J − N jours · entrée libre') / bilan from bilanFrom. Tests: lib/festival/edition.test.ts (14), lib/queries/edition.test.ts (4), lib/actions/edition.test.ts (3), events.test.ts night filter 21/22/23. Dev: /fr kicker '18ᵉ édition · 21 — 23 mai 2027' |
| P1.3 | M17 multi-date filter; M7 "nearby the same day" suggestions on event page; M24 map: current site… | done | 0b9831b multi-date filter: ?date=21,23 (union, multi-day events kept, old single links valid); tests lib/festival/edition.test.ts parseNightCodes (2), lib/queries/events.test.ts night clause evaluated per event (5), e2e events.spec 'several nights can be selected together'; dev: date=21 → 2, date=21,23 → 2, date=29 ignored. 6268fa8 M7+M24: lib/events/nearby.ts pickNearbySuggestions (5 tests) + getNeighbourEvents returns dates (test); numbered list 'Le même jour, à proximité' matching numbered map markers, current site red/centred, map fitted to suggestions, i18n labels, popup HTML escaped; e2e event-detail 'lists nearby sites as numbered links' ; screenshots 1440/390 overflow 0 |
| P1.4 | M18 `/inscription`: clickable department logos/cards, clear steps. | done | d0615dd: components/inscription/registration-steps.tsx (3 steps, step 1 anchors to the cards) + department-registration-links.tsx (5 cards 14/27/50/61/76, target=_blank + sr-only 'nouvel onglet', 'Formulaire bientôt en ligne' when no URL); lib/festival/registration.ts departmentRegistrations (3 tests: order, URLs, only http(s)). e2e inscription.spec 'shows the three registration steps first' + 'offers one card per department' (6/6). Screenshots /fr 1440 + /en 390: overflow 0. No official department logos in repo → numbered cards (logos = blocker: files + usage rights) |
| P1.5 | Footer credit: discreet "Site développé par Cédric Freret, lead dev bénévole — Délégation Normandie" with… | done | 556e927: packages/maker-credit (4 unit tests), footer FR/EN; e2e layout 'footer credits the developer discreetly, in each language' (11 passed); footer screenshots 1440 fr / 390 en overflow 0; tsc 0, tests 297 passed |
| P2.1 | Publish workflow: AI wizard only on first publish, revert state on cancel, toast after server success,… | done | 40d6e35: lib/admin/publish-flow.ts (needsPublishWizard, fillMissingTranslations, missingTranslationSource, applySpellingCorrections; 7 tests lib/admin/publish-flow.test.ts); event+news forms: wizard only draft→published, cancel restores draft, accepted fixes applied, EN never overwritten, toast from server result; pages: no publish badge/toggle. e2e/admin-publish.spec.ts 4 passed (cancel keeps draft; published save skips review; unpublish→republish via wizard saved once; pages no state). Admin e2e 35 passed. Auth client now same-origin (was localhost:3010). E2E editor: scripts/seed-admin.ts + E2E_EDITOR_EMAIL/PASSWORD |
| P2.2 | Real Translate / SEO / RGAA buttons (OpenRouter, existing pattern) instead of "À venir"; M19. | done | ba598fb: FormActionBar Traduire (fills only empty EN, events/news/pages, lib/admin/translate-missing.ts 3 tests), SEO + RGAA dialogs (components/admin/shared/ai-check-dialog.tsx, existing checkSEO/checkAccessibility), getAiAvailability requireRole EDITOR (lib/actions/ai-publish.test.ts 2 tests); no 'À venir' left; no key → 'IA indisponible' + wizard 'Non vérifié'. e2e admin-publish 'AI tools are real buttons…' + 'a draft is published…' (5 passed). Screenshot /tmp/pel-shots/admin-bar-1440.png overflow 0. M19 has no definition in the meeting notes: interpreted as these AI tools. OPENROUTER_API_KEY absent locally → live AI path untested (blocker) |
| P2.3 | Unsaved-changes guard + local draft autosave; FR/EN tabs with error/incomplete badges and ARIA tabs; end ≥… | done | commit 31688e6. Unit: lib/admin/form-draft.test.ts (7), form-status.test.ts (4), lib/schemas/event.test.ts dateEnd refine (2); pnpm test 323/323. E2E e2e/admin-form-safety.spec.ts 4/4 (leave confirm + reload restore, ignore draft, ARIA tabs + 'à compléter' badge + arrow keys, dateEnd min + edition first night + Paris-day publishedAt); admin suites 40/40 (one earlier run had 2 load timeouts in admin-publish, green alone and on rerun). tsc 0, lint 0 errors/4 baseline warnings. Screenshot /tmp/pel-shots/p23-form-1440.png, overflow 0. |
| P2.4 | Images: alt text required for cover + editor images, **AI-proposed alt** (vision model via OpenRouter)… | done | Commit 4d1c05f. Unit 344/344 (alt-text, editor-urls, schemas event/news alt refine, proposeAltText x7, news query alt). e2e/admin-images.spec.ts 3/3 (image inserted only with alt, link dialog refuses javascript: and adds https, no native dialog; published cover without alt -> #coverImageAltFr-error). Admin+public e2e 84/84. Migration 20261107030000_add_cover_image_alt, migrate diff empty. Note: existing published events with a cover need an alt before their next save (by design); live AI proposal untested (no OPENROUTER_API_KEY). |
| P2.5 | Tourinsoft badge + source filter + "synced fields" banner; delete replaced by unpublish for events. M14… | done | Commit 9aecf61. Unit: unpublishEvents x4 (updateMany published:false+unpublishedAt, empty refused, errors, no export matching /delete/), auth guard, source filter x2, synced-fields x3; 351/351. e2e/admin-tourinsoft.spec.ts 3/3 (source filter + badge, banner lists synced fields, row unpublish -> listed as Dépublié, no Supprimer button, republished in finally); admin e2e 46/46, DB 20/20 published. Screenshot /tmp/pel-shots/p25-list-1440.png overflow 0. M14 AI clean-up of Tourinsoft texts NOT built (optional; needs OPENROUTER_API_KEY) -> docs/backlog-2027.md. |
| P2.6 | Lists: keep all filters across search/pagination, sort, upcoming/past filter, bulk… | done | commit fefbe7d. lib/admin/event-list.ts (parseEventListParams/eventListWhere/eventListOrderBy/buildListUrl/publishBlocker, 14 unit tests) + publishEvents/setEventsFeatured with requireRole first (events.test.ts). e2e/admin-lists.spec.ts 5/5: filters+sort kept across search, clear and pagination links; period filter and title sort; bulk feature/unfeature restored; bulk publish skips a cover without alt and names it; dashboard 'À traiter' counter = list count. pnpm test 370/370, lint 0 errors, admin e2e 52/52 (4 dev-server load timeouts rerun green). Screens /tmp/pel-shots/p26-{list,dash}-{1440,390}.png; list at 390 overflows 32px (double padding, fixed in P2.7). Tourinsoft status already on dashboard (SyncStatusCard). |
| P2.7 | Mobile: no horizontal overflow (390px), action bar at bottom, single padding, mobile nav with `Link`; i18n… | done | commit e9e7abd. Overflow audit at 390px (doc + <main> scroll width) on 14 admin pages incl. event/news edit: 0 everywhere (before: events 61, events/new 371, news/new 336, partners 106). e2e/admin-mobile.spec.ts 3/3: no sideways scroll on 11 pages; menu uses next/link (no reload), closes, has Paramètres; Créer/Mettre à jour pinned at screen bottom. Wizard/steps/translate button in French (admin-publish + helpers use Suivant/Publier maintenant/Annuler). 0 'slate-' classes left in components/admin and app/[locale]/admin (tokens). pnpm test 370/370, lint 0 errors, admin e2e 54/54 (2 cold-compile timeouts fixed by 15s URL waits, rerun green). Screens /tmp/pel-shots/p27-after-*.png, p27-desk-*.png. |
| P3.1 | **Themes** (M2/M3): `Theme` model (name FR/EN, slug, color, optional map marker image, `showOnHome`),… | done | 37be1ad: Theme model + migration 20261108010000_add_themes (seed Millénaire, show_on_home, provisional SVG public/themes/millennium-marker.svg replaceable by upload). Admin /admin/themes CRUD (requireRole EDITOR, guard test), event form theme checkboxes (connect/set tests). Public: /evenements?theme= chips (getFilterThemes, buildFilterWhere test), event page theme links, home ThemeSpotlight, map themed pins (themePin 3 tests). Unit 403/403 (theme schema 5, actions 5, queries 2). e2e themes.spec 2/2 + admin-mobile 3/3 + events/home/event-detail 30/30. Screenshots docs/screenshots/2027/p31-home-theme-{1440,390}.png, p31-filter-{1440,390}.png overflow 0. migrate diff: No difference. Logo = provisional SVG (Cédric may swap for AI image). |
| P3.2 | **Carnet de voyage** (M6): favourites without login (localStorage), page listing them by date/place + map… | done | commit 4ceaabf; e2e/travel-book.spec.ts 4/4 + events/home/event-detail/layout 45/45 (dev server); unit lib/travel-book/favorites.test.ts, lib/queries/travel-book.test.ts, lib/actions/travel-book.test.ts (pnpm test 417/417); tsc 0; lint 0 errors; migrate diff empty; captures docs/screenshots/2027/p32-carnet{,-share,-partage,-print}-{1440,390}.png overflow 0 |
| P3.3 | **Collectes** (M4): investigate public read-only access to Fondation du patrimoine donation projects… | done | commit 2c00a3e. Findings: docs/reports/collectes-fondation.md (public search API POST /api/v2/search/projects, region 28, 247 in-progress Normandy collects, robots/sitemap, data-quality caveats). Script: pnpm collectes:match (--snapshot/--radius/--write) → docs/reports/collectes-suggestions.json (19/20 events, 45 suggestions: 14 commune, 31 ≤10 km). Admin: 'Collectes proches à valider' Associer/Ignorer (requireRole EDITOR, lib/actions/fundraising.ts); fundraisingUrl/Title/Image with fondation-patrimoine.org URL validation; public CTA 'Faire un don' + card badge 'Collecte'. Tests: lib/fundraising/*.test.ts, lib/actions/fundraising.test.ts, lib/schemas/event.test.ts, lib/actions/events.test.ts (426/426 unit); e2e/fundraising.spec.ts 3/3 + 48/48 affected specs. Screenshots docs/screenshots/2027/p33-*-{1440,390}.png, overflow 0. Provisional: radius 10 km (DEFAULT_RADIUS_KM / --radius). Prod: migration + run script with --write by an authorized person. |
| P4 | M8/M9 visitor questionnaire, M10 public stats, M11 photo gallery, M5 donation-site banner, M15 year-round… | done | Backlog only, no code: docs/backlog-2027.md (commit 27cc258) — M8/M9, M10, M11, M5, M15, M12/M13 (undefined, need Cédric), plus M14; each with need, technical lead and decisions required. |

## Blocages et ce qu'il faut à Cédric

Rien ci-dessous n'empêche un item du goal d'être `done` : ce sont les étapes hors de
portée de ce VPS (aucun accès à my-dev-box, à Dokploy ni à la base de prod) et les
valeurs provisoires à confirmer.

### Mise en production (accès my-dev-box / Dokploy requis)

1. **Pousser et déployer** `feat/pel-2027` après revue. Aucune PR n'a été ouverte.
2. **Migrations** à appliquer en prod avec `pnpm prisma migrate deploy`, dans l'ordre :
   `20260501000000_add_tourinsoft_photos_registration_links` (idempotente),
   `20261107000000_add_sync_runs`, `20261107010000_add_department_settings`,
   `20261107020000_add_editions`, `20261107030000_add_cover_image_alt`,
   `20261108010000_add_themes` (crée aussi le thème Millénaire),
   `20261108020000_add_travel_books`, `20261108030000_add_fundraising`.
3. **Variables d'environnement** (voir `docs/deploy-self-hosted.md`) :
   `TOURINSOFT_SYNC_INTERVAL_MINUTES` (ex. `360`) ou un cron Dokploy avec `CRON_SECRET`,
   `OPENROUTER_API_KEY` (traduction EN et outils IA, absente ici : chemin IA réel non
   testé), `REVALIDATE_TOKEN`.
4. **Synchronisation Tourinsoft** (P0.4) : une fois déployée, vérifier
   `/api/healthz/tourinsoft`. Au diagnostic, 3 des 4 offres du flux manquaient en prod.
5. **Récupération v1** (P0.6) : lancer `scripts/import-directus.ts` contre la base de
   prod (100 sites manquants, dont 55 en Seine-Maritime). Testé de bout en bout sur la
   base locale (418 brouillons créés).
6. **Collectes** (P3.3) : lancer `pnpm collectes:match --write` contre la base de prod,
   puis faire valider les suggestions par les éditeurs.
7. **Événements existants** : les couvertures publiées sans texte alternatif doivent être
   décrites avant de pouvoir être réenregistrées (compteur « À traiter » du tableau de
   bord).

### Valeurs provisoires et décisions

- Dates 2027 : **21–23 mai 2027** par défaut, modifiables dans l'admin (P1.2). Embargo par
  département : aucun par défaut, dates à saisir dans `/admin/edition` (P0.5).
- Logo Millénaire : SVG provisoire `public/themes/millennium-marker.svg`, remplaçable par
  téléversement sur le thème (Cédric peut le remplacer par une image générée).
- Rayon des collectes : **10 km** (`DEFAULT_RADIUS_KM`, option `--radius`).
- Logos officiels des départements pour `/inscription` : fichiers et droits d'usage
  manquants (cartes numérotées en attendant).
- M19 interprété comme les outils IA de l'admin. M12/M13 non définis dans le compte
  rendu, M14 placé dans le backlog.

### Points connus, hors périmètre

- Collectes : l'API de recherche de fondation-patrimoine.org n'est pas documentée et peut
  changer ; les données externes ont des GPS faux ou absents (voir
  `docs/reports/collectes-fondation.md`).
- Carte : les repères sont dessinés sur un canvas Mapbox, et la carte est masquée à
  l'impression du carnet. Les listes textuelles restent la version accessible.
- Hors de Vercel, `@vercel/analytics` et `@vercel/speed-insights` (`app/layout.tsx`)
  provoquent deux 404 (`/_vercel/insights/script.js`, `/_vercel/speed-insights/script.js`).
  Sans effet sur l'affichage. À retirer ou remplacer après la migration auto-hébergée.

## Commits locaux (`main..feat/pel-2027`, plus le commit de ce rapport)

- `675e5e6` test(e2e): pass on a production build
- `784eaf9` fix(cache): revalidate public pages under their locale after admin changes
- `27cc258` docs(backlog): 2027 items left out of the goal (questionnaire, stats, gallery, donation banner, year-round site)
- `c81035f` style: wrap long lines with prettier
- `2c00a3e` feat(fundraising): Fondation du patrimoine collects near each event
- `4ceaabf` feat(travel-book): favourites without account, travel book page, print and shared link
- `37be1ad` feat(themes): Millennium theme with filter, home section, map marker and admin
- `e9e7abd` feat(admin): mobile layout, French publish review and design tokens
- `fefbe7d` feat(admin): list filters kept everywhere, sort, period, bulk actions and to-do counters
- `9aecf61` feat(admin): Tourinsoft badge, source filter and unpublish instead of delete
- `4d1c05f` feat(admin): required alt texts with AI proposal and real editor dialogs
- `31688e6` feat(admin): keep unsaved work, accessible FR/EN tabs and safe dates
- `ba598fb` feat(admin): real Translate, SEO and RGAA tools in the form action bar
- `40d6e35` fix(admin): AI publish review only on first publish, keep editor work
- `556e927` feat(footer): discreet developer credit as a reusable package
- `d0615dd` feat(inscription): three clear steps and a card per department
- `6268fa8` feat(event): same-day nearby suggestions and a readable map
- `0b9831b` feat(events): combine several festival nights in the date filter
- `a6ceeb3` fix(pages): drop duplicated markdown title heading; content-agnostic page specs
- `71b99cc` feat(edition): DB-backed edition dates editable in admin (default 21–23 May 2027)
- `171da97` feat(public): finish editorial redesign (semantic headings, accessibility page)
- `7ff559a` test(e2e): tolerate empty home event-card state (data/mode dependent)
- `6a6a01f` test(e2e): align public specs with editorial redesign
- `d023fb4` fix(a11y): footer contrast + logo link accessible-name match (Lighthouse a11y 100)
- `a44f549` chore: exclude design-reference/audit from eslint, drop unused import
- `6abe2e2` feat(public): editorial redesign of static pages + contact
- `ab774b2` feat(public): editorial redesign of event detail + news (listing & article)
- `6af0c94` feat(public): editorial redesign of programme listing (grid + map)
- `f7c90be` feat(public): editorial Edito redesign — foundations, chrome, two-state home
- `0b52043` feat(recovery): compare v1 with prod and import missing v1 events
- `777a7cc` feat(embargo): per-department publication date for Tourinsoft imports
- `232d775` feat(tourinsoft): self-hosted scheduler, sync health and prod diagnostic
- `415e6da` fix(tourinsoft): translate imported offers without an admin session
- `8ea7f18` fix(public): stop event and news detail pages from returning 500
- `6de77b3` fix(db): add idempotent migration for tourinsoft, photos and registration links
