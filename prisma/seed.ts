import { PrismaClient, Department, Category } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const clearDatabase = async () => {
  await prisma.$executeRawUnsafe(`
    DO $$
    DECLARE r RECORD;
    BEGIN
      FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename != '_prisma_migrations')
      LOOP
        EXECUTE 'TRUNCATE TABLE "' || r.tablename || '" CASCADE';
      END LOOP;
    END $$;
  `);
  console.log("Database cleared.");
};

const seedEvents = async () => {
  const events = [
    // CALVADOS (3 events)
    {
      title: "Illumination de l'Abbaye aux Hommes",
      slug: "illumination-abbaye-aux-hommes",
      description: "Découvrez l'Abbaye aux Hommes de Caen sous un éclairage spectaculaire mettant en valeur son architecture romane et gothique. Un parcours lumineux vous guidera à travers les jardins et les cloîtres.",
      location: "Abbaye aux Hommes",
      city: "Caen",
      postalCode: "14000",
      department: Department.CALVADOS,
      category: Category.ILLUMINATIONS,
      dateStart: new Date("2026-05-29T20:00:00"),
      dateEnd: new Date("2026-05-31T23:59:00"),
      timeStart: "20:00",
      timeEnd: "00:00",
      pricing: "Gratuit",
      organizer: "Ville de Caen",
      email: "patrimoine@caen.fr",
      latitude: 49.1811,
      longitude: -0.3726,
      coverImage: "/images/seed/abbaye-hommes.jpg",
      featured: true,
      accessible: true,
    },
    {
      title: "Visite nocturne du Château de Falaise",
      slug: "visite-nocturne-chateau-falaise",
      description: "Visitez le château natal de Guillaume le Conquérant à la lueur des torches. Des guides costumés vous raconteront l'histoire fascinante de cette forteresse médiévale.",
      location: "Château Guillaume-le-Conquérant",
      city: "Falaise",
      postalCode: "14700",
      department: Department.CALVADOS,
      category: Category.VISITES,
      dateStart: new Date("2026-05-29T21:00:00"),
      timeStart: "21:00",
      timeEnd: "23:30",
      pricing: "5€ adulte, gratuit -12 ans",
      organizer: "Office de Tourisme de Falaise",
      email: "contact@falaise-tourisme.fr",
      latitude: 48.8955,
      longitude: -0.1967,
      coverImage: "/images/seed/chateau-falaise.jpg",
      featured: true,
      accessible: false,
    },
    {
      title: "Exposition 'Lumières sur le Bessin'",
      slug: "exposition-lumieres-bessin",
      description: "Exposition photographique en plein air sur le patrimoine du Bessin, installée sur les remparts de la cathédrale de Bayeux.",
      location: "Cathédrale Notre-Dame de Bayeux",
      city: "Bayeux",
      postalCode: "14400",
      department: Department.CALVADOS,
      category: Category.EXPOSITIONS,
      dateStart: new Date("2026-05-30T18:00:00"),
      dateEnd: new Date("2026-05-31T22:00:00"),
      timeStart: "18:00",
      timeEnd: "22:00",
      pricing: "Gratuit",
      organizer: "Association Patrimoine du Bessin",
      email: "patrimoine-bessin@example.fr",
      latitude: 49.2764,
      longitude: -0.7024,
      accessible: true,
    },

    // EURE (3 events)
    {
      title: "Son et Lumière au Château Gaillard",
      slug: "son-lumiere-chateau-gaillard",
      description: "Spectacle son et lumière projeté sur les ruines du Château Gaillard, forteresse construite par Richard Cœur de Lion. Une plongée dans l'histoire médiévale normande.",
      location: "Château Gaillard",
      city: "Les Andelys",
      postalCode: "27700",
      department: Department.EURE,
      category: Category.ILLUMINATIONS,
      dateStart: new Date("2026-05-29T21:30:00"),
      dateEnd: new Date("2026-05-31T23:00:00"),
      timeStart: "21:30",
      timeEnd: "23:00",
      pricing: "Gratuit",
      organizer: "Communauté de communes des Andelys",
      email: "culture@andelys.fr",
      latitude: 49.2358,
      longitude: 1.3994,
      coverImage: "/images/seed/chateau-gaillard.jpg",
      featured: true,
      accessible: false,
    },
    {
      title: "Animations médiévales à l'Abbaye du Bec-Hellouin",
      slug: "animations-medievales-bec-hellouin",
      description: "Reconstitutions historiques, ateliers d'enluminure et de calligraphie dans le cadre exceptionnel de l'abbaye bénédictine du Bec-Hellouin.",
      location: "Abbaye du Bec-Hellouin",
      city: "Le Bec-Hellouin",
      postalCode: "27800",
      department: Department.EURE,
      category: Category.ANIMATIONS,
      dateStart: new Date("2026-05-30T14:00:00"),
      timeStart: "14:00",
      timeEnd: "22:00",
      pricing: "3€ adulte",
      organizer: "Les Amis du Bec-Hellouin",
      email: "amis-bec@example.fr",
      latitude: 49.2311,
      longitude: 0.7236,
      accessible: true,
    },
    {
      title: "Visite guidée du Moulin d'Andé",
      slug: "visite-guidee-moulin-ande",
      description: "Découverte du moulin historique d'Andé, lieu de création artistique et cinématographique depuis les années 60.",
      location: "Moulin d'Andé",
      city: "Andé",
      postalCode: "27430",
      department: Department.EURE,
      category: Category.VISITES,
      dateStart: new Date("2026-05-31T10:00:00"),
      timeStart: "10:00",
      timeEnd: "18:00",
      pricing: "Gratuit",
      organizer: "Fondation du Moulin d'Andé",
      email: "contact@moulinande.fr",
      latitude: 49.2547,
      longitude: 1.2217,
      accessible: true,
    },

    // MANCHE (3 events)
    {
      title: "Illumination du Mont-Saint-Michel",
      slug: "illumination-mont-saint-michel",
      description: "Le Mont-Saint-Michel s'illumine pour Pierres en Lumières. Un spectacle féerique sur la merveille de l'Occident avec mapping vidéo sur la façade de l'abbatiale.",
      location: "Abbaye du Mont-Saint-Michel",
      city: "Le Mont-Saint-Michel",
      postalCode: "50170",
      department: Department.MANCHE,
      category: Category.ILLUMINATIONS,
      dateStart: new Date("2026-05-29T22:00:00"),
      dateEnd: new Date("2026-05-31T23:30:00"),
      timeStart: "22:00",
      timeEnd: "23:30",
      pricing: "Gratuit (accès abbaye payant)",
      organizer: "Centre des monuments nationaux",
      email: "mont-saint-michel@monuments-nationaux.fr",
      latitude: 48.6361,
      longitude: -1.5115,
      coverImage: "/images/seed/mont-saint-michel.jpg",
      featured: true,
      accessible: false,
    },
    {
      title: "Exposition 'Patrimoine Maritime' à Cherbourg",
      slug: "exposition-patrimoine-maritime-cherbourg",
      description: "Exposition immersive sur le patrimoine maritime du Cotentin à la Cité de la Mer. Maquettes, objets historiques et témoignages de marins.",
      location: "Cité de la Mer",
      city: "Cherbourg-en-Cotentin",
      postalCode: "50100",
      department: Department.MANCHE,
      category: Category.EXPOSITIONS,
      dateStart: new Date("2026-05-29T10:00:00"),
      dateEnd: new Date("2026-05-31T19:00:00"),
      timeStart: "10:00",
      timeEnd: "19:00",
      pricing: "Tarif réduit : 10€",
      organizer: "Cité de la Mer",
      email: "info@citedelamer.com",
      latitude: 49.6404,
      longitude: -1.6161,
      accessible: true,
    },
    {
      title: "Animations au Château de Pirou",
      slug: "animations-chateau-pirou",
      description: "Animations familiales au château fort de Pirou : tir à l'arc, forge, contes et légendes normandes autour du feu.",
      location: "Château de Pirou",
      city: "Pirou",
      postalCode: "50770",
      department: Department.MANCHE,
      category: Category.ANIMATIONS,
      dateStart: new Date("2026-05-30T14:00:00"),
      timeStart: "14:00",
      timeEnd: "21:00",
      pricing: "4€ adulte, 2€ enfant",
      organizer: "Association du Château de Pirou",
      email: "chateau.pirou@example.fr",
      latitude: 49.1636,
      longitude: -1.5631,
      accessible: false,
    },

    // ORNE (3 events)
    {
      title: "Illumination du Haras du Pin",
      slug: "illumination-haras-du-pin",
      description: "Le 'Versailles du cheval' s'illumine. Parcours lumineux dans les écuries royales et spectacle équestre nocturne dans la cour d'honneur.",
      location: "Haras national du Pin",
      city: "Le Pin-au-Haras",
      postalCode: "61310",
      department: Department.ORNE,
      category: Category.ILLUMINATIONS,
      dateStart: new Date("2026-05-29T20:30:00"),
      dateEnd: new Date("2026-05-30T23:00:00"),
      timeStart: "20:30",
      timeEnd: "23:00",
      pricing: "8€ adulte, 4€ enfant",
      organizer: "IFCE - Haras du Pin",
      email: "haras-pin@ifce.fr",
      latitude: 48.7372,
      longitude: 0.1114,
      coverImage: "/images/seed/haras-du-pin.jpg",
      featured: true,
      accessible: true,
    },
    {
      title: "Visite de la Maison d'Oze à Alençon",
      slug: "visite-maison-oze-alencon",
      description: "Visite commentée de la Maison d'Ozé, joyau de l'architecture Renaissance alençonnaise, avec démonstration de dentelle au point d'Alençon.",
      location: "Maison d'Ozé",
      city: "Alençon",
      postalCode: "61000",
      department: Department.ORNE,
      category: Category.VISITES,
      dateStart: new Date("2026-05-30T10:00:00"),
      timeStart: "10:00",
      timeEnd: "17:00",
      pricing: "Gratuit",
      organizer: "Office de Tourisme d'Alençon",
      email: "tourisme@alencon.fr",
      latitude: 48.4319,
      longitude: 0.0917,
      accessible: true,
    },
    {
      title: "Exposition d'art sacré à Sées",
      slug: "exposition-art-sacre-sees",
      description: "Exposition d'art sacré dans la cathédrale de Sées mettant en lumière les trésors de l'art religieux ornais du Moyen Âge au XIXe siècle.",
      location: "Cathédrale Notre-Dame de Sées",
      city: "Sées",
      postalCode: "61500",
      department: Department.ORNE,
      category: Category.EXPOSITIONS,
      dateStart: new Date("2026-05-29T09:00:00"),
      dateEnd: new Date("2026-05-31T18:00:00"),
      timeStart: "09:00",
      timeEnd: "18:00",
      pricing: "Gratuit",
      organizer: "Diocèse de Sées",
      email: "cathedrale.sees@example.fr",
      latitude: 48.6039,
      longitude: 0.1717,
      accessible: true,
    },

    // SEINE-MARITIME (4 events)
    {
      title: "Illumination de l'Abbatiale de Fécamp",
      slug: "illumination-abbatiale-fecamp",
      description: "L'abbatiale de la Trinité de Fécamp, l'une des plus grandes églises de France, se pare de lumières. Mapping vidéo sur la façade et concert de carillons.",
      location: "Abbatiale de la Trinité",
      city: "Fécamp",
      postalCode: "76400",
      department: Department.SEINE_MARITIME,
      category: Category.ILLUMINATIONS,
      dateStart: new Date("2026-05-29T21:00:00"),
      dateEnd: new Date("2026-05-31T23:00:00"),
      timeStart: "21:00",
      timeEnd: "23:00",
      pricing: "Gratuit",
      organizer: "Ville de Fécamp",
      email: "culture@ville-fecamp.fr",
      latitude: 49.7583,
      longitude: 0.3767,
      coverImage: "/images/seed/abbatiale-fecamp.jpg",
      featured: true,
      accessible: true,
    },
    {
      title: "Visite nocturne de la Cathédrale de Rouen",
      slug: "visite-nocturne-cathedrale-rouen",
      description: "Visite exceptionnelle de la cathédrale Notre-Dame de Rouen de nuit, avec accès aux parties habituellement fermées au public et projection lumineuse intérieure.",
      location: "Cathédrale Notre-Dame de Rouen",
      city: "Rouen",
      postalCode: "76000",
      department: Department.SEINE_MARITIME,
      category: Category.VISITES,
      dateStart: new Date("2026-05-29T21:00:00"),
      dateEnd: new Date("2026-05-31T23:30:00"),
      timeStart: "21:00",
      timeEnd: "23:30",
      pricing: "Gratuit",
      organizer: "Archevêché de Rouen",
      email: "cathedrale@rouen.fr",
      latitude: 49.4401,
      longitude: 1.0936,
      featured: true,
      accessible: true,
    },
    {
      title: "Animations au Château de Dieppe",
      slug: "animations-chateau-dieppe",
      description: "Le château-musée de Dieppe propose des animations pour toute la famille : ateliers de sculpture sur ivoire, contes de pirates et dégustations de produits locaux.",
      location: "Château-Musée de Dieppe",
      city: "Dieppe",
      postalCode: "76200",
      department: Department.SEINE_MARITIME,
      category: Category.ANIMATIONS,
      dateStart: new Date("2026-05-30T10:00:00"),
      timeStart: "10:00",
      timeEnd: "22:00",
      pricing: "Gratuit",
      organizer: "Ville de Dieppe",
      email: "musees@mairie-dieppe.fr",
      latitude: 49.9256,
      longitude: 1.0694,
      accessible: false,
    },
    {
      title: "Exposition 'Impressionnisme et Patrimoine' à Étretat",
      slug: "exposition-impressionnisme-patrimoine-etretat",
      description: "Exposition en plein air reproduisant les tableaux impressionnistes sur les lieux mêmes où ils furent peints. Un dialogue entre art et paysage.",
      location: "Jardins d'Étretat",
      city: "Étretat",
      postalCode: "76790",
      department: Department.SEINE_MARITIME,
      category: Category.EXPOSITIONS,
      dateStart: new Date("2026-05-29T10:00:00"),
      dateEnd: new Date("2026-05-31T19:00:00"),
      timeStart: "10:00",
      timeEnd: "19:00",
      pricing: "Inclus dans l'entrée des jardins",
      organizer: "Les Jardins d'Étretat",
      email: "contact@etretatgarden.fr",
      latitude: 49.7072,
      longitude: 0.2042,
      accessible: true,
    },
  ];

  for (const event of events) {
    await prisma.event.create({ data: event });
  }
  console.log(`${events.length} events seeded.`);
};

