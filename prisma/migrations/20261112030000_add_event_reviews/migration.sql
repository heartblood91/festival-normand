-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "event_reviews" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "author_name" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'fr',
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "ai_verdict" TEXT,
    "ai_reason" TEXT,
    "moderated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "event_reviews_event_id_status_created_at_idx" ON "event_reviews"("event_id", "status", "created_at");

-- CreateIndex
CREATE INDEX "event_reviews_status_created_at_idx" ON "event_reviews"("status", "created_at");

-- AddForeignKey
ALTER TABLE "event_reviews" ADD CONSTRAINT "event_reviews_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

