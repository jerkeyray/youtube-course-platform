import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth-compat";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { videoId, completed } = await req.json();

    // Verify the course belongs to the user
    const course = await prisma.course.findUnique({
      where: {
        id: params.id,
        userId,
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Verify video belongs to the course and user has access
    const video = await prisma.video.findFirst({
      where: {
        id: videoId,
        courseId: params.id,
        course: {
          userId,
        },
      },
    });

    if (!video) {
      return NextResponse.json(
        { error: "Video not found or access denied" },
        { status: 404 }
      );
    }

    // Create or update the progress
    const progress = await prisma.videoProgress.upsert({
      where: {
        userId_videoId: {
          userId,
          videoId,
        },
      },
      update: {
        completed: completed,
      },
      create: {
        userId,
        videoId,
        completed: completed,
      },
    });

    return NextResponse.json(progress);
  } catch (error) {
    // console.error("Error updating progress:", error);
    return NextResponse.json(
      { error: "Failed to update progress" },
      { status: 500 }
    );
  }
}
