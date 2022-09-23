-- CreateTable
CREATE TABLE "account" (
    "id" INTEGER NOT NULL,
    "username" TEXT NOT NULL,
    "twitchId" TEXT,
    "ticket" INTEGER NOT NULL,
    "ticketPiece" INTEGER NOT NULL,
    "prefix" TEXT,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "account_username_key" ON "account"("username");

-- CreateIndex
CREATE UNIQUE INDEX "account_twitchId_key" ON "account"("twitchId");
