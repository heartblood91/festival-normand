-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'EDITOR');

-- AlterTable: auth_users — role + 2FA
ALTER TABLE "auth_users"
  ADD COLUMN "role" "Role" NOT NULL DEFAULT 'EDITOR',
  ADD COLUMN "two_factor_secret" TEXT,
  ADD COLUMN "two_factor_backup_codes" TEXT,
  ADD COLUMN "two_factor_enabled" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable: news — unpublished_at + make published_at nullable (was NOT NULL in init)
ALTER TABLE "news" ADD COLUMN IF NOT EXISTS "unpublished_at" TIMESTAMP(3);
ALTER TABLE "news" ALTER COLUMN "published_at" DROP NOT NULL;
ALTER TABLE "news" ALTER COLUMN "published_at" DROP DEFAULT;
ALTER TABLE "news" ALTER COLUMN "published" SET DEFAULT false;

-- AlterTable: events — same treatment for consistency (init had NOT NULL published_at)
ALTER TABLE "events" ALTER COLUMN "published_at" DROP NOT NULL;
