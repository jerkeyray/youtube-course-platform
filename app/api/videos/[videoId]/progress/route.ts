import { auth } from "@/lib/auth-compat";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { format, startOfDay } from "date-fns";
import { z } from "zod";

export async function POST(
  req: Request,
  { params }: { params: { videoId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { completed } = await req.json();

    // Update video progress
    const progress = await prisma.videoProgress.upsert({
      where: {
        userId_videoId: { userId, videoId: params.videoId },
      },
      update: { completed },
      create: { userId, videoId: params.videoId, completed },
    });

    // If video is completed, record activity for today and check course completion
    if (completed) {
      const today = format(startOfDay(new Date()), "yyyy-MM-dd");

      // Check if activity already exists for today
      const existingActivity = await prisma.userActivity.findUnique({
        where: {
          userId_date: { userId, date: today },
        },
      });

      // Create new activity if none exists
      if (!existingActivity) {
        await prisma.userActivity.create({
          data: {
            userId,
            date: today,
            completed: true,
          },
        });
      }

      // Check if course is completed and create certificate if needed
      await checkAndCreateCertificate(userId, params.videoId);
    }

    return NextResponse.json(progress);
  } catch (error) {
    // console.error("Error updating video progress:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation Error", errors: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update video progress" },
      { status: 500 }
    );
  }
}

async function checkAndCreateCertificate(userId: string, videoId: string) {
  try {
    // Get the video and its course
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      include: {
        course: {
          include: {
            videos: {
              include: {
                progress: {
                  where: { userId },
                },
              },
            },
          },
        },
      },
    });

    if (!video || !video.course) {
      return;
    }

    const course = video.course;
    const totalVideos = course.videos.length;
    const completedVideos = course.videos.filter((v) =>
      v.progress.some((p) => p.completed)
    ).length;

    // Check if all videos are completed
    if (totalVideos > 0 && completedVideos === totalVideos) {
      // Check if certificate already exists
      const existingCertificate = await prisma.certificate.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId: course.id,
          },
        },
      });

      // Create certificate if it doesn't exist
      if (!existingCertificate) {
        await prisma.certificate.create({
          data: {
            userId,
            courseId: course.id,
          },
        });
      }
    }
  } catch (error) {
    console.error("Error checking course completion:", error);
  }
}
