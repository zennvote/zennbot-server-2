/*
  Warnings:

  - The primary key for the `BiasIdol` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `viewerId` on the `BiasIdol` table. All the data in the column will be lost.
  - The `idolId` column on the `BiasIdol` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `Viewer` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `viewerUsername` to the `BiasIdol` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "BiasIdol" DROP CONSTRAINT "BiasIdol_viewerId_fkey";

-- DropForeignKey
ALTER TABLE "Song" DROP CONSTRAINT "Song_requestorId_fkey";

-- AlterTable
ALTER TABLE "BiasIdol" DROP CONSTRAINT "BiasIdol_pkey",
DROP COLUMN "viewerId",
ADD COLUMN     "viewerUsername" TEXT NOT NULL,
DROP COLUMN "idolId",
ADD COLUMN     "idolId" INTEGER[],
ADD CONSTRAINT "BiasIdol_pkey" PRIMARY KEY ("viewerUsername");

-- DropTable
DROP TABLE "Viewer";
