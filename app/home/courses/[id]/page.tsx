import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import CoursePlayer from "./CoursePlayer";
import type { Course, Video, VideoProgress } from "@prisma/client";
import CourseSidebar from "./CourseSidebar";

type CourseWithProgress = Course & {
  videos: (Video & {
    progress: VideoProgress[];
  })[];
  completionPercentage: number;
};

interface CoursePageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    videoId?: string;
    t?: string;
  }>;
}

export default async function CoursePage({
  params,
  searchParams,
}: CoursePageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    return redirect("/");
  }

  const { id: courseId } = await params;
  const { videoId, t } = await searchParams;

  const course = await db.course.findUnique({
    where: {
      id: courseId,
      userId: session.user.id,
    },
    include: {
      videos: {
        orderBy: {
          order: "asc",
        },
        include: {
          progress: {
            where: {
              userId: session.user.id,
            },
          },
        },
      },
    },
  });

  if (!course) {
    return redirect("/");
  }

  // Find the initial video index if videoId is provided
  let initialVideoIndex = 0;
  if (videoId) {
    const videoIndex = course.videos.findIndex((video) => video.id === videoId);
    if (videoIndex !== -1) {
      initialVideoIndex = videoIndex;
    }
  }

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
    <div className="min-h-screen lg:h-screen bg-black text-white lg:overflow-hidden">
      <div className="bg-black h-full">
        <main className="container h-full pt-16 lg:pt-6 pb-6 px-4 lg:px-6">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:h-full">
            {/* Course Player - spans 8 columns */}
            <div className="lg:col-span-8 lg:h-full">
              <CoursePlayer
                course={courseWithProgress}
                initialVideoIndex={initialVideoIndex}
                initialTimestamp={t ? parseInt(t) : undefined}
              />
            </div>

            {/* Sidebar - spans 4 columns */}
            <div className="lg:col-span-4 lg:h-full">
              <CourseSidebar
                course={courseWithProgress}
                currentVideoIndex={initialVideoIndex}
                watchedVideos={courseWithProgress.videos
                  .filter((video) => video.progress.some((p) => p.completed))
                  .map((video) => video.id)}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
