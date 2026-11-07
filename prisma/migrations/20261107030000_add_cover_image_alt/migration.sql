-- AlterTable
ALTER TABLE "events" ADD COLUMN     "cover_image_alt_en" TEXT,
ADD COLUMN     "cover_image_alt_fr" TEXT;

-- AlterTable
ALTER TABLE "news" ADD COLUMN     "cover_image_alt_en" TEXT,
ADD COLUMN     "cover_image_alt_fr" TEXT;
