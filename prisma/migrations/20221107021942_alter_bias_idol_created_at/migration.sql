-- CreateTempTable
CREATE TABLE "NewBiasIdol" (
    "viewerUsername" TEXT NOT NULL,
    "idolId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- MigrateOriginalTable
INSERT INTO "NewBiasIdol" ("viewerUsername", "idolId")
SELECT "viewerUsername", idolId
FROM (
  SELECT unnest("idolId") AS idolId, "viewerUsername"
  FROM "BiasIdol"
) as original;

-- DeleteExistingTable
DROP TABLE "BiasIdol";

-- RenameTempTable
ALTER TABLE "NewBiasIdol" RENAME TO "BiasIdol";

-- CreateIndex
CREATE UNIQUE INDEX "BiasIdol_viewerUsername_idolId_key" ON "BiasIdol"("viewerUsername", "idolId");

