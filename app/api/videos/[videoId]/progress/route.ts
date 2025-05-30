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

    // If video is completed, record activity for today
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
