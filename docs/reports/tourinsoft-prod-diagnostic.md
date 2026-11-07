# Tourinsoft feed vs public site — diagnostic

Generated 2026-11-07T21:26:54.425Z by `scripts/diagnose-tourinsoft-prod.ts` (read-only GETs).

- Target: https://pierres-en-lumieres.my-dev-box.ovh
- Offers in the Tourinsoft feed: **4**
- Published events (map view inventory, unpaginated): **409**
- Listing `/fr/evenements?page=1..35`: 409 cards, **302** distinct events
- Published events a visitor cannot reach by paging the listing: **107**
  (the listing ordered only by `dateStart`, so OFFSET pages overlapped — fixed
  on `feat/pel-2027` by adding `id` as tie-breaker)
- Feed offers missing from the public site: **3**

| Tourinsoft id | Title | Commune | Start | Public site |
|---|---|---|---|---|
| FMANOR014V54OBES | Pierres en lumières au Château de Pontécoulant | Pontecoulant (CALVADOS) | 2027-05-22 | **missing** |
| FMANOR014V54OSYR | Pierres en lumières au château de Canon | Mézidon Vallée D'Auge (CALVADOS) | 2027-05-21 | **missing** |
| FMANOR014V55FSLZ | Lumières au château de Pontécoulant | Pontecoulant (CALVADOS) | 2027-05-22 | present (`lumieres-au-chateau-de-pontecoulant-1`), not reachable by browsing |
| FMANOR014V56HO51 | Le Château de Colombières illuminé pour Pierres en Lumières | Colombieres (CALVADOS) | 2027-05-21 | **missing** |

Matching is by slug derived from the Tourinsoft title (with `-N` suffix
variants). A slug match says a site with that title is published, not that it
is the 2027 offer: an older edition with the same title also matches.
Recovery: `docs/deploy-self-hosted.md` § Recovery runbook.

<details><summary>Published events not reachable through the listing (107)</summary>

