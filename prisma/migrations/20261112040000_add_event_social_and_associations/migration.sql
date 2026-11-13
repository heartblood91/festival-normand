-- AlterTable
ALTER TABLE "events" ADD COLUMN     "social_links" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "social_links_checked_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "event_associations" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT,
    "logo" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_associations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "event_associations_event_id_order_idx" ON "event_associations"("event_id", "order");

-- AddForeignKey
ALTER TABLE "event_associations" ADD CONSTRAINT "event_associations_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

