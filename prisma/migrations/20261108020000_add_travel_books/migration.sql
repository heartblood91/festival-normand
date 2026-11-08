-- CreateTable
CREATE TABLE "travel_books" (
    "id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "event_ids" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "travel_books_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "travel_books_key_key" ON "travel_books"("key");

