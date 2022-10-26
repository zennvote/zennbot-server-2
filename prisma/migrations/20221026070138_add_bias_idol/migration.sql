-- CreateTable
CREATE TABLE "BiasIdol" (
    "viewerId" INTEGER NOT NULL,
    "idolId" INTEGER NOT NULL,

    CONSTRAINT "BiasIdol_pkey" PRIMARY KEY ("viewerId","idolId")
);

-- AddForeignKey
ALTER TABLE "BiasIdol" ADD CONSTRAINT "BiasIdol_viewerId_fkey" FOREIGN KEY ("viewerId") REFERENCES "Viewer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
