# QA Audit — Pierres en Lumières

## VERDICT GLOBAL : NEEDS WORK

Le squelette est excellent (16 stories, toutes les pages, admin, auth, SEO). Le design glassmorphism est cohérent et intentionnel. Mais il manque l'âme, les images, et il y a des bugs à corriger avant présentation.

---

## Pages testées

| Page | Status | Notes |
|------|--------|-------|
| Homepage `/` | ✅ Charge | Hero statique, pas de vidéo, cards events sans images |
| Événements `/evenements` | ✅ Charge | Grid 4 cols, filtres OK, pagination OK, compteur KO |
| Événement détail `/evenement/[slug]` | ✅ Charge | Carousel, carte Leaflet/OSM, infos OK |
| Actualités `/actualites` | ✅ Charge | 3 cards, images placeholder |
| Festival `/festival` | ✅ Charge | Long contenu éditorial, images placeholder navy |
| Contact `/contact` | ✅ Charge | Formulaire 2 colonnes, Resend placeholder |
| Inscription `/inscription` | ✅ Charge | Rickroll en vidéo placeholder 😄, liens départements |
| Mentions légales `/mentions-legales` | ✅ Charge | Contenu RGPD, hébergeur Vercel, email RGPD |
| Admin login `/admin/login` | ✅ Charge | Magic link glassmorphism card |
| Mobile (375px) | ✅ Responsive | 1 colonne, hamburger, pas de scroll horizontal |

---

## BUGS (à fixer)

### P0 — Bloquants

- [ ] **Images seed 404** — Les 17 JPG dans public/images/seed/ sont des fichiers texte "placeholder", pas des vraies images. Les 6 logos PNG partenaires sont complètement manquants (logo-region-normandie.png, etc.). → **Récupérer les images de l'ancien site ou créer de vrais placeholders**
- [ ] **Compteur événements ne se met pas à jour** — Après filtre par département Calvados, le texte reste "16 événements" au lieu de montrer le nombre filtré → **Fix dans events page.tsx : utiliser le count retourné par la query filtrée**
- [ ] **Pagination non-reset après filtre** — Si on est page 2+ et qu'on applique un filtre, on reste sur la même page → résultats vides → **Fix dans filter-modal.tsx handleApply : ajouter `params.delete("page")`**
- [ ] **Console error Base UI** — "A component that acts as a button expected a native `<button>`" dans le Header → **Fix le composant Button dans le header qui utilise un `<a>` comme bouton**
- [ ] **7 issues Next.js** — Dev overlay montre "7 Issues" / "1 Issue" selon les pages → **Identifier et fix chaque issue**
- [ ] **Rickroll en vidéo inscription** — La vidéo YouTube sur /inscription est un rickroll au lieu de la vraie vidéo du festival (ID: AHnGhy1o0pA) → **Remplacer par https://www.youtube.com/embed/AHnGhy1o0pA**
- [ ] **dotenv pas chargé dans seed** — `pnpm db:seed` fail car DATABASE_URL non chargé → **Ajouter `import 'dotenv/config'` en haut de seed.ts ou utiliser tsx avec --env-file**

### P1 — Importants

- [ ] **Pas de vidéo hero** — L'ancien site a un hero vidéo avec feu de camp nocturne. Le nouveau = gradient statique. C'est le "wow factor" #1 manquant → **Ajouter la vidéo de l'ancien site en background du hero**
- [ ] **Cards sans image = blocs morts** — Les cards événement sans image sont des rectangles sombres sans vie → **Ajouter un fallback : gradient aléatoire basé sur la catégorie, ou pattern SVG, ou image catégorie par défaut**
- [ ] **Emoji "✦" comme logo** — Utilisé dans le header et footer. C'est un emoji, pas un SVG → **Créer un vrai SVG sparkle ou récupérer le logo du site actuel**
- [ ] **Resend error handling silencieux** — L'action contact ne log pas les erreurs Resend → **Ajouter un try/catch avec logging de l'erreur**
- [ ] **Texte muted faible contraste** — Les sous-titres gris clair sur fond navy sombre sont probablement < 4.5:1 → **Vérifier et augmenter la luminosité du muted text**

### P2 — Améliorations UX

- [ ] **Pas de chips de filtre actif** — Quand un filtre est actif, seul un badge numérique apparaît. Il faudrait des chips "Calvados ×" "Illuminations ×" pour retirer facilement → **Ajouter des chips sous la barre de recherche**
- [ ] **Pas de preview résultats dans filtre** — On ne sait pas combien de résultats correspondent avant de valider → **Ajouter "X résultats" en bas de la modale filtre**
- [ ] **Recherche limitée aux villes** — Pas de recherche par nom d'événement → **Étendre le full-text search au titre + description**
- [ ] **Pas de breadcrumb pages détail** — /evenement/illumination-abbaye-aux-hommes n'a pas de breadcrumb → **Ajouter Événements > Illumination de l'Abbaye aux Hommes**
- [ ] **Footer sans CTA inscription** — Le lien "Inscrivez votre événement" est dans le header mais pas le footer → **L'ajouter dans la navigation du footer**
- [ ] **Titres orange incohérents** — Sur les cards événements, certains titres sont blancs et d'autres orange/ambre → **Uniformiser : blanc au repos, ambre au hover**

