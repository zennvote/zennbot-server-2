-- CreateTable
CREATE TABLE "ViewerChzzkMigrationRequest" (
    "id" TEXT NOT NULL,
    "twitchId" TEXT NOT NULL,
    "twitchUsername" TEXT NOT NULL,
    "chzzkId" TEXT NOT NULL,
    "chzzkUsername" TEXT NOT NULL,
    "migrated" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ViewerChzzkMigrationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ViewerChzzkMigrationRequest_twitchId_key" ON "ViewerChzzkMigrationRequest"("twitchId");

-- CreateIndex
CREATE UNIQUE INDEX "ViewerChzzkMigrationRequest_twitchUsername_key" ON "ViewerChzzkMigrationRequest"("twitchUsername");
