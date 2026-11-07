# v1 (pierresenlumieres.fr) vs new site — published events 2026

Generated 2026-11-07T21:31:41.876Z by `scripts/compare-v1-prod.ts` (read-only GETs:
v1 Directus public API, new site `/fr/evenements?view=map`).

- New site: https://pierres-en-lumieres.my-dev-box.ovh
- v1 published events, edition 2026: **423** (Calvados 88, Eure 98, Manche 123, Orne 57, Seine-Maritime 57)
- New site published events (all editions): **409**
- v1 events found on the new site: **323** (214 by title+commune, 45 by geo+title, 63 by slug, 1 by geo)
- **v1 events missing on the new site: 100** (Calvados 14, Eure 15, Manche 13, Orne 3, Seine-Maritime 55)
- New-site events with no v1 2026 counterpart: 112

Matching (`lib/directus/match.ts`): the new site exposes no Tourinsoft id
publicly, so events are matched by accent/case-insensitive title + commune,
then title slug (same edition only, ±7 days), then — for renamed events — same place (≤ 250 m) with a shared
title word, then the only event at the same spot (≤ 50 m). Place-based matches
are listed below for review. Recovery of the missing ones:
`scripts/import-directus.ts` (see `docs/deploy-self-hosted.md`), which dedupes
on the target database by Tourinsoft id first.

## v1 events missing on the new site

