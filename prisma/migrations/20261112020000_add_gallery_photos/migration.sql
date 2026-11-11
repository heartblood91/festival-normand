-- CreateTable
CREATE TABLE "gallery_photos" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt_fr" TEXT NOT NULL DEFAULT '',
    "alt_en" TEXT,
    "credit" TEXT,
    "year" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gallery_photos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "gallery_photos_year_order_idx" ON "gallery_photos"("year", "order");
