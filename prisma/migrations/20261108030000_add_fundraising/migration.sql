-- CreateEnum
CREATE TYPE "FundraisingSuggestionStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "fundraising_image" TEXT,
ADD COLUMN     "fundraising_title" TEXT,
ADD COLUMN     "fundraising_url" TEXT;

-- CreateTable
CREATE TABLE "fundraising_suggestions" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "project_code" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "image_url" TEXT,
    "reason" TEXT NOT NULL,
    "distance_km" DOUBLE PRECISION,
    "collected_percent" INTEGER,
    "status" "FundraisingSuggestionStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fundraising_suggestions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "fundraising_suggestions_status_idx" ON "fundraising_suggestions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "fundraising_suggestions_event_id_project_code_key" ON "fundraising_suggestions"("event_id", "project_code");

-- AddForeignKey
ALTER TABLE "fundraising_suggestions" ADD CONSTRAINT "fundraising_suggestions_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

