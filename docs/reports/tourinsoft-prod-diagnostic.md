# Tourinsoft feed vs public site — diagnostic

Generated 2026-11-07T21:17:20.558Z by `scripts/diagnose-tourinsoft-prod.ts` (read-only GETs).

- Target: https://pierres-en-lumieres.my-dev-box.ovh
- Offers in the Tourinsoft feed: **4**
- Listing pages walked (`/fr/evenements?page=1..35`): 35, event cards seen: 409
- Distinct event slugs reachable through the listing: **302**
  (cards seen minus distinct = events repeated across pages; the listing
  ordered only by `dateStart`, so OFFSET pages overlapped and the
  remaining events were unreachable — fixed on `feat/pel-2027`)
- Feed offers only found through search (unreachable by browsing): **1**
- Feed offers missing from the public site: **3**

| Tourinsoft id | Title | Commune | Start | Public site |
|---|---|---|---|---|
| FMANOR014V54OBES | Pierres en lumières au Château de Pontécoulant | Pontecoulant (CALVADOS) | 2027-05-22 | **missing** |
| FMANOR014V54OSYR | Pierres en lumières au château de Canon | Mézidon Vallée D'Auge (CALVADOS) | 2027-05-21 | **missing** |
| FMANOR014V55FSLZ | Lumières au château de Pontécoulant | Pontecoulant (CALVADOS) | 2027-05-22 | present via search only (`lumieres-au-chateau-de-pontecoulant-1`) |
| FMANOR014V56HO51 | Le Château de Colombières illuminé pour Pierres en Lumières | Colombieres (CALVADOS) | 2027-05-21 | **missing** |

Matching is by slug derived from the Tourinsoft title (with `-N` suffix
variants), first against the paginated listing, then through `?search=<title>`.
A match by slug says the site exists in prod, not that it is the 2027 offer:
an older edition with the same title also matches. Recovery: see `docs/deploy-self-hosted.md` § Tourinsoft recovery.
