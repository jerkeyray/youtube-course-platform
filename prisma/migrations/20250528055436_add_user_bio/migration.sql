/*
  Warnings:

  - You are about to drop the column `note` on the `Bookmark` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Bookmark" DROP COLUMN "note";

-- AlterTable
ALTER TABLE "UserActivity" ALTER COLUMN "date" DROP DEFAULT,
ALTER COLUMN "date" SET DATA TYPE TEXT;
