import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";
import { prisma } from "@/lib/prisma";

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
