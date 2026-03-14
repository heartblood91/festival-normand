import 'dotenv/config'
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const verifyFestivalPage = async () => {
  const page = await prisma.page.findUnique({ where: { slug: 'festival' } });

  if (!page) {
    console.error('Festival page not found!');
    return;
  }

  console.log('✓ Page title:', page.title);
  console.log('✓ Content length:', page.content.length);
  console.log('✓ First 100 chars:', page.content.substring(0, 100) + '...');
  console.log('');

  const checks = [
    { name: 'Contains Calvados Directus image', test: page.content.includes('a62f7bb3-4811-4140-9fab-23bcac8ce0d4') },
    { name: 'Contains Eure Directus image', test: page.content.includes('f656191a-c2d3-4852-b431-d371ead98a42') },
    { name: 'Contains Manche Directus image', test: page.content.includes('e23a2c17-3cd1-433d-b7c5-3c8ae778f671') },
    { name: 'Contains Orne Directus image', test: page.content.includes('fe2a25b5-1c4e-450d-8a59-ae76bdbca036') },
    { name: 'Contains Seine-Maritime Directus image', test: page.content.includes('5a954400-7309-49e2-b0f1-d5994d61a362') },
    { name: 'Contains Calvados contact (pierresenlumieres@calvados.fr)', test: page.content.includes('pierresenlumieres@calvados.fr') },
    { name: 'Contains Eure contact (patrimoines@eure.fr)', test: page.content.includes('patrimoines@eure.fr') },
    { name: 'Contains Manche contact (patrimoine@manche.fr)', test: page.content.includes('patrimoine@manche.fr') },
    { name: 'Contains Orne contact (jamet.juliette@orne.fr)', test: page.content.includes('jamet.juliette@orne.fr') },
    { name: 'Contains Orne phone (02 33 81 23 00)', test: page.content.includes('02 33 81 23 00') },
    { name: 'Contains Seine-Maritime contact (patrimoine@seinemaritime.fr)', test: page.content.includes('patrimoine@seinemaritime.fr') },
    { name: 'Contains Fondation du Patrimoine link', test: page.content.includes('fondation-patrimoine.org/fondation-du-patrimoine/normandie/presentation') },
    { name: 'Contains webp format parameter', test: page.content.includes('format=webp') },
    { name: 'Contains 1600 width parameter', test: page.content.includes('width=1600') },
    { name: 'Festival origin mention (2009)', test: page.content.includes('2009') },
    { name: 'Multi-department mention (2015)', test: page.content.includes('2015') },
  ];

  console.log('Verification results:');
  let passed = 0;
  for (const check of checks) {
    const symbol = check.test ? '✓' : '✗';
    console.log(`${symbol} ${check.name}`);
    if (check.test) passed++;
  }

  console.log('');
  console.log(`Passed: ${passed}/${checks.length}`);
};

const main = async () => {
  console.log('Verifying festival page content...\n');
  await verifyFestivalPage();
};

main()
  .catch((e) => {
    console.error('Verification failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