const seedNews = async () => {
  const articles = [
    {
      title: "Pierres en Lumières 2026 : le programme dévoilé",
      slug: "programme-2026-devoile",
      excerpt: "Découvrez le programme complet de l'édition 2026 du festival Pierres en Lumières qui se tiendra les 29, 30 et 31 mai.",
      content: `# Pierres en Lumières 2026 : un programme exceptionnel

L'édition 2026 du festival **Pierres en Lumières** promet d'être la plus ambitieuse jamais organisée en Normandie.

## Plus de 500 sites ouverts

Cette année, plus de 500 sites patrimoniaux ouvriront leurs portes à travers les cinq départements normands. Des abbayes millénaires aux châteaux Renaissance, en passant par les manoirs à colombages, le patrimoine normand se dévoile sous un nouveau jour.

## Trois soirées de festivités

Le festival se déroulera sur trois soirées exceptionnelles :
- **Vendredi 29 mai** : soirée d'ouverture avec illuminations simultanées
- **Samedi 30 mai** : journée complète d'animations et visites
- **Dimanche 31 mai** : clôture en beauté

## Nouveautés 2026

Parmi les nouveautés, un parcours immersif en réalité augmentée sera proposé dans plusieurs sites majeurs, permettant de visualiser les monuments tels qu'ils étaient à l'époque de leur construction.`,
      coverImage: "/images/seed/news-programme.jpg",
      publishedAt: new Date("2026-02-15T10:00:00"),
    },
    {
      title: "Les bénévoles au cœur du festival",
      slug: "benevoles-coeur-festival",
      excerpt: "Rencontre avec les bénévoles qui font vivre Pierres en Lumières chaque année.",
      content: `# Les bénévoles, piliers de Pierres en Lumières

Chaque année, plus de **2 000 bénévoles** se mobilisent pour faire vivre le festival Pierres en Lumières. Portrait de ces passionnés du patrimoine.

## Marie, guide à l'Abbaye de Jumièges

"Je participe depuis la première édition. Voir les yeux des visiteurs s'illuminer quand ils découvrent l'abbaye de nuit, c'est magique."

## Pierre, technicien lumière à Rouen

"Éclairer la cathédrale, c'est un défi technique incroyable. Chaque pierre a sa propre couleur, sa propre texture. Il faut respecter le monument tout en le magnifiant."

## Rejoignez l'aventure

Les inscriptions pour les bénévoles de l'édition 2026 sont ouvertes. [Inscrivez-vous ici](/inscription).`,
      coverImage: "/images/seed/news-benevoles.jpg",
      publishedAt: new Date("2026-03-01T14:00:00"),
    },
    {
      title: "Accessibilité : un festival pour tous",
      slug: "accessibilite-festival-pour-tous",
      excerpt: "Le festival renforce son engagement en faveur de l'accessibilité avec de nouvelles initiatives pour l'édition 2026.",
      content: `# Un festival accessible à tous

Pierres en Lumières 2026 renforce son engagement pour l'**accessibilité universelle**.

## Parcours PMR

De nombreux sites proposent désormais des parcours adaptés aux personnes à mobilité réduite. Repérez-les grâce au pictogramme dédié sur notre carte interactive.

## Audiodescription

Pour la première fois, des parcours en audiodescription seront disponibles dans 50 sites, permettant aux personnes malvoyantes de profiter pleinement de l'expérience.

## Langue des signes

Des visites en langue des signes française (LSF) seront proposées dans les sites majeurs de chaque département.

Consultez la liste complète des sites accessibles sur notre [page événements](/evenements?accessible=true).`,
      coverImage: "/images/seed/news-accessibilite.jpg",
      publishedAt: new Date("2026-03-10T09:00:00"),
    },
  ];

  for (const article of articles) {
    await prisma.news.create({ data: article });
  }
  console.log(`${articles.length} news articles seeded.`);
};

