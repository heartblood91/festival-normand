-- CreateTable
CREATE TABLE "auth_two_factors" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "secret" TEXT NOT NULL,
  "backup_codes" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "auth_two_factors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "auth_two_factors_user_id_idx" ON "auth_two_factors"("user_id");
CREATE INDEX "auth_two_factors_secret_idx" ON "auth_two_factors"("secret");

-- AddForeignKey
ALTER TABLE "auth_two_factors"
  ADD CONSTRAINT "auth_two_factors_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "auth_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
