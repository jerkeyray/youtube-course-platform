import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { startOfDay } from "date-fns";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get activities
    const activities = await prisma.userActivity.findMany({
      where: {
        userId,
      },
      orderBy: {
        date: "desc",
      },
      take: 365, // Get last year of activity
    });

    // Get total watch time from video progress
    const videoProgress = await prisma.videoProgress.findMany({
      where: {
        userId,
        completed: true,
      },
      include: {
        video: true,
      },
    });

    // Calculate total watch time (assuming each video is 1 hour for now)
    const totalWatchTime = videoProgress.length;

    return NextResponse.json({
      activities,
      totalWatchTime,
    });
  } catch (error) {
    console.error("[ACTIVITY_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const today = startOfDay(new Date()).toISOString().split("T")[0];

    // Check if activity already exists for today
    const existingActivity = await prisma.userActivity.findUnique({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
    });

    if (existingActivity) {
      return NextResponse.json(existingActivity);
    }

    // Create new activity for today
    const activity = await prisma.userActivity.create({
      data: {
        userId,
        date: today,
        completed: true,
      },
    });

    return NextResponse.json(activity);
  } catch (error) {
    console.error("[ACTIVITY_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
