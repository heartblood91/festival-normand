import "dotenv/config"
import { PrismaClient, Department, Category } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

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
  `)
  console.log("Database cleared.")
}

const seedEvents = async () => {
  const events = [
    // CALVADOS (3 events)
    {
      titleFr: "Illumination de l'Abbaye aux Hommes",
      titleEn: "Abbaye aux Hommes Illumination",
      slug: "illumination-abbaye-aux-hommes",
      descriptionFr:
        "Découvrez l'Abbaye aux Hommes de Caen sous un éclairage spectaculaire mettant en valeur son architecture romane et gothique. Un parcours lumineux vous guidera à travers les jardins et les cloîtres.",
      descriptionEn:
        "Discover the Abbaye aux Hommes in Caen under spectacular lighting that highlights its Romanesque and Gothic architecture. A luminous trail will guide you through the gardens and cloisters.",
      location: "Abbaye aux Hommes",
      city: "Caen",
      postalCode: "14000",
      department: Department.CALVADOS,
      category: Category.ILLUMINATIONS,
      dateStart: new Date("2026-05-29T20:00:00"),
      dateEnd: new Date("2026-05-31T23:59:00"),
      timeStart: "20:00",
      timeEnd: "00:00",
      pricingFr: "Gratuit",
      pricingEn: "Free",
      organizer: "Ville de Caen",
      email: "patrimoine@caen.fr",
      latitude: 49.1811,
      longitude: -0.3726,
      coverImage: "/images/seed/abbaye-hommes.jpg",
      featured: true,
      accessible: true,
    },
    {
      titleFr: "Visite nocturne du Château de Falaise",
      titleEn: "Château de Falaise by Night",
      slug: "visite-nocturne-chateau-falaise",
      descriptionFr:
        "Visitez le château natal de Guillaume le Conquérant à la lueur des torches. Des guides costumés vous raconteront l'histoire fascinante de cette forteresse médiévale.",
      descriptionEn:
        "Tour the birthplace of William the Conqueror by torchlight. Costumed guides will share the fascinating history of this medieval fortress.",
      location: "Château Guillaume-le-Conquérant",
      city: "Falaise",
      postalCode: "14700",
      department: Department.CALVADOS,
      category: Category.VISITES,
      dateStart: new Date("2026-05-29T21:00:00"),
      timeStart: "21:00",
      timeEnd: "23:30",
      pricingFr: "5€ adulte, gratuit -12 ans",
      pricingEn: "€5 adult, free under 12",
      organizer: "Office de Tourisme de Falaise",
      email: "contact@falaise-tourisme.fr",
      latitude: 48.8955,
      longitude: -0.1967,
      coverImage: "/images/seed/chateau-falaise.jpg",
      featured: true,
      accessible: false,
    },
    {
      titleFr: "Exposition 'Lumières sur le Bessin'",
      titleEn: "'Lights over the Bessin' Exhibition",
      slug: "exposition-lumieres-bessin",
      descriptionFr:
        "Exposition photographique en plein air sur le patrimoine du Bessin, installée sur les remparts de la cathédrale de Bayeux.",
      descriptionEn:
        "Open-air photo exhibition celebrating the heritage of the Bessin region, staged along the ramparts of Bayeux cathedral.",
      location: "Cathédrale Notre-Dame de Bayeux",
      city: "Bayeux",
      postalCode: "14400",
      department: Department.CALVADOS,
      category: Category.EXPOSITIONS,
      dateStart: new Date("2026-05-30T18:00:00"),
      dateEnd: new Date("2026-05-31T22:00:00"),
      timeStart: "18:00",
      timeEnd: "22:00",
      pricingFr: "Gratuit",
      pricingEn: "Free",
      organizer: "Association Patrimoine du Bessin",
      email: "patrimoine-bessin@example.fr",
      latitude: 49.2764,
      longitude: -0.7024,
      accessible: true,
    },

    // EURE (3 events)
    {
      titleFr: "Son et Lumière au Château Gaillard",
      titleEn: "Sound and Light Show at Château Gaillard",
      slug: "son-lumiere-chateau-gaillard",
      descriptionFr:
        "Spectacle son et lumière projeté sur les ruines du Château Gaillard, forteresse construite par Richard Cœur de Lion. Une plongée dans l'histoire médiévale normande.",
      descriptionEn:
        "Sound and light show projected onto the ruins of Château Gaillard, the fortress built by Richard the Lionheart. A journey into medieval Norman history.",
      location: "Château Gaillard",
      city: "Les Andelys",
      postalCode: "27700",
      department: Department.EURE,
      category: Category.ILLUMINATIONS,
      dateStart: new Date("2026-05-29T21:30:00"),
      dateEnd: new Date("2026-05-31T23:00:00"),
      timeStart: "21:30",
      timeEnd: "23:00",
      pricingFr: "Gratuit",
      pricingEn: "Free",
      organizer: "Communauté de communes des Andelys",
      email: "culture@andelys.fr",
      latitude: 49.2358,
      longitude: 1.3994,
      coverImage: "/images/seed/chateau-gaillard.jpg",
      featured: true,
      accessible: false,
    },
    {
      titleFr: "Animations médiévales à l'Abbaye du Bec-Hellouin",
      titleEn: "Medieval Activities at Bec-Hellouin Abbey",
      slug: "animations-medievales-bec-hellouin",
      descriptionFr:
        "Reconstitutions historiques, ateliers d'enluminure et de calligraphie dans le cadre exceptionnel de l'abbaye bénédictine du Bec-Hellouin.",
      descriptionEn:
        "Historical reenactments, illumination and calligraphy workshops in the remarkable setting of the Benedictine abbey of Bec-Hellouin.",
      location: "Abbaye du Bec-Hellouin",
      city: "Le Bec-Hellouin",
      postalCode: "27800",
      department: Department.EURE,
      category: Category.ANIMATIONS,
      dateStart: new Date("2026-05-30T14:00:00"),
      timeStart: "14:00",
      timeEnd: "22:00",
      pricingFr: "3€ adulte",
      pricingEn: "€3 adult",
      organizer: "Les Amis du Bec-Hellouin",
      email: "amis-bec@example.fr",
      latitude: 49.2311,
      longitude: 0.7236,
      accessible: true,
    },
    {
      titleFr: "Visite guidée du Moulin d'Andé",
      titleEn: "Guided Tour of the Moulin d'Andé",
      slug: "visite-guidee-moulin-ande",
      descriptionFr:
        "Découverte du moulin historique d'Andé, lieu de création artistique et cinématographique depuis les années 60.",
      descriptionEn:
        "Explore the historic mill of Andé, a hub of artistic and cinematic creation since the 1960s.",
      location: "Moulin d'Andé",
      city: "Andé",
      postalCode: "27430",
      department: Department.EURE,
      category: Category.VISITES,
      dateStart: new Date("2026-05-31T10:00:00"),
      timeStart: "10:00",
      timeEnd: "18:00",
      pricingFr: "Gratuit",
      pricingEn: "Free",
      organizer: "Fondation du Moulin d'Andé",
      email: "contact@moulinande.fr",
      latitude: 49.2547,
      longitude: 1.2217,
      accessible: true,
    },

    // MANCHE (3 events)
    {
      titleFr: "Illumination du Mont-Saint-Michel",
      titleEn: "Mont-Saint-Michel Illumination",
      slug: "illumination-mont-saint-michel",
      descriptionFr:
        "Le Mont-Saint-Michel s'illumine pour Pierres en Lumières. Un spectacle féerique sur la merveille de l'Occident avec mapping vidéo sur la façade de l'abbatiale.",
      descriptionEn:
        "Mont-Saint-Michel lights up for Pierres en Lumières. An enchanting show on the Wonder of the West, featuring video mapping on the abbey church's facade.",
      location: "Abbaye du Mont-Saint-Michel",
      city: "Le Mont-Saint-Michel",
      postalCode: "50170",
      department: Department.MANCHE,
      category: Category.ILLUMINATIONS,
      dateStart: new Date("2026-05-29T22:00:00"),
      dateEnd: new Date("2026-05-31T23:30:00"),
      timeStart: "22:00",
      timeEnd: "23:30",
      pricingFr: "Gratuit (accès abbaye payant)",
      pricingEn: "Free (abbey entry extra)",
      organizer: "Centre des monuments nationaux",
      email: "mont-saint-michel@monuments-nationaux.fr",
      latitude: 48.6361,
      longitude: -1.5115,
      coverImage: "/images/seed/mont-saint-michel.jpg",
      featured: true,
      accessible: false,
    },
    {
      titleFr: "Exposition 'Patrimoine Maritime' à Cherbourg",
      titleEn: "'Maritime Heritage' Exhibition in Cherbourg",
      slug: "exposition-patrimoine-maritime-cherbourg",
      descriptionFr:
        "Exposition immersive sur le patrimoine maritime du Cotentin à la Cité de la Mer. Maquettes, objets historiques et témoignages de marins.",
      descriptionEn:
        "Immersive exhibition on the maritime heritage of the Cotentin peninsula at the Cité de la Mer. Ship models, historical artefacts and sailors' accounts.",
      location: "Cité de la Mer",
      city: "Cherbourg-en-Cotentin",
      postalCode: "50100",
      department: Department.MANCHE,
      category: Category.EXPOSITIONS,
      dateStart: new Date("2026-05-29T10:00:00"),
      dateEnd: new Date("2026-05-31T19:00:00"),
      timeStart: "10:00",
      timeEnd: "19:00",
      pricingFr: "Tarif réduit : 10€",
      pricingEn: "Reduced rate: €10",
      organizer: "Cité de la Mer",
      email: "info@citedelamer.com",
      latitude: 49.6404,
      longitude: -1.6161,
      accessible: true,
    },
    {
      titleFr: "Animations au Château de Pirou",
      titleEn: "Activities at Château de Pirou",
      slug: "animations-chateau-pirou",
      descriptionFr:
        "Animations familiales au château fort de Pirou : tir à l'arc, forge, contes et légendes normandes autour du feu.",
      descriptionEn:
        "Family activities at the fortified castle of Pirou: archery, forge demonstrations, Norman tales and legends around the fire.",
      location: "Château de Pirou",
      city: "Pirou",
      postalCode: "50770",
      department: Department.MANCHE,
      category: Category.ANIMATIONS,
      dateStart: new Date("2026-05-30T14:00:00"),
      timeStart: "14:00",
      timeEnd: "21:00",
      pricingFr: "4€ adulte, 2€ enfant",
      pricingEn: "€4 adult, €2 child",
      organizer: "Association du Château de Pirou",
      email: "chateau.pirou@example.fr",
      latitude: 49.1636,
      longitude: -1.5631,
      accessible: false,
    },

    // ORNE (3 events)
    {
      titleFr: "Illumination du Haras du Pin",
      titleEn: "Haras du Pin Illumination",
      slug: "illumination-haras-du-pin",
      descriptionFr:
        "Le 'Versailles du cheval' s'illumine. Parcours lumineux dans les écuries royales et spectacle équestre nocturne dans la cour d'honneur.",
      descriptionEn:
        "The 'Versailles of the horse' comes alight. A luminous trail through the royal stables and a nighttime equestrian show in the main courtyard.",
      location: "Haras national du Pin",
      city: "Le Pin-au-Haras",
      postalCode: "61310",
      department: Department.ORNE,
      category: Category.ILLUMINATIONS,
      dateStart: new Date("2026-05-29T20:30:00"),
      dateEnd: new Date("2026-05-30T23:00:00"),
      timeStart: "20:30",
      timeEnd: "23:00",
      pricingFr: "8€ adulte, 4€ enfant",
      pricingEn: "€8 adult, €4 child",
      organizer: "IFCE - Haras du Pin",
      email: "haras-pin@ifce.fr",
      latitude: 48.7372,
      longitude: 0.1114,
      coverImage: "/images/seed/haras-du-pin.jpg",
      featured: true,
      accessible: true,
    },
    {
      titleFr: "Visite de la Maison d'Oze à Alençon",
      titleEn: "Visit of the Maison d'Ozé in Alençon",
      slug: "visite-maison-oze-alencon",
      descriptionFr:
        "Visite commentée de la Maison d'Ozé, joyau de l'architecture Renaissance alençonnaise, avec démonstration de dentelle au point d'Alençon.",
      descriptionEn:
        "Guided tour of the Maison d'Ozé, a gem of Alençon Renaissance architecture, featuring a demonstration of the famous Point d'Alençon lace.",
      location: "Maison d'Ozé",
      city: "Alençon",
      postalCode: "61000",
      department: Department.ORNE,
      category: Category.VISITES,
      dateStart: new Date("2026-05-30T10:00:00"),
      timeStart: "10:00",
      timeEnd: "17:00",
      pricingFr: "Gratuit",
      pricingEn: "Free",
      organizer: "Office de Tourisme d'Alençon",
      email: "tourisme@alencon.fr",
      latitude: 48.4319,
      longitude: 0.0917,
      accessible: true,
    },
    {
      titleFr: "Exposition d'art sacré à Sées",
      titleEn: "Sacred Art Exhibition in Sées",
      slug: "exposition-art-sacre-sees",
      descriptionFr:
        "Exposition d'art sacré dans la cathédrale de Sées mettant en lumière les trésors de l'art religieux ornais du Moyen Âge au XIXe siècle.",
      descriptionEn:
        "Sacred art exhibition inside Sées cathedral, spotlighting the treasures of the Orne's religious art from the Middle Ages to the 19th century.",
      location: "Cathédrale Notre-Dame de Sées",
      city: "Sées",
      postalCode: "61500",
      department: Department.ORNE,
      category: Category.EXPOSITIONS,
      dateStart: new Date("2026-05-29T09:00:00"),
      dateEnd: new Date("2026-05-31T18:00:00"),
      timeStart: "09:00",
      timeEnd: "18:00",
      pricingFr: "Gratuit",
      pricingEn: "Free",
      organizer: "Diocèse de Sées",
      email: "cathedrale.sees@example.fr",
      latitude: 48.6039,
      longitude: 0.1717,
      accessible: true,
    },

    // SEINE-MARITIME (4 events)
    {
      titleFr: "Illumination de l'Abbatiale de Fécamp",
      titleEn: "Illumination of Fécamp Abbey Church",
      slug: "illumination-abbatiale-fecamp",
      descriptionFr:
        "L'abbatiale de la Trinité de Fécamp, l'une des plus grandes églises de France, se pare de lumières. Mapping vidéo sur la façade et concert de carillons.",
      descriptionEn:
        "The Abbey Church of the Trinity in Fécamp, one of the largest churches in France, dresses in light. Video mapping on the facade and a carillon concert.",
      location: "Abbatiale de la Trinité",
      city: "Fécamp",
      postalCode: "76400",
      department: Department.SEINE_MARITIME,
      category: Category.ILLUMINATIONS,
      dateStart: new Date("2026-05-29T21:00:00"),
      dateEnd: new Date("2026-05-31T23:00:00"),
      timeStart: "21:00",
      timeEnd: "23:00",
      pricingFr: "Gratuit",
      pricingEn: "Free",
      organizer: "Ville de Fécamp",
      email: "culture@ville-fecamp.fr",
      latitude: 49.7583,
      longitude: 0.3767,
      coverImage: "/images/seed/abbatiale-fecamp.jpg",
      featured: true,
      accessible: true,
    },
    {
      titleFr: "Visite nocturne de la Cathédrale de Rouen",
      titleEn: "Rouen Cathedral by Night",
      slug: "visite-nocturne-cathedrale-rouen",
      descriptionFr:
        "Visite exceptionnelle de la cathédrale Notre-Dame de Rouen de nuit, avec accès aux parties habituellement fermées au public et projection lumineuse intérieure.",
      descriptionEn:
        "Exceptional nighttime visit of Rouen's Notre-Dame cathedral, with access to areas normally closed to the public and an indoor light projection.",
      location: "Cathédrale Notre-Dame de Rouen",
      city: "Rouen",
      postalCode: "76000",
      department: Department.SEINE_MARITIME,
      category: Category.VISITES,
      dateStart: new Date("2026-05-29T21:00:00"),
      dateEnd: new Date("2026-05-31T23:30:00"),
      timeStart: "21:00",
      timeEnd: "23:30",
      pricingFr: "Gratuit",
      pricingEn: "Free",
      organizer: "Archevêché de Rouen",
      email: "cathedrale@rouen.fr",
      latitude: 49.4401,
      longitude: 1.0936,
      featured: true,
      accessible: true,
    },
    {
      titleFr: "Animations au Château de Dieppe",
      titleEn: "Activities at Château de Dieppe",
      slug: "animations-chateau-dieppe",
      descriptionFr:
        "Le château-musée de Dieppe propose des animations pour toute la famille : ateliers de sculpture sur ivoire, contes de pirates et dégustations de produits locaux.",
      descriptionEn:
        "The castle-museum of Dieppe offers family activities: ivory-carving workshops, pirate tales and tastings of local produce.",
      location: "Château-Musée de Dieppe",
      city: "Dieppe",
      postalCode: "76200",
      department: Department.SEINE_MARITIME,
      category: Category.ANIMATIONS,
      dateStart: new Date("2026-05-30T10:00:00"),
      timeStart: "10:00",
      timeEnd: "22:00",
      pricingFr: "Gratuit",
      pricingEn: "Free",
      organizer: "Ville de Dieppe",
      email: "musees@mairie-dieppe.fr",
      latitude: 49.9256,
      longitude: 1.0694,
      accessible: false,
    },
    {
      titleFr: "Exposition 'Impressionnisme et Patrimoine' à Étretat",
      titleEn: "'Impressionism and Heritage' Exhibition in Étretat",
      slug: "exposition-impressionnisme-patrimoine-etretat",
      descriptionFr:
        "Exposition en plein air reproduisant les tableaux impressionnistes sur les lieux mêmes où ils furent peints. Un dialogue entre art et paysage.",
      descriptionEn:
        "Open-air exhibition reproducing Impressionist paintings on the very spots where they were painted. A dialogue between art and landscape.",
      location: "Jardins d'Étretat",
      city: "Étretat",
      postalCode: "76790",
      department: Department.SEINE_MARITIME,
      category: Category.EXPOSITIONS,
      dateStart: new Date("2026-05-29T10:00:00"),
      dateEnd: new Date("2026-05-31T19:00:00"),
      timeStart: "10:00",
      timeEnd: "19:00",
      pricingFr: "Inclus dans l'entrée des jardins",
      pricingEn: "Included with garden admission",
      organizer: "Les Jardins d'Étretat",
      email: "contact@etretatgarden.fr",
      latitude: 49.7072,
      longitude: 0.2042,
      accessible: true,
    },
  ]

  for (const event of events) {
    await prisma.event.create({ data: event })
  }
  console.log(`${events.length} events seeded.`)
}

const seedNews = async () => {
  const articles = [
    {
      titleFr: "Pierres en Lumières 2026 : le programme dévoilé",
      titleEn: "Pierres en Lumières 2026: the programme unveiled",
      slug: "programme-2026-devoile",
      excerptFr:
        "Découvrez le programme complet de l'édition 2026 du festival Pierres en Lumières qui se tiendra les 29, 30 et 31 mai.",
      excerptEn:
        "Discover the full programme of the 2026 Pierres en Lumières festival, taking place on 29, 30 and 31 May.",
      contentFr: `# Pierres en Lumières 2026 : un programme exceptionnel

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
      contentEn: `# Pierres en Lumières 2026: an exceptional programme

The 2026 edition of the **Pierres en Lumières** festival promises to be the most ambitious ever organised in Normandy.

## More than 500 sites open

This year, over 500 heritage sites will open their doors across the five Norman départements. From thousand-year-old abbeys to Renaissance châteaux and half-timbered manor houses, Norman heritage reveals itself in a brand new light.

## Three evenings of festivities

The festival will take place over three exceptional evenings:
- **Friday 29 May**: opening night with simultaneous illuminations
- **Saturday 30 May**: a full day of activities and visits
- **Sunday 31 May**: a stunning finale

## What's new in 2026

Among the highlights, an immersive augmented-reality trail will be offered at several major sites, letting visitors see monuments as they looked when first built.`,
      coverImage: "/images/seed/news-programme.jpg",
      publishedAt: new Date("2026-02-15T10:00:00"),
    },
    {
      titleFr: "Les bénévoles au cœur du festival",
      titleEn: "Volunteers at the heart of the festival",
      slug: "benevoles-coeur-festival",
      excerptFr: "Rencontre avec les bénévoles qui font vivre Pierres en Lumières chaque année.",
      excerptEn: "Meet the volunteers who bring Pierres en Lumières to life every year.",
      contentFr: `# Les bénévoles, piliers de Pierres en Lumières

Chaque année, plus de **2 000 bénévoles** se mobilisent pour faire vivre le festival Pierres en Lumières. Portrait de ces passionnés du patrimoine.

## Marie, guide à l'Abbaye de Jumièges

"Je participe depuis la première édition. Voir les yeux des visiteurs s'illuminer quand ils découvrent l'abbaye de nuit, c'est magique."

## Pierre, technicien lumière à Rouen

"Éclairer la cathédrale, c'est un défi technique incroyable. Chaque pierre a sa propre couleur, sa propre texture. Il faut respecter le monument tout en le magnifiant."

## Rejoignez l'aventure

Les inscriptions pour les bénévoles de l'édition 2026 sont ouvertes. [Inscrivez-vous ici](/inscription).`,
      contentEn: `# Volunteers, the pillars of Pierres en Lumières

Every year, more than **2,000 volunteers** come together to bring the Pierres en Lumières festival to life. Portraits of these heritage enthusiasts.

## Marie, guide at Jumièges Abbey

"I've taken part since the very first edition. Seeing visitors' eyes light up when they discover the abbey at night — it's pure magic."

## Pierre, lighting technician in Rouen

"Lighting the cathedral is an incredible technical challenge. Every stone has its own colour, its own texture. You have to respect the monument while making it shine."

## Join the adventure

Registrations for 2026 volunteers are now open. [Sign up here](/inscription).`,
      coverImage: "/images/seed/news-benevoles.jpg",
      publishedAt: new Date("2026-03-01T14:00:00"),
    },
    {
      titleFr: "Accessibilité : un festival pour tous",
      titleEn: "Accessibility: a festival for everyone",
      slug: "accessibilite-festival-pour-tous",
      excerptFr:
        "Le festival renforce son engagement en faveur de l'accessibilité avec de nouvelles initiatives pour l'édition 2026.",
      excerptEn:
        "The festival reinforces its commitment to accessibility with new initiatives for the 2026 edition.",
      contentFr: `# Un festival accessible à tous

Pierres en Lumières 2026 renforce son engagement pour l'**accessibilité universelle**.

## Parcours PMR

De nombreux sites proposent désormais des parcours adaptés aux personnes à mobilité réduite. Repérez-les grâce au pictogramme dédié sur notre carte interactive.

## Audiodescription

Pour la première fois, des parcours en audiodescription seront disponibles dans 50 sites, permettant aux personnes malvoyantes de profiter pleinement de l'expérience.

## Langue des signes

Des visites en langue des signes française (LSF) seront proposées dans les sites majeurs de chaque département.

Consultez la liste complète des sites accessibles sur notre [page événements](/evenements?accessible=true).`,
      contentEn: `# A festival accessible to all

Pierres en Lumières 2026 strengthens its commitment to **universal accessibility**.

## Wheelchair-friendly routes

Many sites now offer routes adapted for visitors with reduced mobility. Spot them with the dedicated icon on our interactive map.

## Audio description

For the first time, audio-described tours will be available at 50 sites, allowing visually impaired visitors to fully enjoy the experience.

## Sign language

Tours in French Sign Language (LSF) will be offered at major sites in each département.

See the full list of accessible sites on our [events page](/evenements?accessible=true).`,
      coverImage: "/images/seed/news-accessibilite.jpg",
      publishedAt: new Date("2026-03-10T09:00:00"),
    },
  ]

  for (const article of articles) {
    await prisma.news.create({ data: article })
  }
  console.log(`${articles.length} news articles seeded.`)
}

