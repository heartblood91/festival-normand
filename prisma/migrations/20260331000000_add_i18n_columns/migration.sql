-- Rename existing columns to FR variants
ALTER TABLE "events" RENAME COLUMN "title" TO "title_fr";
ALTER TABLE "events" RENAME COLUMN "description" TO "description_fr";
ALTER TABLE "events" RENAME COLUMN "pricing" TO "pricing_fr";

ALTER TABLE "news" RENAME COLUMN "title" TO "title_fr";
ALTER TABLE "news" RENAME COLUMN "excerpt" TO "excerpt_fr";
ALTER TABLE "news" RENAME COLUMN "content" TO "content_fr";

ALTER TABLE "pages" RENAME COLUMN "title" TO "title_fr";
ALTER TABLE "pages" RENAME COLUMN "content" TO "content_fr";

ALTER TABLE "partners" RENAME COLUMN "name" TO "name_fr";

-- Add EN columns
ALTER TABLE "events" ADD COLUMN "title_en" TEXT;
ALTER TABLE "events" ADD COLUMN "description_en" TEXT;
ALTER TABLE "events" ADD COLUMN "pricing_en" TEXT;
ALTER TABLE "events" ADD COLUMN "published_at" TIMESTAMP(3);
ALTER TABLE "events" ADD COLUMN "unpublished_at" TIMESTAMP(3);

ALTER TABLE "news" ADD COLUMN "title_en" TEXT;
ALTER TABLE "news" ADD COLUMN "excerpt_en" TEXT;
ALTER TABLE "news" ADD COLUMN "content_en" TEXT;

ALTER TABLE "pages" ADD COLUMN "title_en" TEXT;
ALTER TABLE "pages" ADD COLUMN "content_en" TEXT;

ALTER TABLE "partners" ADD COLUMN "name_en" TEXT;
