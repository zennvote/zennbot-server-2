/*
  Warnings:

  - You are about to drop the column `consumedAt` on the `Song` table. All the data in the column will be lost.
  - You are about to drop the column `displayOrder` on the `Song` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Song" DROP COLUMN "consumedAt",
DROP COLUMN "displayOrder";