const seedPartners = async () => {
  const partners = [
    {
      nameFr: "Région Normandie",
      nameEn: "Normandy Region",
      logo: "/images/partners/normandie.png",
      website: "https://www.normandie.fr",
      order: 1,
    },
    {
      nameFr: "Fondation du Patrimoine",
      nameEn: "Fondation du Patrimoine",
      logo: "/images/partners/fondation-patrimoine.png",
      website: "https://www.fondation-patrimoine.org",
      order: 2,
    },
    {
      nameFr: "Département du Calvados",
      nameEn: "Calvados Department",
      logo: "/images/partners/calvados.png",
      website: "https://www.calvados.fr",
      order: 3,
    },
    {
      nameFr: "Département de l'Eure",
      nameEn: "Eure Department",
      logo: "/images/partners/eure.png",
      website: "https://www.eure.fr",
      order: 4,
    },
    {
      nameFr: "Département de la Manche",
      nameEn: "Manche Department",
      logo: "/images/partners/manche.png",
      website: "https://www.manche.fr",
      order: 5,
    },
    {
      nameFr: "Département de l'Orne",
      nameEn: "Orne Department",
      logo: "/images/partners/orne.png",
      website: "https://www.orne.fr",
      order: 6,
    },
  ]

  for (const partner of partners) {
    await prisma.partner.create({ data: partner })
  }
  console.log(`${partners.length} partners seeded.`)
}

