import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-compat";
import { prisma } from "@/lib/prisma";
import { subDays, isSameDay } from "date-fns";

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

    // Calculate current streak
    let currentStreak = 0;
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
      currentStreak = 0;
    } else {
      // Start counting streak from the most recent activity
      let currentDate = hasActivityToday ? today : yesterday;
      currentStreak = 1;

      // Count consecutive days
      for (let i = 1; i < activities.length; i++) {
        const prevDate = subDays(currentDate, 1);
        const hasActivity = activities.some((activity) =>
          isSameDay(new Date(activity.date), prevDate)
        );

        if (hasActivity) {
          currentStreak++;
          currentDate = prevDate;
        } else {
          break;
        }
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    let prevDate: Date | null = null;

    // Sort activities by date ascending for longest streak calculation
    const sortedActivities = [...activities].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    for (const activity of sortedActivities) {
      const currentDate = new Date(activity.date);

      if (prevDate) {
        const daysDiff = Math.floor(
          (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysDiff === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      } else {
        tempStreak = 1;
      }

      longestStreak = Math.max(longestStreak, tempStreak);
      prevDate = currentDate;
    }

    return NextResponse.json({
      currentStreak,
      longestStreak,
    });
  } catch (error) {
    // console.error("Error fetching user streak:", error);
    return NextResponse.json(
      { error: "Failed to fetch user streak" },
      { status: 500 }
    );
  }
}
