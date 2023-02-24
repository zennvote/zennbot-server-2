/*
  Warnings:

  - The primary key for the `Song` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `attendance` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `manager` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `user` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Song" DROP CONSTRAINT "Song_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Song_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Song_id_seq";

-- AlterTable
ALTER TABLE "attendance" DROP CONSTRAINT "attendance_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "attendance_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "attendance_id_seq";

-- AlterTable
ALTER TABLE "manager" DROP CONSTRAINT "manager_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "manager_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "manager_id_seq";

-- AlterTable
ALTER TABLE "user" DROP CONSTRAINT "user_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "user_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "user_id_seq";
