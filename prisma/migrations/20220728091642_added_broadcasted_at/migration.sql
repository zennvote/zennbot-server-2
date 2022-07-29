/*
  Warnings:

  - Added the required column `broadcastedAt` to the `attendance` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "attendance" ADD COLUMN     "broadcastedAt" VARCHAR NOT NULL DEFAULT '';

UPDATE "attendance" SET "broadcastedAt" = to_char(
  CASE extract(hour from "attendance"."attendedAt") < 1
    WHEN true THEN "attendance"."attendedAt" - interval '1' day
    ELSE "attendance"."attendedAt"
  END,
  'YYYY-MM-DD'
) WHERE "broadcastedAt" = '';

ALTER TABLE "attendance" ALTER COLUMN "broadcastedAt" DROP DEFAULT;

CREATE INDEX "attendance_broadcastedAt_idx" ON "attendance"("broadcastedAt");