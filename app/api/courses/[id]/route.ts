// /app/api/courses/[id]/route.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const courseId = params.id;

  // Verify the course belongs to the user
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  if (course.userId !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Delete all related records first
    await prisma.$transaction(async (tx) => {
      // Get all video IDs for the course
      const courseVideos = await tx.video.findMany({
        where: { courseId },
        select: { id: true },
      });

      const videoIds = courseVideos.map((video: { id: string }) => video.id);

      if (videoIds.length > 0) {
        // Delete all video progress for these videos
        await tx.videoProgress.deleteMany({
          where: { videoId: { in: videoIds } },
        });
      }

      // Delete all videos for this course
      await tx.video.deleteMany({
        where: { courseId },
      });

      // Finally, delete the course itself
      await tx.course.delete({
        where: { id: courseId },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting course:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