### P3 — Design "Wow Factor"

- [ ] **Pas d'effets de lumière** — Pour "Pierres en Lumières", il faut des effets lumineux : glow sur les cards au hover, halos radiaux subtils sur le hero, peut-être des particules de lumière → **CSS glow effects + animated radial gradients**
- [ ] **Micro-animations absentes** — Les sections n'ont pas de fade-in au scroll → **Ajouter des animations d'entrée staggerées sur les cards (IntersectionObserver + CSS transitions)**
- [ ] **Hero trop template** — Badge + titre centré + 2 CTA = générique. L'ancien site avait la recherche intégrée dans le hero → **Remonter la barre de recherche dans le hero, ajouter plus de dynamisme**
- [ ] **Page Festival monotone** — Les sections départements sont toutes identiques (texte + image placeholder). Pas de variation de layout → **Alterner les positions image gauche/droite, ajouter des quotes, varier les tailles**

### P4 — RGAA / Accessibilité avancée

- [ ] **Mode contraste élevé manquant** — Toggle dans le header pour augmenter le contraste de tous les textes → **Ajouter un switch avec classe CSS qui force des couleurs WCAG AAA**
- [ ] **Pas de redimensionnement texte** — Boutons A+ / A- pour les malvoyants → **Ajouter un contrôle de font-size dans le header ou le footer**
- [ ] **Focus ring à vérifier sur fond sombre** — Les focus rings par défaut sont souvent invisibles sur navy → **Vérifier et forcer des focus rings ambre/blanc visibles**
- [ ] **Aria descriptions manquantes** — Les icônes sociales ont juste "Facebook"/"Instagram" comme aria-label, mais les boutons de pagination n'ont pas de description → **Audit complet des aria-labels**

### P5 — Config / Production

- [ ] **Resend API key placeholder** — `re_placeholder_for_development` → **Configurer avec une vraie clé Resend**
- [ ] **BLOB_READ_WRITE_TOKEN manquant** — Uploads admin vont fail → **Configurer pour Vercel Blob**
- [ ] **next.config.ts vide** — Pas de config images, pas de headers sécurité → **Ajouter images.remotePatterns pour Vercel Blob**
- [ ] **BETTER_AUTH_URL fragile** — Hardcodé à localhost:3010 → **Utiliser NEXT_PUBLIC_BASE_URL ou auto-detect**
- [ ] **Admin non testable** — Pas de Resend = pas de magic link = pas de login admin → **Ajouter un mode dev avec login direct (email sans magic link)**

---

## Comparaison vs ancien site (pierresenlumieres.fr)

| Feature | Ancien site | Nouveau site | Verdict |
|---------|-------------|-------------|---------|
| Hero | Vidéo feu de camp 🔥 | Gradient statique | 👎 Downgrade |
| Design | Dark + peach, propre | Glassmorphism navy + ambre | 👍 Step up |
| Événements grid | 4 colonnes avec images | 4 colonnes sans images (placeholder) | 👎 Pas prêt |
| Filtres | Date/Catégorie/Département/PMR | Idem + meilleur UI (modale) | 👍 Step up |
| Recherche | Autocomplete lieu | Autocomplete ville | ≈ Pareil |
| Carte événement | Leaflet | Leaflet/OSM | ≈ Pareil |
| Page Festival | Texte + images par département | Texte + placeholders | 👎 Pas prêt |
| Contact | Formulaire simple | Formulaire + routage département | 👍 Step up |
| Admin | Directus CMS | CMS maison Better Auth | 👍 Plus adapté |
| Mobile | Responsive basique | Mobile-first, hamburger menu | 👍 Step up |
| Accessibilité | Faible (pas de skip-nav, alt="Tuple") | Skip-nav, aria, PMR badges | 👍 Gros step up |
| SEO | Pas de meta, pas de sitemap | Meta + OG + sitemap + robots | 👍 Gros step up |
| Performances | Nuxt SSR sur VPS | Next.js ISR sur Vercel | 👍 Bien meilleur |
| Typo | Sans-serif générique | Playfair Display + Inter | 👍 Plus élégant |

**Score global : Le nouveau site est structurellement supérieur sur tous les points sauf le contenu visuel (images/vidéo). C'est la priorité #1 avant présentation.**

---

## Plan d'action pour le weekend

### Samedi (aujourd'hui)
1. Récupérer les images de l'ancien site via Chrome MCP (scraping Directus API)
2. Intégrer la vidéo hero du festival
3. Fix les bugs P0 (compteur, pagination, console errors)
4. Fix les images placeholder et logos partenaires

### Dimanche
5. Effets de lumière (glow, animations)
6. Chips de filtre actif
7. Cards fallback design
8. Polish final (micro-animations, focus rings, contraste)

### Lundi — Présentation
9. Vérification finale de toutes les pages
10. Test admin avec vraie clé Resend
