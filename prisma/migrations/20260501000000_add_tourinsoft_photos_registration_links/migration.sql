-- Idempotent: some environments already received these objects via `prisma db push`.

-- AlterTable
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "tourinsoft_categories" TEXT,
ADD COLUMN IF NOT EXISTS "tourinsoft_id" TEXT,
ADD COLUMN IF NOT EXISTS "tourinsoft_updated_at" TIMESTAMP(3),
ALTER COLUMN "published" SET DEFAULT false;

-- CreateTable
CREATE TABLE IF NOT EXISTS "photos" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "credit" TEXT,
    "title" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "event_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "registration_links" (
    "id" TEXT NOT NULL,
    "department" "Department" NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "registration_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "photos_event_id_idx" ON "photos"("event_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "registration_links_department_key" ON "registration_links"("department");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "events_tourinsoft_id_key" ON "events"("tourinsoft_id");

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'photos_event_id_fkey') THEN
    ALTER TABLE "photos" ADD CONSTRAINT "photos_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
