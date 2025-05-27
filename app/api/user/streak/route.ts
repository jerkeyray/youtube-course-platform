import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { format, subDays, isSameDay } from "date-fns";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get all activities for the last year
    const activities = await prisma.userActivity.findMany({
      where: {
        userId,
        completed: true,
      },
      orderBy: {
        date: "desc",
      },
      take: 365,
    });

    // Calculate streak
    let streakCount = 0;
    const today = new Date();
    const yesterday = subDays(today, 1);

    // Check if user has activity today or yesterday
    const hasActivityToday = activities.some((activity) =>
      isSameDay(new Date(activity.date), today)
    );
    const hasActivityYesterday = activities.some((activity) =>
      isSameDay(new Date(activity.date), yesterday)
    );

    if (!hasActivityToday && !hasActivityYesterday) {
      return NextResponse.json({ streakCount: 0 });
    }

    // Start counting streak from the most recent activity
    let currentDate = hasActivityToday ? today : yesterday;
    streakCount = 1;

    // Count consecutive days
    for (let i = 1; i < activities.length; i++) {
      const prevDate = subDays(currentDate, 1);
      const hasActivity = activities.some((activity) =>
        isSameDay(new Date(activity.date), prevDate)
      );

      if (hasActivity) {
        streakCount++;
        currentDate = prevDate;
      } else {
        break;
      }
    }

    return NextResponse.json({ streakCount });
  } catch (error) {
    console.error("[STREAK_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
