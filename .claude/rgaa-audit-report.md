# RGAA Audit Report — Pierres en Lumières

**Date:** 2026-03-16
**Branch:** feat/rgaa-audit
**Scope:** All public pages

## Audit Results per Page

### ✅ Homepage `/`
- **Errors:** 0
- **Warnings:** 0
- **Headings:** H1→H2→H3 ✓

### ✅ Événements `/evenements`
- **Errors:** 0 (fixed: added sr-only H2 "Résultats")
- **Warnings:** 0
- **Headings:** H1→H2→H3 ✓

### ❌ Festival `/festival`
- **Error:** No H1 — page starts with H2 "Le Festival Pierres en Lumières"
- **Fix:** The page uses `getPageBySlug('festival')` which renders markdown content. The markdown starts with `## Le Festival`. Either:
  - Add a H1 in the page template before the markdown content
  - Or change the markdown to start with `# Le Festival`
- **File:** `app/(public)/festival/page.tsx`

### ❌ Inscription `/inscription`
- **Error:** No H1 — page starts with H2 "Inscrivez votre événement"
- **Fix:** Same issue — markdown content starts with `##`. Add H1 wrapper in page template.
- **File:** `app/(public)/inscription/page.tsx`

### ❌ Mentions légales `/mentions-legales`
- **Error:** No H1 — page starts with H2 "Mentions légales"
- **Fix:** Same pattern. Add H1 in page template.
- **File:** `app/(public)/mentions-legales/page.tsx`

### ❌ Actualité détail `/actualite/[slug]`
- **Error:** Runtime error — page displays "Oups, une erreur s'est produit"
- **Root cause:** Likely date serialization issue in `getNewsBySlug`. The `publishedAt` field is serialized as ISO string but the page component might expect a Date object.
- **Fix:** Check `app/(public)/actualite/[slug]/page.tsx` — the `formatNewsDate` function must accept `string | null` (already fixed in signature but page might have other Date usage).
- **File:** `app/(public)/actualite/[slug]/page.tsx`, `lib/queries/news.ts`

### ✅ Événement détail `/evenement/[slug]`
- **Errors:** 0
- **Warnings:** 0
- **Headings:** H1→H2 ✓
- **Note:** Duplicate H2 "Contact" (one in content, one in footer) — acceptable per RGAA since they're in different landmark regions.

### ✅ Actualités `/actualites`
- **Errors:** 0
- **Warnings:** 0
- **Headings:** H1→H2 ✓

### ✅ Contact `/contact`
- **Errors:** 0
- **Warnings:** 0
- **Headings:** H1→H2 ✓

### ✅ Accessibilité `/accessibilite`
- **Errors:** 0
- **Warnings:** 0
- **Headings:** H1→H2 ✓

## Summary of Fixes Required

| # | Priority | Page | Issue | RGAA Criterion | Fix |
|---|----------|------|-------|----------------|-----|
| 1 | HIGH | `/festival` | No H1 | 9.1 | Add H1 in page template before markdown content |
| 2 | HIGH | `/inscription` | No H1 | 9.1 | Add H1 in page template before markdown content |
| 3 | HIGH | `/mentions-legales` | No H1 | 9.1 | Add H1 in page template before markdown content |
| 4 | HIGH | `/actualite/[slug]` | Runtime error | 8.x | Fix date serialization — check page consumes ISO strings correctly |

## Already Passing (no action needed)

- `/` — Homepage ✅
- `/evenements` — Events list ✅
- `/evenement/[slug]` — Event detail ✅
- `/actualites` — News list ✅
- `/contact` — Contact ✅
- `/accessibilite` — Accessibility declaration ✅

## Global Checks (all pages)

| Check | Status |
|-------|--------|
| `<html lang="fr" dir="ltr">` | ✅ |
| Skip link → #main-content | ✅ |
| Skip link → #footer-nav | ✅ |
| Landmarks: banner, main, contentinfo, nav | ✅ |
| Focus visible on all interactives | ✅ |
| Contrast AA (4.5:1) | ✅ min 8.31:1 |
| Contrast AAA toggle (7:1) | ✅ min 10.43:1 |
| prefers-reduced-motion | ✅ |
| forced-colors media query | ✅ |
| No positive tabindex | ✅ |
| No duplicate IDs | ✅ |
| Form labels with aria-describedby | ✅ |
| Carousel pause button | ✅ |
| Carousel ARIA roledescription | ✅ |
| Map role="img" + sr-only fallback | ✅ |
| /accessibilite declaration page | ✅ |
| Contrast toggle with visible label | ✅ |
| 0 console errors | ✅ |