const seedPages = async () => {
  const pages = [
    {
      titleFr: "Le Festival Pierres en Lumières",
      titleEn: "The Pierres en Lumières Festival",
      slug: "festival",
      contentFr: `# Le Festival Pierres en Lumières

Pierres en Lumières est un événement festif et culturel, gratuit et ouvert à tous, qui met en valeur le patrimoine normand à travers des illuminations, animations, visites et expositions.

Né en 2009 en Orne, le festival s'est progressivement étendu à tous les départements normands depuis 2015. Chaque année, les 29, 30 et 31 mai, plus de 500 sites patrimoniaux ouvrent leurs portes gratuitement pour faire découvrir la richesse du patrimoine normand. Des châteaux illuminés aux abbayes en fête, des manoirs aux sites industriels, c'est toute la Normandie qui se met en lumière.

L'événement est organisé par la Région Normandie en partenariat avec les cinq départements normands et la Fondation du Patrimoine.

## Le Calvados

Le département du Calvados participe activement à Pierres en Lumières avec de nombreux sites ouverts chaque année. Des plages du Débarquement à la campagne du Pays d'Auge, le patrimoine calvadosien se révèle sous un nouveau jour.

Les visiteurs peuvent découvrir des sites emblématiques comme l'Abbaye de Grandouet, le château de Falaise ou encore les manoirs du Pays d'Auge, tous illuminés et animés pour l'occasion.

**Contact :** pierresenlumieres@calvados.fr

![Abbaye de Grandouet illuminée lors de Pierres en Lumières](https://pierresenlumieres.fr/backend/assets/a62f7bb3-4811-4140-9fab-23bcac8ce0d4?key=webp&width=1600&format=webp&quality=70)

## L'Eure

L'Eure, terre d'impressionnisme et de patrimoine médiéval, propose un parcours riche entre châteaux, abbayes et jardins remarquables.

Le département met en lumière ses trésors architecturaux : la Bibliothèque de Verneuil, l'abbaye du Bec-Hellouin, la collégiale de Vernon et bien d'autres sites d'exception.

**Contact :** patrimoines@eure.fr

![Bibliothèque de Verneuil illuminée](https://pierresenlumieres.fr/backend/assets/f656191a-c2d3-4852-b431-d371ead98a42?key=webp&width=1600&format=webp&quality=70)

## La Manche

Du Mont-Saint-Michel aux ports du Cotentin, la Manche offre un patrimoine maritime et religieux exceptionnel.

Le département propose des parcours nocturnes à travers ses sites les plus remarquables : le Château de Pirou, les forts Vauban, le phare de Gatteville et les charmants villages du Val de Saire.

**Contact :** patrimoine@manche.fr

![Château de Pirou illuminé de nuit](https://pierresenlumieres.fr/backend/assets/e23a2c17-3cd1-433d-b7c5-3c8ae778f671?key=webp&width=1600&format=webp&quality=70)

## L'Orne

Le département de l'Orne, avec ses haras, ses forêts et ses manoirs, propose une immersion dans la Normandie authentique.

Le Domaine de Prestal, le Haras du Pin surnommé le "Versailles du cheval", et les nombreux manoirs du Perche sont autant de sites qui participent chaque année à cette grande fête du patrimoine.

**Contact :** jamet.juliette@orne.fr - Tél : 02 33 81 23 00

![Domaine de Prestal illuminé lors de Pierres en Lumières](https://pierresenlumieres.fr/backend/assets/fe2a25b5-1c4e-450d-8a59-ae76bdbca036?key=webp&width=1600&format=webp&quality=70)

## La Seine-Maritime

De Rouen au pays de Caux, la Seine-Maritime dévoile un patrimoine industriel, religieux et maritime d'une richesse incomparable.

La cathédrale de Rouen, l'abbaye de Jumièges, le palais Bénédictine de Fécamp et les falaises d'Étretat font partie des sites incontournables de cette édition.

**Contact :** patrimoine@seinemaritime.fr

![Patrimoine de la Seine-Maritime](https://pierresenlumieres.fr/backend/assets/5a954400-7309-49e2-b0f1-d5994d61a362?key=webp&width=1600&format=webp&quality=70)

## La Fondation du Patrimoine

La [Fondation du Patrimoine](https://www.fondation-patrimoine.org/fondation-du-patrimoine/normandie/presentation) est partenaire historique de Pierres en Lumières. Elle contribue à la sauvegarde et à la valorisation du patrimoine de proximité partout en France.

Grâce à son réseau de bénévoles et de mécènes, la Fondation soutient chaque année des centaines de projets de restauration en Normandie. Elle accompagne les propriétaires de monuments historiques et de patrimoine vernaculaire dans leurs démarches de préservation.`,
      contentEn: `# The Pierres en Lumières Festival

Pierres en Lumières is a festive and cultural event, free and open to all, celebrating Norman heritage through illuminations, activities, tours and exhibitions.

Born in 2009 in the Orne département, the festival has gradually expanded to every Norman département since 2015. Each year, on 29, 30 and 31 May, more than 500 heritage sites open their doors free of charge to showcase the richness of Norman heritage. From illuminated châteaux to abbeys in celebration, from manor houses to industrial sites, all of Normandy lights up.

The event is organised by the Normandy Region in partnership with the five Norman départements and the Fondation du Patrimoine.

## Calvados

The Calvados département takes an active part in Pierres en Lumières, with many sites open each year. From the D-Day beaches to the rolling countryside of the Pays d'Auge, Calvados heritage appears in a whole new light.

Visitors can discover iconic sites such as the Abbaye de Grandouet, the château of Falaise and the manors of the Pays d'Auge, all illuminated and brought to life for the occasion.

**Contact:** pierresenlumieres@calvados.fr

![Abbaye de Grandouet illuminated during Pierres en Lumières](https://pierresenlumieres.fr/backend/assets/a62f7bb3-4811-4140-9fab-23bcac8ce0d4?key=webp&width=1600&format=webp&quality=70)

## Eure

The Eure, land of Impressionism and medieval heritage, offers a rich journey between châteaux, abbeys and remarkable gardens.

The département highlights its architectural treasures: the Verneuil Library, the Abbey of Bec-Hellouin, the Collegiate Church of Vernon and many other exceptional sites.

**Contact:** patrimoines@eure.fr

![Verneuil Library illuminated](https://pierresenlumieres.fr/backend/assets/f656191a-c2d3-4852-b431-d371ead98a42?key=webp&width=1600&format=webp&quality=70)

## Manche

From Mont-Saint-Michel to the ports of the Cotentin, the Manche offers outstanding maritime and religious heritage.

The département proposes nighttime trails through its most remarkable sites: the Château de Pirou, the Vauban forts, the Gatteville lighthouse and the charming villages of the Val de Saire.

**Contact:** patrimoine@manche.fr

![Château de Pirou illuminated at night](https://pierresenlumieres.fr/backend/assets/e23a2c17-3cd1-433d-b7c5-3c8ae778f671?key=webp&width=1600&format=webp&quality=70)

## Orne

The Orne département — with its stud farms, forests and manor houses — offers an immersion in authentic Normandy.

The Domaine de Prestal, the Haras du Pin (nicknamed "the Versailles of the horse"), and the many manors of the Perche are among the sites that take part each year in this great heritage celebration.

**Contact:** jamet.juliette@orne.fr — Tel: +33 2 33 81 23 00

![Domaine de Prestal illuminated during Pierres en Lumières](https://pierresenlumieres.fr/backend/assets/fe2a25b5-1c4e-450d-8a59-ae76bdbca036?key=webp&width=1600&format=webp&quality=70)

## Seine-Maritime

From Rouen to the Pays de Caux, Seine-Maritime reveals industrial, religious and maritime heritage of unparalleled richness.

Rouen Cathedral, Jumièges Abbey, the Bénédictine Palace in Fécamp and the cliffs of Étretat are among the must-see sites of this edition.

**Contact:** patrimoine@seinemaritime.fr

![Seine-Maritime heritage](https://pierresenlumieres.fr/backend/assets/5a954400-7309-49e2-b0f1-d5994d61a362?key=webp&width=1600&format=webp&quality=70)

## The Fondation du Patrimoine

The [Fondation du Patrimoine](https://www.fondation-patrimoine.org/fondation-du-patrimoine/normandie/presentation) is a long-standing partner of Pierres en Lumières. It contributes to safeguarding and promoting local heritage throughout France.

Thanks to its network of volunteers and patrons, the Foundation supports hundreds of restoration projects in Normandy each year. It assists the owners of listed monuments and vernacular heritage in their preservation efforts.`,
    },
    {
      titleFr: "Inscrivez votre événement",
      titleEn: "Register your event",
      slug: "inscription",
      contentFr: `# Inscrivez votre événement

Vous êtes propriétaire ou gestionnaire d'un site patrimonial en Normandie ? Participez à Pierres en Lumières 2026 !

## Découvrez le festival en vidéo

[Pierres en Lumières 2025 - Retour en images](https://www.youtube.com/embed/AHnGhy1o0pA)

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
      contentEn: `# Register your event

Are you the owner or manager of a heritage site in Normandy? Take part in Pierres en Lumières 2026!

## Discover the festival on video

[Pierres en Lumières 2025 — highlights](https://www.youtube.com/embed/AHnGhy1o0pA)

## How to register

Registration is free and open to all Norman heritage sites: châteaux, churches, manors, industrial sites, gardens and more.

Each département has its own registration form. Click your département's link below to access the form.

## Registration forms by département

- [Calvados — Registration form](https://inscription.calvados.pierresenlumieres.fr)
- [Eure — Registration form](https://inscription.eure.pierresenlumieres.fr)
- [Manche — Registration form](https://inscription.manche.pierresenlumieres.fr)
- [Orne — Registration form](https://inscription.orne.pierresenlumieres.fr)
- [Seine-Maritime — Registration form](https://inscription.seine-maritime.pierresenlumieres.fr)

## Eligibility criteria

- Be a heritage site located in Normandy
- Offer at least one activity, tour or illumination during the festival
- Commit to following the festival's charter
- Ensure visitor safety

## Deadlines

Registrations for the 2026 edition are open until **15 April 2026**.`,
    },
    {
      titleFr: "Mentions légales",
      titleEn: "Legal notice",
      slug: "mentions-legales",
      contentFr: `# Mentions légales

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
      contentEn: `# Legal notice

## Website publisher

The website pierresenlumieres.fr is published by the Normandy Region, in partnership with the five Norman départements and the Fondation du Patrimoine.

**Région Normandie**
Abbaye aux Dames
Place Reine Mathilde
CS 50523
14035 Caen Cedex, France

## Hosting

This website is hosted by Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA.

## Intellectual property

All content (text, images, videos) published on this website is protected by copyright. Any reproduction without prior authorisation is prohibited.

## Personal data

In accordance with GDPR, you have the right to access, rectify and erase your personal data. To exercise this right, contact us at: rgpd@normandie.fr

## Cookies

This website uses technical cookies required for its operation. No advertising cookies are used.`,
    },
  ]

  for (const page of pages) {
    await prisma.page.create({ data: page })
  }
  console.log(`${pages.length} pages seeded.`)
}

const seedAdminUser = async () => {
  const adminEmail = "admin@pierresenlumieres.fr"
  const adminName = "Admin Pierres en Lumières"

  // Create admin whitelist entry
  await prisma.adminUser.create({
    data: { email: adminEmail, name: adminName },
  })

  // Create corresponding Better Auth user for magic link login
  await prisma.user.create({
    data: {
      email: adminEmail,
      name: adminName,
      emailVerified: true,
    },
  })

  console.log("Admin user seeded.")
}

const main = async () => {
  console.log("Starting seed...")
  await clearDatabase()
  await seedEvents()
  await seedNews()
  await seedPartners()
  await seedPages()
  await seedAdminUser()
  console.log("Seed complete.")
}

main()
  .catch((e) => {
    console.error("Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