- `festival-magnetik` — BERNAY
- `reliques-et-vetements-liturgiques` — ACQUIGNY
- `concert-sonates-du-rosaire-par-lescadron-volant-de-la-reine-au-manoir-de-courboyer` — PERCHE EN NOCE
- `lumieres-dans-leglie-de-norrey` — SAINT-MANVIEU-NORREY
- `eglise-saint-come` — 
- `cabane-vauban-de-jullouville` — 
- `lumiere-sur-langrune` — LANGRUNE-SUR-MER
- `quand-le-clocher-tors-s-anime` — SAINT-AUBIN-SUR-GAILLON
- `eglise-de-tocqueville` — 
- `visite-de-l-ancienne-banque-de-france-d-evreux` — EVREUX
- `cryptors-in-jullouville` — JULLOUVILLE
- `moulin-de-la-ville-2` — 
- `concert-a-l-eglise-sainte-marguerite` — CARROUGES
- `visite-du-moulin-et-degustation` — NEGREVILLE
- `concert-de-l-ecole-maitrisienne-de-notre-dame-saint-francois` — SEREZ
- `si-l-eglise-de-croth-nous-etait-contee` — CROTH
- `visite-commentee-du-carmel-de-saint-pair-sur-mer` — 
- `parc-musee-du-granit-1` — 
- `festival-magnetik-exposition-dans-l-eglise` — BERNAY
- `a-la-rencontre-des-resistants-dechauffour-` — ECHAUFFOUR
- `mise-en-lumieres-de-l-hotel-de-ville` — ALENCON
- `balade-nocturne-theatralisee` — 
- `les-vitraux-de-saint-aubin` — DOUDEAUVILLE-EN-VEXIN
- `sophro-balade-a-la-tombee-de-la-nuit` — JULLOUVILLE
- `projection-de-cartes-postales-et-photos-anciennes-sur-bieville-beuville` — BIEVILLE-BEUVILLE
- `un-phare-pour-eclairer-le-perche` — LONGNY LES VILLAGES
- `lavoir-de-carentan` — 
- `exposition-de-peintres-locaux` — 
- `mise-en-lumiere-exceptionnelle-des-vitraux-de-l-eglise-saint-gilles` — LA NEUVE-LYRE
- `visite-guidee-de-l-eglise-saint-crepin-saint-crepinien` — BEAUCHAMPS
- `site-de-la-chapelle-sur-vire` — 
- `manoir-du-bois` — 
- `lumieres-et-transparences-a-leglise-saint-aubin-exposition-de-creations-de-papier` — BOECE
- `lumieres-dans-l-eglie-de-norrey` — SAINT-MANVIEU-NORREY
- `college-saint-joseph-de-villedieu-les-poeles` — 
- `a-la-rencontre-des-resistants-d-echauffour` — ECHAUFFOUR
- `nuit-venitienne-au-musee-du-verre-29-05-2026` — CONCHES-EN-OUCHE
- `culture-et-patrimoine-a-port-en-bessin` — PORT-EN-BESSIN-HUPPAIN
- `pierres-en-lumieres-exposition-de-peintres-locaux` — LESSAY
- `eglise-saint-nicolas-de-barfleur` — 
- `nuit-des-couleurs-a-leglise-saint-pierre` — LA ROCHE-MABILE
- `concert-de-fado-a-l-eglise-notre-dame-sur-l-eau` — DOMFRONT EN POIRAIE
- `spectacle-le-mystere-de-la-verrerie-royale-des-glaces` — 
- `illumination-de-l-eglise-saint-medard-a-illeville-sur-monfort` — ILLEVILLE-SUR-MONTFORT
- `pierres-en-lumieres-au-chateau-de-vouilly` — ISIGNY-SUR-MER
- `hip-hop-o-chateau` — CREULLY SUR SEULLES
- `pleins-feux-sur-nos-vitraux-ils-racontent-de-belles-histoires` — LES ANDELYS
- `lumieres-et-transparences-a-l-eglise-saint-aubin-exposition-de-creations-de-papier` — BOECE
- `prestarts` — MERLERAULT-LE-PIN
- `pierres-en-lumieres-sous-les-deux-clochers-d-epieds` — EPIEDS
- `musee-blanche-hoschede-monet-au-son-d-une-lecture-musicale` — VERNON
- `chapelle-sainte-marie-aux-anglais-chant-joie-lumiere-` — SURESNES
- `manoir-de-dur-ecu-2` — 
- `parc-musee-du-granit` — SAINT-MICHEL-DE-MONTJOIE
- `piece-de-theatre-le-loup-des-archives` — EVREUX
- `appenai-en-lumiere` — APPENAI-SOUS-BELLEME
- `exposition-au-carmel-de-saint-pair-sur-mer` — SAINT-PAIR-SUR-MER
- `la-cote-de-l-estree-racontee-par-les-collegiens` — MUZY
- `eglise-saint-honorine` — 
- `ferme-musee-du-cotentin-soiree-autour-de-l-exposition-systeme-d-day` — SAINTE-MERE-EGLISE
- `pierres-en-lumieres-visite-nocturne-du-phare-de-carteret` — 
- `illuminations-et-animations-autour-de-l-eglise-sainte-honorine` — AUDOUVILLE-LA-HUBERT
- `lumieres-sur-l-eglise-de-pinterville` — PINTERVILLE
- `chateau-de-chanteloup` — 
- `ferme-musee-du-cotentin-soiree-autour-de-lexposition-systeme-d-day` — 
- `manoir-du-coquerel` — 
- `pierres-en-lumieres-contes-et-legendes-au-bois-des-roches` — VALOGNES
- `pierres-en-lumieres-a-la-batterie-dazeville` — AZEVILLE
- `concert-de-fado-a-notre-dame-sur-leau` — DOMFRONT EN POIRAIE
- `patrimoines-du-bourg-en-lumiere-` — TOURNEVILLE-SUR-MER
- `chapelle-de-monteglise-et-petite-chapelle-de-la-communaute` — 
- `l-eglise-saint-roch-de-courteille-s-illumine` — ALENCON
- `cinema-en-plein-air-projection-du-documentaire-semer-et-recolter-deric-le-roch` — SAINT-CYR-LA-ROSIERE
- `leglise-notre-dame-mise-en-lumieres` — LA FERTE MACE
- `mise-en-lumiere-de-l-eglise-medievale-saint-sebastien-de-meguillaume` — PUTANGES-LE-LAC
- `chapelle-notre-dame-de-la-roquelle` — 
- `chateau-des-matignon` — 
- `des-vitraux-pour-l-eglise-saint-malo-de-la-fresnaye-au-sauvage` — PUTANGES-LE-LAC
- `exposition-de-peinture` — COLOMBELLES
- `pierres-en-lumieres-visite-nocturne-du-chateau-medieval-de-bricquebec` — VALOGNES
- `lumieres-dans-tous-les-sens-au-manoir-de-la-rimbert` — DOMFRONT EN POIRAIE
- `trio-malaga-et-lumieres-de-la-cote-de-nacre-sur-grand-ecran-a-l-eglise-de-lion-sur-mer` — LION-SUR-MER
- `escape-game-et-illuminations-a-la-grosse-forge` — AUBE
- `lumieres-au-chateau-de-pontecoulant-1` — CONDE-EN-NORMANDIE
- `eglise-de-periers` — PERIERS
- `louvagny-en-lumieres` — LOUVAGNY
- `abbatia-lumina` — VERNEUIL D'AVRE ET D'ITON
- `a-la-decouverte-des-tresors-de-l-eglise-saint-denis` — MAHERU
- `sainte-genevieve-en-lumieres` — BOURG-BEAUDOUIN
- `ouverture-de-l-eglise-de-saint-andre-d-hebertot` — SAINT-ANDRE-D'HEBERTOT
- `presentation-insolite-de-l-eglise-saint-sylvestre-de-lantheuil-et-de-ses-abords` — PONTS SUR SEULLES
- `eglise-saint-pierre-et-saint-paul-de-periers` — 
- `lumiere-sur-lhotel-gauquelin-des-pallieres` — BAYEUX
- `metier-d-art-tailleur-de-pierres-a-maizieres` — MAIZIERES
- `maison-jacques-prevert-1` — 
- `mise-en-lumiere-de-leglise-saint-laumer` — LE PAS-SAINT-L'HOMER
- `exposition-photo-lumiere-sur-lart-en-mains-et-illuminations-de-leglise-saint-pierre-de-courcerault-e` — PERCHE EN NOCE
- `concert-gospel-eglise-saint-ouen-de-rocques` — ROCQUES
- `concert-et-illuminations-de-l-eglise-saint-pierre` — LA CHAPELLE-MONTLIGEON
- `chateau-de-treprel` — PARIS
- `lumieres-a-agy` — AGY
- `decouverte-de-leglise-sainte-madeleine` — BAGNOLES DE L'ORNE NORMANDIE
- `voyage-a-la-lueur-des-lampes` — LE MOLAY-LITTRY
- `pierre-en-lumieres-place-de-gaulle` — BAYEUX
- `illumination-et-concert-au-chateau-de-lion-sur-mer` — LION-SUR-MER
- `lumieres-sur-l-eglise-de-bernieres-sur-mer` — BERNIERES-SUR-MER
- `maison-jacques-prevert` — LA HAGUE

</details>
