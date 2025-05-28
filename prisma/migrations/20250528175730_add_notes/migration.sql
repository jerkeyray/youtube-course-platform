-- DropForeignKey
ALTER TABLE "Note" DROP CONSTRAINT "Note_courseId_fkey";

-- DropForeignKey
ALTER TABLE "Note" DROP CONSTRAINT "Note_videoId_fkey";

-- DropIndex
DROP INDEX "Note_userId_videoId_key";

-- AlterTable
ALTER TABLE "Note" ALTER COLUMN "videoId" DROP NOT NULL,
ALTER COLUMN "courseId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;
