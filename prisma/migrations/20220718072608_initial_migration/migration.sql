-- CreateTable
CREATE TABLE "attendance" (
    "id" SERIAL NOT NULL,
    "twitchId" VARCHAR NOT NULL,
    "attendedAt" TIMESTAMP(6) NOT NULL,
    "tier" INTEGER NOT NULL,

    CONSTRAINT "attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manager" (
    "id" SERIAL NOT NULL,
    "twitchId" VARCHAR NOT NULL,

    CONSTRAINT "manager_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "setting" (
    "key" VARCHAR NOT NULL,
    "type" VARCHAR NOT NULL,
    "flagValue" BOOLEAN,

    CONSTRAINT "setting_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR NOT NULL,
    "password" VARCHAR NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IDX_88afafaccbb967eda0db4d9bd4" ON "attendance"("twitchId", "attendedAt");

-- CreateIndex
CREATE UNIQUE INDEX "manager_twitchId_key" ON "manager"("twitchId");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");
