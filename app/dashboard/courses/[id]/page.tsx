import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CoursePlayer from "./CoursePlayer";
import type { Course, Video, VideoProgress } from "@prisma/client";

type CourseWithProgress = Course & {
  videos: (Video & {
    progress: VideoProgress[];
  })[];
  completionPercentage: number;
};

export default async function CoursePage({
  params,
}: {
  params: { id: string };
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const courseId = await Promise.resolve(params.id);

  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
      userId,
    },
    include: {
      videos: {
        include: {
          progress: {
            where: { userId },
          },
        },
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  if (!course) {
    redirect("/dashboard/courses");
  }

  // Calculate completion percentage
  const totalVideos = course.videos.length;
  const completedVideos = course.videos.filter((video) =>
    video.progress.some((p) => p.completed)
  ).length;
  const completionPercentage =
    totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;

  const courseWithProgress: CourseWithProgress = {
    ...course,
    completionPercentage,
  };

  return (
    <main className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{course.videos.length} videos</span>
          <span>•</span>
          <span>{completedVideos} completed</span>
          <span>•</span>
          <span>{completionPercentage}% progress</span>
        </div>
      </div>
      <CoursePlayer course={courseWithProgress} />
    </main>
  );
}
