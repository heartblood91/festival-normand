-- CreateTable
CREATE TABLE "department_settings" (
    "department" "Department" NOT NULL,
    "publish_from" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "department_settings_pkey" PRIMARY KEY ("department")
);

