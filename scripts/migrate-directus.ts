import 'dotenv/config';
import { PrismaClient, Department, Category } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const DIRECTUS_URL = process.env.DIRECTUS_URL || "https://pierresenlumieres.fr/backend";
const DRY_RUN = process.argv.includes("--dry-run");

interface DirectusDateHoraire {
  Datedebut: string;
  Datefin: string;
  Heureouvert1: string;
  Heurefermeture1: string;
}

interface DirectusOrganisme {
  Commune: string;
  Adresse1: string;
  Codepostal: string;
}

interface DirectusLieuPrincipal {
  Lieuprincipal: string;
  Adresse1: string;
  Codepostal: string;
}

interface DirectusContact {
  tel: string;
  mobile: string;
  mail: string;
  web: string;
  facebook: string;
}

interface DirectusEvent {
  id: string;
  status: string;
  title: string;
  description: string;
  departement: string;
  categories: string[];
  geo: { type: string; coordinates: [number, number] };
  datehorairess: DirectusDateHoraire[];
  organismes: DirectusOrganisme[];
  lieu_principaux: DirectusLieuPrincipal[];
  contacts: DirectusContact[];
  photos: Array<{ directus_files_id: string } | number>;
  sticky: boolean;
  raison_social: string;
}

interface EditorJSBlock {
  type: string;
  data: Record<string, unknown>;
}

interface DirectusNews {
  id: string;
  status: string;
  titre: string;
  description: string;
  corps: { blocks: EditorJSBlock[] };
  illustration: string;
  sticky: boolean;
}

const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 100);
};

const mapDepartment = (dept: string): Department | undefined => {
  const mapping: Record<string, Department> = {
    "Calvados": "CALVADOS",
    "Seine-Maritime": "SEINE_MARITIME",
    "Eure": "EURE",
    "Manche": "MANCHE",
    "Orne": "ORNE",
  };
  return mapping[dept];
};

const mapCategory = (cat: string): Category | undefined => {
  const mapping: Record<string, Category> = {
    "Illuminations": "ILLUMINATIONS",
    "Visite": "VISITES",
    "Exposition": "EXPOSITIONS",
    "Animations et spectacles vivants": "ANIMATIONS",
    "Animation": "ANIMATIONS",
  };
  return mapping[cat];
};

const editorJSToMarkdown = (blocks: EditorJSBlock[]): string => {
  return blocks
    .map((block) => {
      if (block.type === "paragraph") {
        return (block.data as Record<string, unknown>).text as string || "";
      }
      if (block.type === "header") {
        const text = (block.data as Record<string, unknown>).text as string || "";
        const level = ((block.data as Record<string, unknown>).level as number) || 2;
        return `${"#".repeat(level)} ${text}`;
      }
      if (block.type === "image") {
        const fileId = ((block.data as Record<string, unknown>).file as Record<string, unknown>)?.fileId as string;
        if (fileId) {
          return `![image](https://pierresenlumieres.fr/backend/assets/${fileId}?key=webp&width=1600&format=webp&quality=70)`;
        }
      }
      if (block.type === "embed") {
        const embed = (block.data as Record<string, unknown>).embed as string;
        if (embed) {
          return `[Embedded content](${embed})`;
        }
      }
      return "";
    })
    .filter((line) => line.length > 0)
    .join("\n\n");
};

const getImageUrl = (photo: { directus_files_id: string } | number): string => {
  const id = typeof photo === 'object' && photo !== null ? photo.directus_files_id : photo;
  return `${DIRECTUS_URL}/assets/${id}?key=webp&width=1600&format=webp&quality=70`;
};