| Tourinsoft id | Title | Commune | Department | Date |
|---|---|---|---|---|
| FMANOR076V524LOV | Pierres en Lumières 2026 en l'église de la Nativité Notre-Dame à BOIS-HEROULT | BOIS-HEROULT | Seine-Maritime | 2026-05-29 |
| FMANOR076V524YJH | Pierres en Lumières 2026 en la chapelle Saint-Julien au BOURG-DUN | LE BOURG-DUN | Seine-Maritime | 2026-05-29 |
| FMANOR050V52Z5ZF | Concert de musique duo Abisko | HELLEVILLE | Manche | 2026-05-29 |
| FMANOR076V525Y6P | [Pierres en Lumières] Concert aux chandelles | RY | Seine-Maritime | 2026-05-29 |
| FMANOR061V50G6SF | Pierres en Lumières : éclairage de l'Eglise Saint-Julien | DOMFRONT EN POIRAIE | Orne | 2026-05-29 |
| FMANOR076V5255T1 | Pierres en Lumières 2026 en l'église Saint-Martin à COLLEVILLE | COLLEVILLE | Seine-Maritime | 2026-05-29 |
| FMANOR014V56LGE4 | Le Fleur En Lumière - Chateau Gonneville sur Honfleur | GONNEVILLE-SUR-HONFLEUR | Calvados | 2026-05-30 |
| FMANOR076V524ZJD | Pierres en Lumières 2026 en l'eglise Saint-Pierre à AUPPEGARD | AUPPEGARD | Seine-Maritime | 2026-05-30 |
| FMANOR076V524LX2 | Pierres en Lumières 2026 au Moulin de l'Arbalète à SAINT-MACLOU-DE-FOLLEVILLE | SAINT-MACLOU-DE-FOLLEVILLE | Seine-Maritime | 2026-05-30 |
| FMANOR076V524CDO | Pierres en Lumières 2026 en l'église Saint-Germain à BEAUSSAULT | BEAUSSAULT | Seine-Maritime | 2026-05-30 |
| FMANOR076V524X79 | Pierres en Lumières 2026 en l'église Saint-Martin à TOURVILLE SUR ARQUES | TOURVILLE-SUR-ARQUES | Seine-Maritime | 2026-05-29 |
| FMANOR014V56I503 | Visite commentée de l'Église Saint-Regnobert  | FAUGUERNON | Calvados | 2026-05-30 |
| FMANOR027V50TJUQ | Pierres en Lumières - Les Puces du Moulin | NEAUFLES-SAINT-MARTIN | Eure | 2026-05-30 |
| FMANOR014V56M4TJ | Lumière dans la grotte  | Lisieux | Calvados | 2026-05-29 |
| FMANOR014V56JI98 | Lumières sur le 64 rue des Bouchers | BAYEUX | Calvados | 2026-05-30 |
| FMANOR076V524Z95 | Pierres en Lumières 2026 en l'église Saint-Germain l'Auxerrois à MANEGLISE | MANEGLISE | Seine-Maritime | 2026-05-29 |
| FMANOR076V5255ZW | Pierres en Lumières 2026 à la Tour des Archives à ROUEN | ROUEN | Seine-Maritime | 2026-05-30 |
| FMANOR076V5252LL | Pierres en Lumières 2026 à la chapelle seigneuriale et la grange à SAUMONT LA POTERIE | SAUMONT-LA-POTERIE | Seine-Maritime | 2026-05-30 |
| FMANOR050V52YM2Z | Eglise Notre-Dame | GENETS | Manche | 2026-05-29 |
| FMANOR027V50TELE | Saint-Christophe en Lumières : concert de musiques de films | SAINT-CHRISTOPHE-SUR-CONDE | Eure | 2026-05-30 |
| FMANOR076V524LNP | Pierres en Lumières 2026 au domaine du BOIS-HEROULT | BOIS-HEROULT | Seine-Maritime | 2026-05-29 |
| FMANOR027V50TDI5 | La baronnie en Lumières | LA BARONNIE | Eure | 2026-05-29 |
| FMANOR076V5253AS | Pierres en Lumières 2026 au Musée des Traditions et Arts Normands - Château de Martainville | MARTAINVILLE-EPREVILLE | Seine-Maritime | 2026-05-30 |
| FMANOR014V56LX70 | Rencontres artistiques et musicales à Urville | URVILLE | Calvados | 2026-05-29 |
| FMANOR076V524ZB1 | Pierres en Lumières 2026 en l'église Saint-Nicolas à MALAUNAY | MALAUNAY | Seine-Maritime | 2026-05-29 |
| FMANOR027V50T63D | Concert de piano au logis-grange (Pierres en Lumières) | LE PLESSIS-SAINTE-OPPORTUNE | Eure | 2026-05-30 |
| FMANOR061V50FWPU | Occagnes en Lumière | OCCAGNES | Orne | 2026-05-29 |
| FMANOR076V524L8S | Pierres en Lumières 2026 à la Chapelle Notre-Dame du Cardonoy à AUMALE | AUMALE | Seine-Maritime | 2026-05-30 |
| FMANOR076V5256C0 | Pierres en Lumières 2026 en la chapelle de Beuzeville à BEAUMONT-LE-HARENG | BEAUMONT-LE-HARENG | Seine-Maritime | 2026-05-30 |
| FMANOR014V56KUM7 | Concert aux chandelles par l’ORPHEON DE BAYEUX | RYES | Calvados | 2026-05-30 |
| FMANOR061V50G6HD | Déambulation aux chandelles dans Bonsmoulins  | BONSMOULINS | Orne | 2026-05-30 |
| FMANOR014V56LD3I | Visite contée de Grainville-Langannerie | GRAINVILLE-LANGANNERIE | Calvados | 2026-05-29 |
| FMANOR014V56M5Z1 | Le Grand Orgue de la cathédrale Saint-Pierre de Lisieux vous dévoile ses secrets. | LISIEUX | Calvados | 2026-05-30 |
| FMANOR050V52ZBLK | Manoir de la Crasvillerie : L'Amerique Latine se présente dans le Cotentin | REVILLE | Manche | 2026-05-27 |
| FMANOR027V50TD1Z | PIERRES EN LUMIÈRES sinvitent au Moulin de Neaufles Saint Martin. | NEAUFLES-SAINT-MARTIN | Eure | 2026-05-30 |
| FMANOR076V524YEG | Pierres en Lumières 2026 en l'église Saint-Martin à HARFLEUR | HARFLEUR | Seine-Maritime | 2026-05-29 |
| FMANOR027V50T2W5 | Entre Pierres et Nature, Balade nocturne à Chambray | MESNILS-SUR-ITON | Eure | 2026-05-29 |
| FMANOR014V56I1RT | Mathieu en Lumières  | MATHIEU | Calvados | 2026-05-30 |
| FMANOR076V524NS5 | Pierres en Lumières 2026 en l'église Saint-Aubin à SAINT-AUBIN-SUR-MER | SAINT-AUBIN-SUR-MER | Seine-Maritime | 2026-05-30 |
| FMANOR076V5250ML | Pierres en Lumières 2026 à l'Ecomusée du lin à AMFREVILLE-LES-CHAMPS | AMFREVILLE-LES-CHAMPS | Seine-Maritime | 2026-05-30 |
| FMANOR076V5257BJ | Pierres en Lumières 2026 en l'église Sainte-Anne à ANGLESQUEVILLE-LA-BRAS-LONG | ANGLESQUEVILLE-LA-BRAS-LONG | Seine-Maritime | 2026-05-29 |
| FMANOR027V50T6DS | Pierres en Lumières - visite guidée aux flambeaux | GISORS | Eure | 2026-05-29 |
| FMANOR076V524MKT | Pierres en Lumières 2026 en l'église Saint-Jean d'Abbetot à LA CERLANGUE | LA CERLANGUE | Seine-Maritime | 2026-05-30 |
| FMANOR076V5251G1 | Pierres en Lumières 2026 en l'église Notre-Dame et Saint-Mathurin à ARELAUNE-EN-SEINE | ARELAUNE-EN-SEINE | Seine-Maritime | 2026-05-29 |
| FMANOR076V524XIK | Pierres en Lumières 2026 en l'église Saint-Martin à CUY-SAINT-FIACRE | CUY-SAINT-FIACRE | Seine-Maritime | 2026-05-30 |
| FMANOR076V524TCS | Pierres en Lumières 2026 en l'Abbatiale Saint-Ouen à ROUEN | ROUEN | Seine-Maritime | 2026-05-30 |
| FMANOR076V524TCP | Pierres en Lumières 2026 en l'église Saint-Jean à ELBEUF | ELBEUF | Seine-Maritime | 2026-05-29 |
| FMANOR076V52500U | Pierres en Lumières à l'Atelier Musée du Textile & des Indiennes à Bolbec | BOLBEC | Seine-Maritime | 2026-05-30 |
| FMANOR050V52YOT2 | Eglise St Martin de Chalandrey | ISIGNY-LE-BUAT | Manche | 2026-05-30 |
| FMANOR027V50T51F | Concert et luminions dans l'église d'Andé - Pierres en lumières | ANDE | Eure | 2026-05-30 |
| FMANOR050V52Z3XC | Concert Armel Amiot L'Homme au piano | BARNEVILLE-CARTERET | Manche | 2026-05-30 |
| FMANOR050V52XK72 | Eglise Saint-Laurent  | SAINT-SAUVEUR-VILLAGES | Manche | 2026-05-29 |
| FMANOR076V5256DT | Pierres en Lumières 2026 au CLOS LUPIN - Maison Maurice LEBLANC  à ETRETAT | ETRETAT | Seine-Maritime | 2026-05-30 |
| FMANOR076V524ZMK | Pierres en Lumières 2026 au Presbytère du XVIe au TREPORT | LE TREPORT | Seine-Maritime | 2026-05-29 |
| FMANOR027V50TH0P | Les Nuits Magnetik : arts numériques et scénographie  | BERNAY | Eure | 2026-05-16 |
| FMANOR076V5252TG | Pierres en Lumières 2026 en l'église Saint-Valery à VEULETTES-SUR-MER | VEULETTES-SUR-MER | Seine-Maritime | 2026-05-30 |
| FMANOR076V5250W4 | Pierres en lumières 2026 au Théâtre Romain de Lillebonne | LILLEBONNE | Seine-Maritime | 2026-05-30 |
| FMANOR050V52XQY1 | Mairie de Saint-Martin de Landelles | SAINT-HILAIRE-DU-HARCOUET | Manche | 2026-05-30 |
| FMANOR076V524N0T | Pierres en Lumières 2026 à la Base V1 Nr161 de GUERVILLE | GUERVILLE | Seine-Maritime | 2026-05-30 |
| FMANOR027V50T1I8 | Aventure botanique nocturne | LES ANDELYS | Eure | 2026-05-30 |
| FMANOR076V524AMU | Pierres en Lumières 2026 au manoir d'Agnès SOREL au MESNIL-SOUS-JUMIEGES | LE MESNIL-SOUS-JUMIEGES | Seine-Maritime | 2026-05-30 |
| FMANOR076V524WYM | Pierres en Lumières 2026 en la chapelle du Bout du Vent à HEURTEAUVILLE | HEURTEAUVILLE | Seine-Maritime | 2026-05-30 |
| FMANOR050V52ZBRO | Manoir de la Crasvillerie : Vernissage :  L'Amerique Latine se présente dans le Cotentin | REVILLE | Manche | 2026-05-27 |
| FMANOR014V56JTQQ | "Divine Comédie" un concert Lora GABRIEL au Petit Moulin | ORBEC | Calvados | 2026-05-30 |
| FMANOR076V524LQ4 | Pierres en Lumières 2026 à la terrasse gourmande du musée JACQUES-EMILE BLANCHE à OFFRANVILLE | OFFRANVILLE | Seine-Maritime | 2026-05-29 |
| FMANOR014V56HIYL | Manoir de La Luzerne en lumière | BERNIERES-SUR-MER | Calvados | 2026-05-30 |
| FMANOR027V50T66T | Saint-Christophe en Lumières | SAINT-CHRISTOPHE-SUR-CONDE | Eure | 2026-05-29 |
| FMANOR076V524B48 | Pierres en Lumières 2026 à MONTVILLE | MONTVILLE | Seine-Maritime | 2026-05-29 |
| FMANOR076V524W0P | Pierres en Lumières 2026 en l'abbaye de MONTIVILLERS | MONTIVILLIERS | Seine-Maritime | 2026-05-30 |
| FMANOR050V52ZGK3 | Animation nocturne théâtralisée - "Contes et légendes au bois des Roches" | ROCHEVILLE | Manche | 2026-08-07 |
| FMANOR076V524JIE | Pierres en Lumières 2026 au Pacific Vapeur Club à SOTTEVILLE-LES-ROUEN | SOTTEVILLE-LES-ROUEN | Seine-Maritime | 2026-05-30 |
| FMANOR014V56KWD9 | Lumières au 44 rue des Bouchers | BAYEUX | Calvados | 2026-05-30 |
| FMANOR076V524J76 | Pierres en Lumières 2026 à la chapelle de Grainval à SAINT-LEONARD | SAINT-LEONARD | Seine-Maritime | 2026-05-29 |
| FMANOR014V56M4V7 | Histoire, mobilier, vitraux et décors de la cathédrale Saint-Pierre de Lisieux | LISIEUX | Calvados | 2026-05-29 |
| FMANOR050V52ZPH2 | Atelier peinture en plein air | VILLEDIEU-LES-POELES-ROUFFIGNY | Manche | 2026-07-05 |
| FMANOR076V524LPF | Pierres en Lumières 2026 à la Mairie de BOIS-HEROULT | BOIS-HEROULT | Seine-Maritime | 2026-05-29 |
| FMANOR027V50SWVF | Pierres en lumières à Saint-Ouen-de-Pontcheuil | SAINT-OUEN-DE-PONTCHEUIL | Eure | 2026-05-30 |
| FMANOR027V50TBJC | Visites guidées du Bailliage de Pont de l'Arche | PONT-DE-L'ARCHE | Eure | 2026-05-29 |
| FMANOR050V52Z3WB | Concert Duo Sazz | BARNEVILLE-CARTERET | Manche | 2026-05-29 |
| FMANOR076V524O60 | Pierres en Lumières 2026 en l'église Saint-Sulpice à RY | RY | Seine-Maritime | 2026-05-29 |
| FMANOR027V50T17X | Notre Dame en lumière - Pierres en lumières | LE VAUDREUIL | Eure | 2026-05-29 |
| FMANOR076V524PJ9 | Pierres en Lumières 2026 au Parc Zoologique de CLERES  | CLERES | Seine-Maritime | 2026-05-30 |
| FMANOR076V524WX4 | Pierres en Lumières 2026 en l'église Notre-Dame de la Consolation à GONFREVILLE L'ORCHER | GONFREVILLE-L'ORCHER | Seine-Maritime | 2026-05-30 |
| FMANOR076V524YE7 | Pierres en Lumières 2026 en l'Abbatiale de la Sainte-Trinité à FECAMP | FECAMP | Seine-Maritime | 2026-05-30 |
| FMANOR076V5250JH | Pierres en Lumières 2026 au logis à DEVILLE-LES-ROUEN | DEVILLE-LES-ROUEN | Seine-Maritime | 2026-05-29 |
| FMANOR076V5254TY | Pierres en Lumières 2026 en l'église Saint-Pierre - Saint-Paul à SAINT-PIERRE DE MANNEVILLE | SAINT-PIERRE-DE-MANNEVILLE | Seine-Maritime | 2026-05-30 |
| FMANOR076V524KHE | Pierres en Lumières 2026 au Colombier de La Mailleraye à ARELAUNE-EN-SEINE | ARELAUNE-EN-SEINE | Seine-Maritime | 2026-05-30 |
| FMANOR050V52XJUJ | Eglise Saint-Laurent  | SAINT-SAUVEUR-VILLAGES | Manche | 2026-05-31 |
| FMANOR076V5255GC | Pierres en Lumières 2026 à la Maison Vacquerie-Musée Victor Hugo à VILLEQUIER - RIVES-EN-SEINE | RIVES-EN-SEINE | Seine-Maritime | 2026-05-30 |
| FMANOR027V50SWWY | Fleury en Lumières | FLEURY-LA-FORET | Eure | 2026-05-30 |
| FMANOR076V5254SE | Pierres en Lumières 2026 à l'abbaye Saint-Georges à SAINT-MARTIN-DE-BOSCHERVILLE | SAINT-MARTIN-DE-BOSCHERVILLE | Seine-Maritime | 2026-05-30 |
| FMANOR014V56JJ6K | chansons et airs d'opéra dans l'église de Maisoncelles sur Ajon | MAISONCELLES-SUR-AJON | Calvados | 2026-05-30 |
| FMANOR076V524FC4 | Pierres en Lumières 2026 à ECRETTEVILLE-LES-BAONS | ECRETTEVILLE-LES-BAONS | Seine-Maritime | 2026-05-30 |
| FMANOR076V5253H7 | Pierres en Lumières 2026 au musée du patrimoine des écoles à AMFREVILLE-LA-MI-VOIE | AMFREVILLE-LA-MI-VOIE | Seine-Maritime | 2026-05-29 |
| FMANOR050V52XK73 | Eglise Saint-Laurent  | SAINT-SAUVEUR-VILLAGES | Manche | 2026-05-30 |
| FMANOR076V524K34 | Pierres en Lumières 2026 au Château de la Folie de FERRIERES-EN-BRAY | FERRIERES-EN-BRAY | Seine-Maritime | 2026-05-30 |
| FMANOR076V5254AC | Pierres en Lumières 2026 en l'église Saint-Pierre à VATIERVILLE | VATIERVILLE | Seine-Maritime | 2026-05-30 |
| FMANOR076V524NYC | Pierres en Lumières 2026 au Manoir du Catel à ECRETTEVILLE-LES-BAONS | ECRETTEVILLE-LES-BAONS | Seine-Maritime | 2026-05-30 |
| FMANOR076V5254SD | Pierres en Lumières 2026 en l'église Notre-Dame à BELBEUF | BELBEUF | Seine-Maritime | 2026-05-29 |
| FMANOR076V520A2N | Pierres en Lumières 2026 au Jardin des Sculptures - Château de BOIS-GUILBERT | BOIS-GUILBERT | Seine-Maritime | 2026-05-29 |

