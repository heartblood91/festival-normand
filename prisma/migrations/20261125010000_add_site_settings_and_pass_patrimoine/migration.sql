-- AlterTable
ALTER TABLE "events" ADD COLUMN     "pass_patrimoine_url" TEXT;

-- CreateTable
CREATE TABLE "site_settings" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("key")
);

-- The Pass Patrimoine badges and banner start switched off.
INSERT INTO "site_settings" ("key", "value", "updated_at")
VALUES ('pass-patrimoine', '{"passEnabled": false, "bannerEnabled": false}', CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO NOTHING;
