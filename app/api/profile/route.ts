import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Define a type for the activity objects used in streak calculations
interface Activity {
  id: string;
  userId: string;
  date: string; // Assuming date is stored as an ISO string e.g., "YYYY-MM-DD"
  completed: boolean;
  createdAt: Date; // Or string if it's serialized before reaching here
  updatedAt: Date; // Or string
}

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

    // Assuming user.activities matches the Activity[] type or can be cast
    const activitiesForStreak: Activity[] = user.activities as Activity[];

    // Calculate stats
    const currentStreak = calculateCurrentStreak(activitiesForStreak);
    const longestStreak = calculateLongestStreak(activitiesForStreak);
    const coursesCompleted = user.certificates.length;
    const totalWatchTime = calculateTotalWatchTime(activitiesForStreak);

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
        createdAt: user.createdAt.toISOString(),
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
    // console.error("Error fetching profile data:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile data" },
      { status: 500 }
    );
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
    // console.error("Error updating profile:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

function calculateCurrentStreak(activities: Activity[]) {
  let currentStreak = 0;
  if (!activities || activities.length === 0) return 0;

  const today = new Date().toISOString().split("T")[0];
  const sortedActivities = activities
    .filter((a) => a.completed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (sortedActivities.length === 0) return 0;

  const lastActivityDateStr = sortedActivities[0].date.split("T")[0];
  const yesterday = getPreviousDay(today);

  if (lastActivityDateStr !== today && lastActivityDateStr !== yesterday) {
    return 0;
  }

  let currentDate = lastActivityDateStr;
  for (const activity of sortedActivities) {
    const activityDateStr = activity.date.split("T")[0];
    if (activityDateStr === currentDate) {
      currentStreak++;
      currentDate = getPreviousDay(currentDate);
    } else if (currentDate === activityDateStr) {
      // This handles multiple activities on the same day already counted
      continue;
    } else {
      break; // Streak broken
    }
  }
  return currentStreak;
}

function calculateLongestStreak(activities: Activity[]) {
  let longestStreak = 0;
  let currentStreak = 0;
  if (!activities || activities.length === 0) return 0;

  const sortedCompletedActivities = activities
    .filter((a) => a.completed)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (sortedCompletedActivities.length === 0) return 0;

  let lastActivityDate = new Date(
    sortedCompletedActivities[0].date.split("T")[0]
  );
  currentStreak = 1;
  longestStreak = 1;

  for (let i = 1; i < sortedCompletedActivities.length; i++) {
    const currentActivityDate = new Date(
      sortedCompletedActivities[i].date.split("T")[0]
    );
    const expectedPreviousDate = new Date(currentActivityDate);
    expectedPreviousDate.setDate(expectedPreviousDate.getDate() - 1);

    if (currentActivityDate.getTime() === lastActivityDate.getTime()) {
      // Same day, streak continues (if not already counted)
      // This logic might need refinement if multiple distinct activities on the same day don't extend the streak count itself
      continue;
    } else if (lastActivityDate.getTime() === expectedPreviousDate.getTime()) {
      currentStreak++;
    } else {
      currentStreak = 1; // Streak broken
    }
    lastActivityDate = currentActivityDate;
    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }
  }
  return longestStreak;
}

function calculateTotalWatchTime(activities: Activity[]) {
  if (!activities) return 0;
  return activities.filter((a) => a.completed).length * 30; // Assuming 30 mins per completed activity
}

function getPreviousDay(date: string) {
  const d = new Date(date);
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}