## Matched by place (review)

<details><summary>46 matches</summary>

- Le Bosc Féré en lumières au Thuit de l'Oison → `le-bosc-fere-en-lumieres` (geo+title)
- Pierres en Lumières 2026 en l'église Saint-Ouen à OFFRANVILLE → `pierres-en-lumieres-eglise-saint-ouen-et-terrasse-gourmande` (geo+title)
- Pierres en Lumières au Château de Pirou - COMPLET → `pierres-en-lumieres-au-chateau-de-pirou` (geo+title)
- Illumination Gloire à nos aïeux - Pierres en lumières → `gloire-a-nos-aieux` (geo+title)
- Sonneurs de cors de chasse dans l'église Saint-Martin à Ver-sur-Mer → `lumieres-sur-leglise-saint-martin-a-ver-sur-mer` (geo+title)
- Concert à l'église Saint-Brice → `concert-en-l-eglise-saint-brice` (geo+title)
- Histoire de la reconstruction de l'église de Cahagnes → `mise-en-lumiere-de-l-eglise-de-cahagnes` (geo+title)
- Exposition numérique dans l'église Sainte Croix (Festival Magnetik et Pierres en Lumières) → `festival-magnetik` (geo+title)
- Lumières sur l'hôtel d'Auxais → `lhotel-de-la-bonbonniere-en-lumiere` (geo+title)
- De l'abattoir au conservatoire, l'histoire d'un bâtiment singulier (Pierres en Lumières) → `de-l-abattoir-au-conservatoire-l-histoire-d-un-batiment-singulier` (geo+title)
- Pierres en lumières > Château des Matignon → `chateau-des-matignon` (geo+title)
- Pierres en Lumières : De l'ombre à la lumière : reconstruire Evreux après-guerre. → `de-l-ombre-a-la-lumiere-reconstruire-evreux-apres-guerre` (geo+title)
- Chorale dans l'église Saint-Ouen de Rots  → `lumieres-sur-l-eglise-saint-ouen-de-rots` (geo+title)
- Concert du Choeur Vega à Saint-André-De-L'Eure → `concert-avec-choeur-vega` (geo+title)
- Pierres en lumières au moulin de Hauville → `animations-autour-du-moulin-d-hauville` (geo+title)
- Illumination de l'église et du Manoir d'Hellenvilliers au Mesnil Jourdain - Pierre en lumières → `l-eglise-et-le-manoir-d-hellenvilliers-au-mesnil-jourdain-s-illuminent-pour-pierre-en-lumieres` (geo+title)
- En Roue Libre sous les Etoiles à Saint-Ouen-de-Pontcheuil → `soiree-feerique` (geo)
- D'arts et de pierres (Pierres en Lumières) → `d-arts-et-de-pierres` (geo+title)
- Pierres en lumières - Nuit vénitienne au musée du verre François Décorchemont, 29.05.2026 → `nuit-venitienne-au-musee-du-verre-29-05-2026` (geo+title)
- Sonnets et résonances sous l'étoile - Pierres en lumières → `sonnets-et-resonances-sous-l-etoile` (geo+title)
- Pierres en Lumières : Lumière sur l'église Saint-Aignan → `lumiere-sur-l-eglise-saint-aignan` (geo+title)
- Le château de Pinterville s’illumine et résonne aux sons de la musique irlandaise - Pierres en lumières → `le-chateau-de-pinterville-s-illumine-et-resonne-aux-sons-de-la-musique-irlandaise` (geo+title)
- Pierres en Lumières : Le XIXe siècle et les grands monuments publics ébroïciens. → `le-xixe-siecle-et-les-grands-monuments-publics-ebroiciens` (geo+title)
- Exposition de Reliques et vêtements liturgiques - Pierres en lumières → `reliques-et-vetements-liturgiques` (geo+title)
- Rencontres d'outre-tombe au Château de la Roche-Bagnoles → `rencontres-doutre-tombe-au-chateau-de-bagnoles-de-lorne` (geo+title)
- Déambulation entre l'église et la ferme musée de Lisores  → `lisores-en-lumieres` (geo+title)
- Gaillon : entre château et ville - Pierres en lumières → `gaillon-entre-chateau-et-ville` (geo+title)
- Concert Contrast - Pierres en lumières → `contrast` (geo+title)
- Concert à l'Eglise Notre-Dame des Arts → `concert-a-l-eglise` (geo+title)
- Concert d'opéra à la bougie dans l'église de Langrune → `lumiere-sur-langrune` (geo+title)
- Des vitraux pour l'église Saint-Malo → `des-vitraux-pour-leglise-de-saint-malo` (geo+title)
- Quand le clocher tors s'anime - Pierres en lumières → `quand-le-clocher-tors-s-anime` (geo+title)
- Pierres en Lumières au Manoir du Bois → `manoir-du-bois` (geo+title)
- Concert à l'église de Carrouges → `concert-a-l-eglise-sainte-marguerite` (geo+title)
- Pierres en Lumières : concert à l'église de Périers → `eglise-de-periers` (geo+title)
- Visite théâtralisée du château de Louvagny en lumières → `louvagny-en-lumieres` (geo+title)
- Déambulation entre les manoirs de Castillon, du Bais et l'église de Grandouet → `lumieres-sur-l-eglise-de-grandouet` (geo+title)
- Concert de trompes de chasse (Pierres en Lumières) → `concert-trompes-de-chasse` (geo+title)
- Gaillon : entre ville et château - Pierres en lumières → `gaillon-entre-ville-et-chateau` (geo+title)
- Visite contée au Château de Vouilly → `pierres-en-lumieres-au-chateau-de-vouilly` (geo+title)
- Visite de l'église Sainte-Colombe - Pierres en lumières → `visite-de-l-eglise-sainte-colombe` (geo+title)
- Pierres en Lumières à l'église Saint-Pierre et Saint-Paul de Périers → `eglise-saint-pierre-et-saint-paul-de-periers` (geo+title)
- Quand la pierre se souvient, la lumière raconte (Pierres en Lumière) → `quand-la-pierre-se-souvient-la-lumiere-raconte` (geo+title)
- Mise en lumière de l'Hôtel de ville → `mise-en-lumieres-de-l-hotel-de-ville` (geo+title)
- Patrimoine en lumière à Forges : le château des Tourelles → `patrimoine-en-lumieres-a-forges-le-chateau-des-tourelles` (geo+title)
- A la découverte de l'église d'Harcourt (Pierres en Lumières) → `a-la-decouverte-de-l-eglise-d-harcourt` (geo+title)

