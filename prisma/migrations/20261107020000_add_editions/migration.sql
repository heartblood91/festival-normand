-- CreateTable
CREATE TABLE "editions" (
    "year" INTEGER NOT NULL,
    "date_start" DATE NOT NULL,
    "date_end" DATE NOT NULL,
    "bilan_from" DATE,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "editions_pkey" PRIMARY KEY ("year")
);

