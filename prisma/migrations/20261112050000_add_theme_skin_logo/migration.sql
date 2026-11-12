-- AlterTable
ALTER TABLE "themes" ADD COLUMN     "skin_logo" TEXT;

-- The Millennium skin starts with the example emblem drawn for the site;
-- editors replace it with the official logo from the theme form.
UPDATE "themes" SET "skin_logo" = '/themes/millennium-emblem.svg'
WHERE "skin" = 'millennium' AND "skin_logo" IS NULL;
