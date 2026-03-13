import { PrismaClient, Department, Category } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const DIRECTUS_URL = process.env.DIRECTUS_URL || "https://pierresenlumieres.fr/backend";
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN || "";
const DRY_RUN = process.argv.includes("--dry-run");

interface DirectusEvent {
  id: string;
  title?: string;
  nom?: string;
  description?: string;
  location?: string;
  lieu?: string;
  city?: string;
  ville?: string;
  postalCode?: string;
  postal_code?: string;
  code_postal?: string;
  department?: string;
  departement?: string;
  category?: string;
  categorie?: string;
  dateStart?: string;
  date_start?: string;
  date_debut?: string;
  dateEnd?: string;
  date_end?: string;
  date_fin?: string;
  timeStart?: string;
  time_start?: string;
  heure_debut?: string;
  timeEnd?: string;
  time_end?: string;
  heure_fin?: string;
  pricing?: string;
  tarif?: string;
  organizer?: string;
  organisateur?: string;
  email?: string;
  phone?: string;
  telephone?: string;
  website?: string;
  site_web?: string;
  latitude?: number;
  longitude?: number;
  coverImage?: string;
  image_principale?: string;
  images?: string[];
  featured?: boolean;
  en_avant?: boolean;
  accessible?: boolean;
  published?: boolean;
}

interface DirectusNews {
  id: string;
  title?: string;
  titre?: string;
  excerpt?: string;
  resume?: string;
  content?: string;
  contenu?: string;
  coverImage?: string;
  image_principale?: string;
  published?: boolean;
  publishedAt?: string;
  published_at?: string;
  date_publication?: string;
}

interface DirectusPartner {
  id: string;
  name?: string;
  nom?: string;
  logo?: string;
  website?: string;
  site_web?: string;
  order?: number;
  ordre?: number;
}

