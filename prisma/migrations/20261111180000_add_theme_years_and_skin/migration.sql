-- AlterTable
ALTER TABLE "themes" ADD COLUMN     "skin" TEXT,
ADD COLUMN     "years" INTEGER[] DEFAULT ARRAY[]::INTEGER[];

-- The Millennium theme (seeded by 20261108010000_add_themes) belongs to 2027
-- and dresses the site that year; leave it alone if an editor already set it.
UPDATE "themes" SET "years" = ARRAY[2027], "skin" = 'millennium'
WHERE "slug" = 'millennium' AND "skin" IS NULL AND "years" = ARRAY[]::INTEGER[];
