import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CoursePlayer from "./CoursePlayer";
import type { Course, Video, VideoProgress } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Check, ChevronLeft, ChevronRight, Clock } from "lucide-react";

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
      <h1 className="text-3xl font-bold mb-8">{course.title}</h1>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <div className="space-y-4">
            <div className="aspect-video w-full rounded-lg border overflow-hidden bg-muted">
              {course.videos[0] ? (
                <iframe
                  src={`https://www.youtube.com/embed/${course.videos[0].videoId}`}
                  title={course.videos[0].title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                  aria-label={`Video player for ${course.videos[0].title}`}
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground">No video selected</p>
                </div>
              )}
            </div>

            <div className="flex gap-4 flex-wrap">
              <Button
                variant="default"
                className="flex-1"
                aria-label="Mark current video as completed"
              >
                <Check className="mr-2 h-4 w-4" />
                Mark as Completed
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                aria-label="Save video for later"
              >
                <Clock className="mr-2 h-4 w-4" />
                Watch Later
              </Button>
              <Button variant="outline" aria-label="Go to previous video">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              <Button variant="outline" aria-label="Go to next video">
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <div className="lg:col-span-4">
          <div className="sticky top-8">
            <CoursePlayer course={courseWithProgress} />
          </div>
        </div>
      </div>
    </main>
  );
}
