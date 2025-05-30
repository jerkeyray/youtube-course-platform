import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        courses: {
          include: {
            videos: {
              include: {
                progress: {
                  where: { userId: session.user.id },
                },
              },
            },
          },
        },
        activities: true,
        certificates: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Calculate stats
    const currentStreak = calculateCurrentStreak(user.activities);
    const longestStreak = calculateLongestStreak(user.activities);
    const coursesCompleted = user.certificates.length;
    const totalWatchTime = calculateTotalWatchTime(user.activities);

    // Get completed courses
    const completedCourses = user.courses.filter((course) => {
      const totalVideos = course.videos.length;
      const completedVideos = course.videos.filter((video) =>
        video.progress.some((p) => p.completed)
      ).length;
      return completedVideos === totalVideos && totalVideos > 0;
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        bio: user.bio,
        createdAt: user.createdAt,
      },
      stats: {
        currentStreak,
        longestStreak,
        coursesCompleted,
        totalWatchTime,
      },
      completedCourses: completedCourses.map((course) => ({
        id: course.id,
        title: course.title,
      })),
    });
  } catch (error) {
    console.error("Profile API error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { bio } = await req.json();

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { bio },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Profile update error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

function calculateCurrentStreak(activities: any[]) {
  let currentStreak = 0;
  const today = new Date().toISOString().split("T")[0];
  const sortedActivities = activities
    .sort((a, b) => b.date.localeCompare(a.date))
    .filter((a) => a.completed);

  if (sortedActivities.length === 0) return 0;

  // Check if the last activity was today or yesterday
  const lastActivity = sortedActivities[0];
  if (lastActivity.date !== today && lastActivity.date !== getYesterday()) {
    return 0;
  }

  let currentDate = lastActivity.date;
  for (const activity of sortedActivities) {
    if (activity.date === currentDate) {
      currentStreak++;
      currentDate = getPreviousDay(currentDate);
    } else {
      break;
    }
  }

  return currentStreak;
}

function calculateLongestStreak(activities: any[]) {
  let longestStreak = 0;
  let currentStreak = 0;
  const sortedActivities = activities
    .sort((a, b) => a.date.localeCompare(b.date))
    .filter((a) => a.completed);

  if (sortedActivities.length === 0) return 0;

  let currentDate = sortedActivities[0].date;
  for (const activity of sortedActivities) {
    if (activity.date === currentDate) {
      currentStreak++;
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }
    } else if (activity.date === getNextDay(currentDate)) {
      currentStreak++;
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }
      currentDate = activity.date;
    } else {
      currentStreak = 1;
      currentDate = activity.date;
    }
  }

  return longestStreak;
}

function calculateTotalWatchTime(activities: any[]) {
  // Assuming each completed activity represents 30 minutes of watch time
  return activities.filter((a) => a.completed).length * 30;
}

function getYesterday() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().split("T")[0];
}

function getPreviousDay(date: string) {
  const d = new Date(date);
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

function getNextDay(date: string) {
  const d = new Date(date);
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}
