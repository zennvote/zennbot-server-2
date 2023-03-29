-- CreateTable
CREATE TABLE "SongQueue" (
    "id" TEXT NOT NULL,
    "requestedSongs" TEXT[],
    "consumedSongs" TEXT[],
    "isRequestEnabled" BOOLEAN NOT NULL,
    "isGoldenBellEnabled" BOOLEAN NOT NULL,

    CONSTRAINT "SongQueue_pkey" PRIMARY KEY ("id")
);