</details>

## New-site events with no v1 2026 counterpart

- `le-thil-en-vexin-fete-le-printemps-marche-artisanal` — LE THIL (2026-04-11)
- `nuit-des-musees-visite-virtuelle-rome-au-crepuscule` — VIEUX (2026-05-22)
- `nuit-des-musees-visite-au-flambeau-de-la-maison-au-grand-peristyle` — VIEUX (2026-05-22)
- `visite-libre-nocturne-et-insolite-de-la-maison-du-patrimoine-sourdin` — Villedieu-les-Poêles-Rouffigny (2026-05-22)
- `manoir-de-mardilly-en-lumieres` — MARDILLY (2026-05-27)
- `concert-en-leglise-de-saint-brice-sous-ranes` — SAINT-BRICE-SOUS-RANES (2026-05-28)
- `concert-dpm` —  (2026-05-28)
- `eglise-de-la-besliere` —  (2026-05-28)
- `visite-guidee-de-leglise-saint-crepin-saint-crepinien` —  (2026-05-28)
- `eglise-de-demouville-1-000-ans-dhistoire` — DEMOUVILLE (2026-05-28)
- `hotel-de-blangy` —  (2026-05-28)
- `concert-du-duo-top-of-the-pops` —  (2026-05-28)
- `illumination-de-leglise-damfreville` — AMFREVILLE (2026-05-28)
- `eglise-et-mairie-de-helleville` —  (2026-05-28)
- `moulin-de-la-ville-2` —  (2026-05-28)
- `parc-musee-du-granit-1` —  (2026-05-28)
- `les-vitraux-de-saint-aubin` — DOUDEAUVILLE-EN-VEXIN (2026-05-28)
- `remontez-le-temps-a-la-decouverte-de-lhistoire-du-domaine-du-chateau-de-canon` — MÉZIDON VALLÉE D'AUGE (2026-05-28)
- `concert-a-leglise-de-villebadin` — GOUFFERN EN AUGE (2026-05-28)
- `exposition-de-peintres-locaux` —  (2026-05-28)
- `site-de-la-chapelle-sur-vire` —  (2026-05-28)
- `lumieres-dans-l-eglie-de-norrey` — SAINT-MANVIEU-NORREY (2026-05-28)
- `a-la-rencontre-des-resistants-d-echauffour` — ECHAUFFOUR (2026-05-28)
- `nuit-des-couleurs-a-leglise-saint-pierre` — LA ROCHE-MABILE (2026-05-28)
- `concert-sonates-du-rosaire-par-l-escadron-volant-de-la-reine-au-manoir-de-courboyer` — PERCHE EN NOCE (2026-05-28)
- `lumieres-et-transparences-a-l-eglise-saint-aubin-exposition-de-creations-de-papier` — BOECE (2026-05-28)
- `prestarts` — MERLERAULT-LE-PIN (2026-05-28)
- `chapelle-sainte-marie-aux-anglais-chant-joie-lumiere-` — SURESNES (2026-05-28)
- `balade-aux-flambeaux-a-saint-ceneri-le-gerei` — ALENCON (2026-05-28)
- `eglise-saint-honorine` —  (2026-05-28)
- `ferme-musee-du-cotentin-soiree-autour-de-lexposition-systeme-d-day` —  (2026-05-28)
- `sophrobalade-a-la-tombee-de-la-nuit` —  (2026-05-28)
- `pierres-en-lumieres-a-la-batterie-dazeville` — AZEVILLE (2026-05-28)
- `concert-de-fado-a-notre-dame-sur-leau` — DOMFRONT EN POIRAIE (2026-05-28)
- `visite-guidee-belles-heures-du-petit-versailles-normand` —  (2026-05-29)
- `exposition-art-sacre-sees` — Sées (2026-05-29)
- `exposition-impressionnisme-patrimoine-etretat` — Étretat (2026-05-29)
- `exposition-patrimoine-maritime-cherbourg` — Cherbourg-en-Cotentin (2026-05-29)
- `illumination-abbaye-aux-hommes` — Caen (2026-05-29)
- `illumination-haras-du-pin` — Le Pin-au-Haras (2026-05-29)
- `visite-nocturne-chateau-falaise` — Falaise (2026-05-29)
- `visite-nocturne-cathedrale-rouen` — Rouen (2026-05-29)
- `illumination-abbatiale-fecamp` — Fécamp (2026-05-29)
- `son-lumiere-chateau-gaillard` — Les Andelys (2026-05-29)
- `illumination-mont-saint-michel` — Le Mont-Saint-Michel (2026-05-29)
- `leglise-notre-dame-mise-en-lumieres` — LA FERTE MACE (2026-05-29)
- `des-vitraux-pour-l-eglise-saint-malo-de-la-fresnaye-au-sauvage` — PUTANGES-LE-LAC (2026-05-29)
- `maison-jacques-prevert-1` —  (2026-05-29)
- `mise-en-lumiere-de-leglise-saint-laumer` — LE PAS-SAINT-L'HOMER (2026-05-29)
- `exposition-photo-lumiere-sur-lart-en-mains-et-illuminations-de-leglise-saint-pierre-de-courcerault-e` — PERCHE EN NOCE (2026-05-29)
- `belleme-en-lumieres` — BELLEME (2026-05-29)
- `lumiere-sur-l-hotel-gauquelin-des-pallieres` — BAYEUX (2026-05-29)
- `pierres-en-lumieres-chateauneuf-sur-epte-mis-en-lumiere` — CHATEAU-SUR-EPTE (2026-05-29)
- `le-manoir-de-la-chapelle-en-lumieres` — CONDE-SUR-SARTHE (2026-05-29)
- `thermes-gallo-romains-dalauna` —  (2026-05-29)
- `manoir-du-but-1` —  (2026-05-29)
- `mysteres-et-lumieres-a-leglise-de-louce` — ARGENTAN (2026-05-29)
- `a-la-decouverte-des-tresors-de-notre-eglise-saint-denis-de-maheru` — MAHERU (2026-05-29)
- `patrimoines-du-bourg-en-lumiere` — TOURNEVILLE-SUR-MER (2026-05-29)
- `eglise-saint-malo-et-fontaine-saint-clair-1` —  (2026-05-29)
- `escape-game-et-illuminations-a-la-grosse-forge-daube-1` — AUBE (2026-05-29)
- `illumination-et-concert-au-chateau-de-lion-sur-mer-1` — LION-SUR-MER (2026-05-29)
- `concert-a-leglise-saint-martin-de-longny-au-perche` — LONGNY LES VILLAGES (2026-05-29)
- `le-chateau-de-ranes-en-lumieres` — RANES (2026-05-29)
- `concert-et-illuminations-a-l-eglise-de-la-croupte` — LIVAROT-PAYS-D'AUGE (2026-05-29)
- `ancien-preche-1` —  (2026-05-29)
- `illumination-de-leglise-saint-lhomer-de-courgeout` — COURGEOUT (2026-05-29)
- `concert-et-luminions-dans-l-eglise-d-ande` — ANDE (2026-05-29)
- `animation-jeune-public-les-animaux-de-la-nuit-prennent-la-lumiere-` —  (2026-05-29)
- `croix-de-chemin` —  (2026-05-29)
- `concert-eglise-d-annebecq` — LANDELLES-ET-COUPIGNY (2026-05-29)
- `la-verriere` —  (2026-05-29)
- `eglise-st-pierre` —  (2026-05-29)
- `visite-nocturne-a-la-bougie-de-leglise-de-grangues` — GRANGUES (2026-05-29)
- `l-orchestre-molto-piu-au-petit-lourdes-pour-pierres-en-lumieres` — HEROUVILLE-SAINT-CLAIR (2026-05-29)
- `au-fil-de-la-dentelle-lame-normande` — GUERQUESALLES (2026-05-29)
- `pierres-en-lumieres-illumination-de-l-eglise-saint-jean-baptiste` — DANGU (2026-05-29)
- `bayeux-sous-loccupation-19401944` — CREULLY SUR SEULLES (2026-05-29)
- `lumieres-sur-l-eglise-saint-martin-a-ver-sur-mer` — VER-SUR-MER (2026-05-29)
- `pierres-en-lumieres-a-ryes` — ISIGNY-SUR-MER (2026-05-29)
- `pierres-en-lumieres-jeanne-d-arc-en-lumieres` — LE THIL (2026-05-29)
- `visite-de-leglise-saint-hilaire-de-courtoulin` — BAZOCHES-SUR-HOENE (2026-05-29)
- `eglise-de-cosqueville-1` —  (2026-05-29)
- `concert-au-piano` — LE PLESSIS-SAINTE-OPPORTUNE (2026-05-29)
- `pierres-en-lumieres-les-enfants-de-rollon-sur-les-traces-des-vikings` — BEZU-SAINT-ELOI (2026-05-29)
- `concert-et-illumination-de-leglise-saint-pierre` — LA CHAPELLE-MONTLIGEON (2026-05-29)
- `place-en-lumiere` — REMALARD EN PERCHE (2026-05-29)
- `cinema-en-plein-air-projection-du-documentaire-semer-et-recolter-d-eric-le-roch` — SAINT-CYR-LA-ROSIERE (2026-05-29)
- `lumieres-sur-l-abbaye-saint-andre-en-gouffern` — LA HOGUETTE (2026-05-29)
- `conference-sur-debussy-et-limpressionnisme-musical` — LIVAROT-PAYS-D'AUGE (2026-05-29)
- `eglise-bocage-en-musiques-` — SAINT-OUEN-LE-BRISOULT (2026-05-29)
- `des-vitraux-pour-leglise-de-saint-malo-de-la-fresnaye-au-sauvage` — PUTANGES-LE-LAC (2026-05-29)
- `lumieres-sur-leglise-saint-ouen-de-rots` — ROTS (2026-05-29)
- `leglise-saint-roch-de-courteille-sillumine` — ALENCON (2026-05-29)
- `concert-a-leglise-saint-pierre-illuminee` — LION-SUR-MER (2026-05-29)
- `les-enfants-de-rollon-sur-les-traces-des-vikings` — BEZU-SAINT-ELOI (2026-05-29)
- `metier-dart-tailleur-de-pierres-a-maizieres` — MAIZIERES (2026-05-29)
- `leglise-medievale-saint-sebastien-de-meguillaume-en-lumieres` — PUTANGES-LE-LAC (2026-05-29)
- `decouverte-de-l-eglise-sainte-madeleine` — BAGNOLES DE L'ORNE NORMANDIE (2026-05-29)
- `eglise-dauvers` —  (2026-05-29)
- `lumieres-sur-l-eglise-de-benerville-sur-mer` — BENERVILLE-SUR-MER (2026-05-29)
- `visite-guidee-en-musique-de-leglise-et-du-lavoir-dirai` — IRAI (2026-05-29)
- `visite-maison-oze-alencon` — Alençon (2026-05-30)
- `animations-chateau-dieppe` — Dieppe (2026-05-30)
- `animations-chateau-pirou` — Pirou (2026-05-30)
- `animations-medievales-bec-hellouin` — Le Bec-Hellouin (2026-05-30)
- `exposition-lumieres-bessin` — Bayeux (2026-05-30)
- `concert-a-la-bougie-droles-doiseaux-` — LONLAY-L'ABBAYE (2026-05-30)
- `eglise-de-periers-autre` —  (2026-05-30)
- `concert-de-luniversity-choir-of-bethel-et-le-boston-eastern-heritage-chorus` —  (2026-05-30)
- `recital-anima-mia-a-leglise-de-sainte-ceronne` — Sainte-Céronne-lès-Mortagne (2026-05-30)
- `visite-guidee-moulin-ande` — Andé (2026-05-31)
