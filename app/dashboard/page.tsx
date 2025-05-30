import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";
import { prisma } from "@/lib/prisma";

interface SerializedCourse {
  id: string;
  title: string;
  playlistId: string;
  userId: string;
  deadline: string | null;
  createdAt: string;
  updatedAt: string;
  videos: Array<{
    id: string;
    title: string;
    videoId: string;
    order: number;
    createdAt: string;
    updatedAt: string;
    progress: Array<{
      id: string;
      userId: string;
      videoId: string;
      completed: boolean;
      updatedAt: string;
    }>;
  }>;
}

interface SerializedActivity {
  id: string;
  userId: string;
  date: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

async function getCourses(userId: string): Promise<SerializedCourse[]> {
  try {
    const courses = await prisma.course.findMany({
      where: {
        userId,
      },
      include: {
        videos: {
          include: {
            progress: {
              where: {
                userId,
              },
            },
          },
          orderBy: {
            order: "asc",
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return courses.map((course) => ({
      ...course,
      createdAt: course.createdAt.toISOString(),
      updatedAt: course.updatedAt.toISOString(),
      deadline: course.deadline?.toISOString() ?? null,
      videos: course.videos.map((video) => ({
        ...video,
        createdAt: video.createdAt.toISOString(),
        updatedAt: video.updatedAt.toISOString(),
        progress: video.progress.map((p) => ({
          ...p,
          updatedAt: p.updatedAt.toISOString(),
        })),
      })),
    }));
  } catch (error) {
    console.error("Error fetching courses:", error);
    return [];
  }
}

async function getActivities(userId: string): Promise<SerializedActivity[]> {
  try {
    const activities = await prisma.userActivity.findMany({
      where: {
        userId,
      },
      orderBy: {
        date: "desc",
      },
      take: 365, // Last year of activity
    });

    return activities.map((activity) => ({
      ...activity,
      createdAt: activity.createdAt.toISOString(),
      updatedAt: activity.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching activities:", error);
    return [];
  }
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }

  // Fetch user's courses and activities
  const courses = await prisma.course.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      videos: {
        include: {
          progress: {
            where: {
              userId: session.user.id,
            },
          },
        },
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  const activities = await prisma.userActivity.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      date: "desc",
    },
  });

  // Serialize the data to match the expected types
  const serializedCourses = courses.map((course) => ({
    ...course,
    deadline: course.deadline?.toISOString() || null,
    createdAt: course.createdAt.toISOString(),
    updatedAt: course.updatedAt.toISOString(),
    videos: course.videos.map((video) => ({
      ...video,
      createdAt: video.createdAt.toISOString(),
      updatedAt: video.updatedAt.toISOString(),
      progress: video.progress.map((p) => ({
        ...p,
        updatedAt: p.updatedAt.toISOString(),
      })),
    })),
  }));

  const serializedActivities = activities.map((activity) => ({
    ...activity,
    createdAt: activity.createdAt.toISOString(),
    updatedAt: activity.updatedAt.toISOString(),
  }));

  return (
    <DashboardClient
      courses={serializedCourses}
      activities={serializedActivities}
    />
  );
}
