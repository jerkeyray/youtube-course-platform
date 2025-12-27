/*
  Warnings:

  - You are about to drop the column `title` on the `Note` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Note_userId_videoId_key";

-- AlterTable
ALTER TABLE "Note" DROP COLUMN "title",
ADD COLUMN     "timestampSeconds" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Note_userId_videoId_idx" ON "Note"("userId", "videoId");

-- CreateIndex
CREATE INDEX "Note_courseId_idx" ON "Note"("courseId");
