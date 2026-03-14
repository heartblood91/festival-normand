import 'dotenv/config'
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const updateFestivalPage = async () => {
  const newContent = `# Le Festival Pierres en Lumières

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

Grâce à son réseau de bénévoles et de mécènes, la Fondation soutient chaque année des centaines de projets de restauration en Normandie. Elle accompagne les propriétaires de monuments historiques et de patrimoine vernaculaire dans leurs démarches de préservation.`;

  try {
    const page = await prisma.page.update({
      where: { slug: 'festival' },
      data: { content: newContent },
    });

    console.log('Festival page updated successfully.');
    console.log(`Updated page: ${page.title} (slug: ${page.slug})`);
  } catch (error) {
    console.error('Error updating festival page:', error);
    throw error;
  }
};

const main = async () => {
  console.log('Starting festival page update...');
  await updateFestivalPage();
  console.log('Update complete.');
};

main()
  .catch((e) => {
    console.error('Update failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