const fetchDirectusData = async <T>(collection: string, extraFields = ""): Promise<T[]> => {
  const fields = extraFields ? `*,${extraFields}` : "*";
  try {
    const response = await fetch(
      `${DIRECTUS_URL}/items/${collection}?limit=-1&fields=${fields}`
    );

    if (!response.ok) {
      throw new Error(
        `Directus API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error(`Failed to fetch ${collection}:`, error);
    return [];
  }
};

const getOrCreateSlug = async (baseSlug: string, eventId: string): Promise<string> => {
  let slug = baseSlug;
  let counter = 1;
  let existingEvent = await prisma.event.findUnique({ where: { slug } });

  while (existingEvent && existingEvent.id !== eventId) {
    slug = `${baseSlug}-${counter}`;
    existingEvent = await prisma.event.findUnique({ where: { slug } });
    counter++;
  }

  return slug;
};

const getOrCreateNewsSlug = async (baseSlug: string, newsId: string): Promise<string> => {
  let slug = baseSlug;
  let counter = 1;
  let existingNews = await prisma.news.findUnique({ where: { slug } });

  while (existingNews && existingNews.id !== newsId) {
    slug = `${baseSlug}-${counter}`;
    existingNews = await prisma.news.findUnique({ where: { slug } });
    counter++;
  }

  return slug;
};

const migrateEvents = async () => {
  console.log("Fetching events from Directus...");
  const events = await fetchDirectusData<DirectusEvent>("evenements", "photos.directus_files_id");

  console.log(`Found ${events.length} events\n`);

  let createdCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < events.length; i++) {
    const event = events[i];

    if (!event.title || !event.departement || !event.categories?.[0]) {
      skippedCount++;
      continue;
    }

    const department = mapDepartment(event.departement);
    const category = mapCategory(event.categories[0]);

    if (!department || !category) {
      skippedCount++;
      continue;
    }

    const dateHoraire = event.datehorairess?.[0];
    const lieu = event.lieu_principaux?.[0];
    const organisme = event.organismes?.[0];
    const contact = event.contacts?.[0];

    const dateStart = dateHoraire ? new Date(dateHoraire.Datedebut) : new Date();
    const dateEnd = dateHoraire ? new Date(dateHoraire.Datefin) : undefined;
    const timeStart = dateHoraire?.Heureouvert1 || undefined;
    const timeEnd = dateHoraire?.Heurefermeture1 || undefined;

    const slug = await getOrCreateSlug(slugify(event.title), event.id);

    const eventData = {
      id: event.id,
      title: event.title,
      slug,
      description: event.description || "",
      location: lieu?.Adresse1 || "",
      city: organisme?.Commune || "",
      postalCode: lieu?.Codepostal || organisme?.Codepostal || "",
      department,
      category,
      dateStart,
      dateEnd,
      timeStart,
      timeEnd,
      organizer: event.raison_social || "",
      email: contact?.mail || undefined,
      phone: contact?.tel || contact?.mobile || undefined,
      website: contact?.web || contact?.facebook || undefined,
      latitude: event.geo?.coordinates?.[1] || 0,
      longitude: event.geo?.coordinates?.[0] || 0,
      coverImage: event.photos?.[0] ? getImageUrl(event.photos[0]) : undefined,
      images: event.photos ? event.photos.map(getImageUrl) : [],
      featured: event.sticky || false,
      accessible: false,
      published: event.status === "published",
    };

    if (DRY_RUN) {
      console.log(`[DRY RUN] Would create event: ${eventData.title}`);
    } else {
      try {
        await prisma.event.upsert({
          where: { id: event.id },
          update: eventData,
          create: eventData,
        });
        createdCount++;
      } catch (error) {
        console.error(`Error creating event ${event.title}:`, error);
        skippedCount++;
      }
    }

    if ((i + 1) % 100 === 0) {
      console.log(`Progress: ${i + 1}/${events.length} events processed...`);
    }
  }

  console.log(`\nMigrated ${createdCount}/${events.length} events (${skippedCount} skipped)\n`);
};

const migrateNews = async () => {
  console.log("Fetching news from Directus...");
  const articles = await fetchDirectusData<DirectusNews>("actualites");

  const publishedArticles = articles.filter((a) => a.status === "published");
  console.log(`Found ${publishedArticles.length} published news articles\n`);

  let createdCount = 0;

  for (let i = 0; i < publishedArticles.length; i++) {
    const article = publishedArticles[i];

    if (!article.titre) continue;

    const slug = await getOrCreateNewsSlug(slugify(article.titre), article.id);

    const newsData = {
      id: article.id,
      title: article.titre,
      slug,
      excerpt: article.description || "",
      content: editorJSToMarkdown(article.corps?.blocks || []),
      coverImage: article.illustration
        ? `https://pierresenlumieres.fr/backend/assets/${article.illustration}?key=webp&width=1600&format=webp&quality=70`
        : undefined,
      published: true,
      publishedAt: new Date(),
      featured: article.sticky || false,
    };

    if (DRY_RUN) {
      console.log(`[DRY RUN] Would create news: ${newsData.title}`);
    } else {
      try {
        await prisma.news.upsert({
          where: { id: article.id },
          update: newsData,
          create: newsData,
        });
        createdCount++;
      } catch (error) {
        console.error(`Error creating news ${article.titre}:`, error);
      }
    }

    if ((i + 1) % 50 === 0) {
      console.log(`Progress: ${i + 1}/${publishedArticles.length} news processed...`);
    }
  }

  console.log(`\nMigrated ${createdCount}/${publishedArticles.length} news articles\n`);
};

const migratePartners = async () => {
  console.log("Creating partners (manual list)...\n");

  const partners = [
    { name: "Région Normandie", logo: "/images/partners/normandie.png", order: 1 },
    { name: "Fondation du Patrimoine", logo: "/images/partners/fondation-patrimoine.png", order: 2 },
    { name: "Calvados", logo: "/images/partners/calvados.png", order: 3 },
    { name: "Eure", logo: "/images/partners/eure.png", order: 4 },
    { name: "Manche", logo: "/images/partners/manche.png", order: 5 },
    { name: "Orne", logo: "/images/partners/orne.png", order: 6 },
    { name: "Seine-Maritime", logo: "/images/partners/seine-maritime.png", order: 7 },
  ];

  let createdCount = 0;

  for (const partner of partners) {
    if (DRY_RUN) {
      console.log(`[DRY RUN] Would create partner: ${partner.name}`);
    } else {
      try {
        await prisma.partner.upsert({
          where: { name: partner.name },
          update: { logo: partner.logo, order: partner.order },
          create: { name: partner.name, logo: partner.logo, order: partner.order },
        });
        createdCount++;
      } catch (error) {
        console.error(`Error creating partner ${partner.name}:`, error);
      }
    }
  }

  console.log(`\nMigrated ${createdCount} partners\n`);
};

const main = async () => {
  if (DRY_RUN) {
    console.log("=== DRY RUN MODE ===\n");
  }

  console.log("Starting Directus migration...\n");
  console.log(`Directus URL: ${DIRECTUS_URL}\n`);

  await migrateEvents();
  await migrateNews();
  await migratePartners();

  console.log("Migration complete.");
};

main()
  .catch((e) => {
    console.error("Migration failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