interface DirectusPage {
  id: string;
  title?: string;
  titre?: string;
  slug?: string;
  content?: string;
  contenu?: string;
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

const mapDepartment = (dept: string | undefined): Department | undefined => {
  if (!dept) return undefined;
  const normalized = dept.toUpperCase().replace(/-/g, "_").replace(/\s/g, "_");
  if (normalized in Department) {
    return normalized as Department;
  }
  return undefined;
};

const mapCategory = (cat: string | undefined): Category | undefined => {
  if (!cat) return undefined;
  const normalized = cat.toUpperCase().replace(/-/g, "_").replace(/\s/g, "_");
  if (normalized in Category) {
    return normalized as Category;
  }
  return undefined;
};

const fetchDirectusData = async <T>(
  collection: string
): Promise<T[]> => {
  const headers: HeadersInit = {
    Authorization: `Bearer ${DIRECTUS_TOKEN}`,
  };

  try {
    const response = await fetch(
      `${DIRECTUS_URL}/items/${collection}?limit=-1`,
      { headers }
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

const getImageUrl = (fileId: string | undefined): string | undefined => {
  if (!fileId) return undefined;
  return `${DIRECTUS_URL}/assets/${fileId}`;
};

const clearDatabase = async () => {
  if (DRY_RUN) {
    console.log("[DRY RUN] Would clear database");
    return;
  }

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

const migrateEvents = async () => {
  console.log("Fetching events from Directus...");
  let events = await fetchDirectusData<DirectusEvent>("evenements");

  if (events.length === 0) {
    events = await fetchDirectusData<DirectusEvent>("events");
  }

  console.log(`Found ${events.length} events`);

  let createdCount = 0;

  for (const event of events) {
    const title = event.title || event.nom;
    if (!title) continue;

    const department = mapDepartment(event.department || event.departement);
    const category = mapCategory(event.category || event.categorie);

    if (!department || !category) continue;

    const dateStart = new Date(
      event.dateStart || event.date_start || event.date_debut || new Date()
    );
    const dateEnd = event.dateEnd || event.date_end || event.date_fin
      ? new Date(event.dateEnd || event.date_end || event.date_fin || new Date())
      : undefined;

    const eventData = {
      title,
      slug: slugify(title),
      description: event.description || "",
      location: event.location || event.lieu || "",
      city: event.city || event.ville || "",
      postalCode: event.postalCode || event.postal_code || event.code_postal || "",
      department,
      category,
      dateStart,
      dateEnd,
      timeStart: event.timeStart || event.time_start || event.heure_debut || undefined,
      timeEnd: event.timeEnd || event.time_end || event.heure_fin || undefined,
      pricing: event.pricing || event.tarif || undefined,
      organizer: event.organizer || event.organisateur || undefined,
      email: event.email || undefined,
      phone: event.phone || event.telephone || undefined,
      website: event.website || event.site_web || undefined,
      latitude: event.latitude || undefined,
      longitude: event.longitude || undefined,
      coverImage: getImageUrl(
        (event.coverImage || event.image_principale) as string | undefined
      ),
      images: Array.isArray(event.images) ? event.images.map(getImageUrl).filter((url): url is string => Boolean(url)) : [],
      featured: event.featured || event.en_avant || false,
      accessible: event.accessible || false,
      published: event.published !== false,
    };

    if (DRY_RUN) {
      console.log("[DRY RUN] Would create event:", eventData.title);
    } else {
      await prisma.event.create({ data: eventData });
      createdCount++;
    }
  }

  console.log(`${createdCount} events migrated.`);
};

const migrateNews = async () => {
  console.log("Fetching news from Directus...");
  let articles = await fetchDirectusData<DirectusNews>("actualites");

  if (articles.length === 0) {
    articles = await fetchDirectusData<DirectusNews>("news");
  }

  console.log(`Found ${articles.length} news articles`);

  let createdCount = 0;

  for (const article of articles) {
    const title = article.title || article.titre;
    if (!title) continue;

    const newsData = {
      title,
      slug: slugify(title),
      excerpt: article.excerpt || article.resume || undefined,
      content: article.content || article.contenu || "",
      coverImage: getImageUrl(
        (article.coverImage || article.image_principale) as string | undefined
      ),
      published: article.published !== false,
      publishedAt: new Date(
        article.publishedAt || article.published_at || article.date_publication || new Date()
      ),
    };

    if (DRY_RUN) {
      console.log("[DRY RUN] Would create news:", newsData.title);
    } else {
      await prisma.news.create({ data: newsData });
      createdCount++;
    }
  }

  console.log(`${createdCount} news articles migrated.`);
};

const migratePartners = async () => {
  console.log("Fetching partners from Directus...");
  let partners = await fetchDirectusData<DirectusPartner>("partenaires");

  if (partners.length === 0) {
    partners = await fetchDirectusData<DirectusPartner>("partners");
  }

  console.log(`Found ${partners.length} partners`);

  let createdCount = 0;

  for (const partner of partners) {
    const name = partner.name || partner.nom;
    if (!name) continue;

    const partnerData = {
      name,
      logo: getImageUrl((partner.logo) as string | undefined),
      website: partner.website || partner.site_web || undefined,
      order: partner.order || partner.ordre || 0,
    };

    if (DRY_RUN) {
      console.log("[DRY RUN] Would create partner:", partnerData.name);
    } else {
      await prisma.partner.create({ data: partnerData });
      createdCount++;
    }
  }

  console.log(`${createdCount} partners migrated.`);
};

const migratePages = async () => {
  console.log("Fetching pages from Directus...");
  const pages = await fetchDirectusData<DirectusPage>("pages");

  console.log(`Found ${pages.length} pages`);

  let createdCount = 0;

  for (const page of pages) {
    const title = page.title || page.titre;
    if (!title) continue;

    const pageData = {
      title,
      slug: page.slug || slugify(title),
      content: page.content || page.contenu || "",
    };

    if (DRY_RUN) {
      console.log("[DRY RUN] Would create page:", pageData.title);
    } else {
      await prisma.page.create({ data: pageData });
      createdCount++;
    }
  }

  console.log(`${createdCount} pages migrated.`);
};

const main = async () => {
  if (DRY_RUN) {
    console.log("=== DRY RUN MODE ===\n");
  }

  console.log("Starting Directus migration...\n");

  if (!DIRECTUS_TOKEN) {
    console.warn("Warning: DIRECTUS_TOKEN not set. API calls may fail.");
  }

  console.log(`Directus URL: ${DIRECTUS_URL}\n`);

  await clearDatabase();
  await migrateEvents();
  await migrateNews();
  await migratePartners();
  await migratePages();

  console.log("\nMigration complete.");
};

main()
  .catch((e) => {
    console.error("Migration failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