const seedPartners = async () => {
  const partners = [
    { name: "Région Normandie", logo: "/images/seed/logo-region-normandie.png", website: "https://www.normandie.fr", order: 1 },
    { name: "Fondation du Patrimoine", logo: "/images/seed/logo-fondation-patrimoine.png", website: "https://www.fondation-patrimoine.org", order: 2 },
    { name: "Département du Calvados", logo: "/images/seed/logo-calvados.png", website: "https://www.calvados.fr", order: 3 },
    { name: "Département de l'Eure", logo: "/images/seed/logo-eure.png", website: "https://www.eure.fr", order: 4 },
    { name: "Département de la Manche", logo: "/images/seed/logo-manche.png", website: "https://www.manche.fr", order: 5 },
    { name: "Département de l'Orne", logo: "/images/seed/logo-orne.png", website: "https://www.orne.fr", order: 6 },
  ];

  for (const partner of partners) {
    await prisma.partner.create({ data: partner });
  }
  console.log(`${partners.length} partners seeded.`);
};

const seedPages = async () => {
  const pages = [
    {
      title: "Le Festival Pierres en Lumières",
      slug: "festival",
      content: `# Le Festival Pierres en Lumières

Pierres en Lumières est un événement festif et culturel, gratuit et ouvert à tous, qui met en valeur le patrimoine normand à travers des illuminations, animations, visites et expositions.

Chaque année, les 29, 30 et 31 mai, plus de 500 sites patrimoniaux ouvrent leurs portes gratuitement pour faire découvrir la richesse du patrimoine normand. Des châteaux illuminés aux abbayes en fête, des manoirs aux sites industriels, c'est toute la Normandie qui se met en lumière.

L'événement est organisé par la Région Normandie en partenariat avec les cinq départements normands et la Fondation du Patrimoine.

## Le Calvados

Le département du Calvados participe activement à Pierres en Lumières avec plus de 100 sites ouverts chaque année. Des plages du Débarquement à la campagne du Pays d'Auge, le patrimoine calvadosien se révèle sous un nouveau jour.

Les visiteurs peuvent découvrir des sites emblématiques comme l'Abbaye aux Hommes de Caen, le château de Falaise ou encore les manoirs du Pays d'Auge, tous illuminés et animés pour l'occasion.

[Inscrivez-vous ici](https://inscription.calvados.pierresenlumieres.fr)

**Contact :** patrimoine@calvados.fr

![Abbaye aux Hommes de Caen illuminée lors de Pierres en Lumières](/images/seed/calvados-abbaye.jpg)

## L'Eure

L'Eure, terre d'impressionnisme et de patrimoine médiéval, propose un parcours riche entre châteaux, abbayes et jardins remarquables.

Le département met en lumière ses trésors architecturaux : le Château Gaillard aux Andelys, l'abbaye du Bec-Hellouin, la collégiale de Vernon et bien d'autres sites d'exception.

[Inscrivez-vous ici](https://inscription.eure.pierresenlumieres.fr)

**Contact :** patrimoine@eure.fr

![Château Gaillard illuminé aux Andelys](/images/seed/eure-chateau-gaillard.jpg)

## La Manche

Du Mont-Saint-Michel aux ports du Cotentin, la Manche offre un patrimoine maritime et religieux exceptionnel.

Le département propose des parcours nocturnes à travers ses sites les plus remarquables : l'abbaye de Hambye, les forts Vauban, le phare de Gatteville et les charmants villages du Val de Saire.

[Inscrivez-vous ici](https://inscription.manche.pierresenlumieres.fr)

**Contact :** patrimoine@manche.fr

![Le Mont-Saint-Michel illuminé de nuit](/images/seed/manche-mont-saint-michel.jpg)

## L'Orne

Le département de l'Orne, avec ses haras, ses forêts et ses manoirs, propose une immersion dans la Normandie authentique.

Le Haras du Pin, surnommé le "Versailles du cheval", les forges de Varenne et les nombreux manoirs du Perche sont autant de sites qui participent chaque année à cette grande fête du patrimoine.

[Inscrivez-vous ici](https://inscription.orne.pierresenlumieres.fr)

**Contact :** patrimoine@orne.fr

![Le Haras du Pin illuminé lors de Pierres en Lumières](/images/seed/orne-haras-du-pin.jpg)

## La Seine-Maritime

De Rouen au pays de Caux, la Seine-Maritime dévoile un patrimoine industriel, religieux et maritime d'une richesse incomparable.

La cathédrale de Rouen, l'abbaye de Jumièges, le palais Bénédictine de Fécamp et les falaises d'Étretat font partie des sites incontournables de cette édition.

[Inscrivez-vous ici](https://inscription.seine-maritime.pierresenlumieres.fr)

**Contact :** patrimoine@seine-maritime.fr

![Cathédrale de Rouen illuminée la nuit](/images/seed/seine-maritime-cathedrale-rouen.jpg)

## La Fondation du Patrimoine

La [Fondation du Patrimoine](https://www.fondation-patrimoine.org) est partenaire historique de Pierres en Lumières. Elle contribue à la sauvegarde et à la valorisation du patrimoine de proximité partout en France.

Grâce à son réseau de bénévoles et de mécènes, la Fondation soutient chaque année des centaines de projets de restauration en Normandie. Elle accompagne les propriétaires de monuments historiques et de patrimoine vernaculaire dans leurs démarches de préservation.

![Restauration d'une chapelle normande par la Fondation du Patrimoine](/images/seed/fondation-patrimoine-1.jpg)

![Bénévoles de la Fondation du Patrimoine en action](/images/seed/fondation-patrimoine-2.jpg)

![Site restauré grâce à la Fondation du Patrimoine](/images/seed/fondation-patrimoine-3.jpg)`,
    },
    {
      title: "Inscrivez votre événement",
      slug: "inscription",
      content: `# Inscrivez votre événement

Vous êtes propriétaire ou gestionnaire d'un site patrimonial en Normandie ? Participez à Pierres en Lumières 2026 !

## Découvrez le festival en vidéo

[Pierres en Lumières 2025 - Retour en images](https://www.youtube.com/watch?v=dQw4w9WgXcQ)

## Comment s'inscrire ?

L'inscription est gratuite et ouverte à tous les sites patrimoniaux normands : châteaux, églises, manoirs, sites industriels, jardins...

Chaque département dispose de son propre formulaire d'inscription. Cliquez sur le lien de votre département ci-dessous pour accéder au formulaire.

## Formulaires d'inscription par département

- [Calvados — Formulaire d'inscription](https://inscription.calvados.pierresenlumieres.fr)
- [Eure — Formulaire d'inscription](https://inscription.eure.pierresenlumieres.fr)
- [Manche — Formulaire d'inscription](https://inscription.manche.pierresenlumieres.fr)
- [Orne — Formulaire d'inscription](https://inscription.orne.pierresenlumieres.fr)
- [Seine-Maritime — Formulaire d'inscription](https://inscription.seine-maritime.pierresenlumieres.fr)

## Critères de participation

- Être un site patrimonial situé en Normandie
- Proposer au moins une animation, visite ou illumination pendant le festival
- S'engager à respecter la charte du festival
- Assurer la sécurité des visiteurs

## Dates limites

Les inscriptions pour l'édition 2026 sont ouvertes jusqu'au **15 avril 2026**.`,
    },
    {
      title: "Mentions légales",
      slug: "mentions-legales",
      content: `# Mentions légales

## Éditeur du site

Le site pierresenlumieres.fr est édité par la Région Normandie, en partenariat avec les cinq départements normands et la Fondation du Patrimoine.

**Région Normandie**
Abbaye aux Dames
Place Reine Mathilde
CS 50523
14035 Caen Cedex

## Hébergement

Ce site est hébergé par Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA.

## Propriété intellectuelle

L'ensemble des contenus (textes, images, vidéos) présents sur ce site sont protégés par le droit d'auteur. Toute reproduction sans autorisation préalable est interdite.

## Données personnelles

Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données personnelles. Pour exercer ce droit, contactez-nous à : rgpd@normandie.fr

## Cookies

Ce site utilise des cookies techniques nécessaires à son fonctionnement. Aucun cookie publicitaire n'est utilisé.`,
    },
  ];

  for (const page of pages) {
    await prisma.page.create({ data: page });
  }
  console.log(`${pages.length} pages seeded.`);
};

const seedAdminUser = async () => {
  await prisma.adminUser.create({
    data: {
      email: "admin@pierresenlumieres.fr",
      name: "Admin Pierres en Lumières",
    },
  });
  console.log("Admin user seeded.");
};

const main = async () => {
  console.log("Starting seed...");
  await clearDatabase();
  await seedEvents();
  await seedNews();
  await seedPartners();
  await seedPages();
  await seedAdminUser();
  console.log("Seed complete.");
};

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
