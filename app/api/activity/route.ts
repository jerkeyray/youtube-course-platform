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

    const activities = await prisma.userActivity.findMany({
      where: {
        userId,
      },
      orderBy: {
        date: "desc",
      },
      take: 365, // Get last year of activity
    });

    return NextResponse.json(activities);
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

    const today = startOfDay(new Date());

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
