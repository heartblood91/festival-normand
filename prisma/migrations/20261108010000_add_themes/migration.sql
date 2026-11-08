-- CreateTable
CREATE TABLE "themes" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name_fr" TEXT NOT NULL,
    "name_en" TEXT,
    "description_fr" TEXT,
    "description_en" TEXT,
    "color" TEXT NOT NULL DEFAULT '#f59e0b',
    "marker_image" TEXT,
    "show_on_home" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "themes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_event_themes" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_event_themes_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "themes_slug_key" ON "themes"("slug");

-- CreateIndex
CREATE INDEX "_event_themes_B_index" ON "_event_themes"("B");

-- AddForeignKey
ALTER TABLE "_event_themes" ADD CONSTRAINT "_event_themes_A_fkey" FOREIGN KEY ("A") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_event_themes" ADD CONSTRAINT "_event_themes_B_fkey" FOREIGN KEY ("B") REFERENCES "themes"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Seed the 2027 Millennium theme (editable in admin; marker replaceable by upload)
INSERT INTO "themes" ("id", "slug", "name_fr", "name_en", "description_fr", "description_en", "color", "marker_image", "show_on_home", "order", "updated_at")
VALUES (
    'theme_millennium',
    'millennium',
    'Millénaire de Guillaume le Conquérant',
    'William the Conqueror Millennium',
    '1027–2027 : mille ans après la naissance de Guillaume à Falaise, les lieux qui racontent son histoire s''illuminent.',
    '1027–2027: a thousand years after William''s birth in Falaise, the places that tell his story light up.',
    '#d97706',
    '/themes/millennium-marker.svg',
    true,
    0,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("slug") DO NOTHING;
