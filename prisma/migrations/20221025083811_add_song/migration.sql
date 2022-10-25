-- CreateTable
CREATE TABLE "Viewer" (
    "id" SERIAL NOT NULL,
    "twitchId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "accountId" INTEGER NOT NULL,

    CONSTRAINT "Viewer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Song" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "requestorId" INTEGER NOT NULL,
    "requestType" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL,

    CONSTRAINT "Song_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Viewer_twitchId_key" ON "Viewer"("twitchId");

-- CreateIndex
CREATE UNIQUE INDEX "Viewer_username_key" ON "Viewer"("username");

-- AddForeignKey
ALTER TABLE "Song" ADD CONSTRAINT "Song_requestorId_fkey" FOREIGN KEY ("requestorId") REFERENCES "Viewer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
