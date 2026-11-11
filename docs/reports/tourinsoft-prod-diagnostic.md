# Tourinsoft feed vs public site — diagnostic

Generated 2026-11-11T02:04:39.385Z by `scripts/diagnose-tourinsoft-prod.ts` (read-only GETs).

- Target: https://pierres-en-lumieres.my-dev-box.ovh
- Offers in the Tourinsoft feed: **4**
- Published events (map view inventory, unpaginated): **413**
- Listing `/fr/evenements?edition=all&page=1..35`: 413 cards, **413** distinct events
- Published events a visitor cannot reach by paging the listing: **0**
  (the listing ordered only by `dateStart`, so OFFSET pages overlapped — fixed
  on `feat/pel-2027` by adding `id` as tie-breaker)
- Feed offers missing from the public site: **0**

| Tourinsoft id | Title | Commune | Start | Public site |
|---|---|---|---|---|
| FMANOR014V54OBES | Pierres en lumières au Château de Pontécoulant | Pontecoulant (CALVADOS) | 2027-05-22 | present (`pierres-en-lumieres-au-chateau-de-pontecoulant-2`) |
| FMANOR014V54OSYR | Pierres en lumières au château de Canon | Mézidon Vallée D'Auge (CALVADOS) | 2027-05-21 | present (`pierres-en-lumieres-au-chateau-de-canon-2`) |
| FMANOR014V55FSLZ | Lumières au château de Pontécoulant | Pontecoulant (CALVADOS) | 2027-05-22 | present (`lumieres-au-chateau-de-pontecoulant-1`) |
| FMANOR014V56HO51 | Le Château de Colombières illuminé pour Pierres en Lumières | Colombieres (CALVADOS) | 2027-05-21 | present (`le-chateau-de-colombieres-illumine-pour-pierres-en-lumieres-2`) |

Matching is by slug derived from the Tourinsoft title (with `-N` suffix
variants). A slug match says a site with that title is published, not that it
is the 2027 offer: an older edition with the same title also matches.
Recovery: `docs/deploy-self-hosted.md` § Recovery runbook.

<details><summary>Published events not reachable through the listing (0)</summary>



</details>
