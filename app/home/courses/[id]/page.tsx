import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import CoursePlayer from "./CoursePlayer";
import type {
  Chapter,
  ChapterProgress,
  Course,
  Video,
  VideoProgress,
} from "@prisma/client";
import CourseSidebar from "./CourseSidebar";
import ChaptersSidebar from "./ChaptersSidebar";

type CourseWithProgress = Course & {
  videos: (Video & {
    progress: VideoProgress[];
    chapters: (Chapter & { progress: ChapterProgress[] })[];
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
          chapters: {
            orderBy: { order: "asc" },
            include: {
              progress: {
                where: { userId: session.user.id },
              },
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

  const isSingleVideoChapterCourse =
    course.videos.length === 1 && course.videos[0].chapters.length > 0;

  const completionPercentage = (() => {
    if (isSingleVideoChapterCourse) {
      const chapters = course.videos[0].chapters;
      const total = chapters.length;
      const completed = chapters.filter((ch) =>
        ch.progress.some((p) => p.completed)
      ).length;
      return total > 0 ? Math.round((completed / total) * 100) : 0;
    }

    const totalVideos = course.videos.length;
    const completedVideos = course.videos.filter((video) =>
      video.progress.some((p) => p.completed)
    ).length;
    return totalVideos > 0
      ? Math.round((completedVideos / totalVideos) * 100)
      : 0;
  })();

  const courseWithProgress: CourseWithProgress = {
    ...course,
    completionPercentage,
  };

  // Keep a local boolean for rendering branches.
  // (CoursePlayer also detects this based on fetched chapters.)
  const renderAsChapterCourse =
    courseWithProgress.videos.length === 1 &&
    courseWithProgress.videos[0].chapters.length > 0;

  return (
    <div className="min-h-screen lg:h-screen bg-black text-white lg:overflow-hidden">
      <div className="bg-black h-full">
        <main className="container h-full min-h-0 pt-16 lg:pt-6 pb-6 px-4 lg:px-6">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:h-full min-h-0">
            {/* Course Player - spans 8 columns */}
            <div className="lg:col-span-8 lg:h-full min-h-0 lg:overflow-y-auto">
              <CoursePlayer
                course={courseWithProgress}
                initialVideoIndex={initialVideoIndex}
                initialTimestamp={t ? parseInt(t) : undefined}
              />
            </div>

            {/* Sidebar - spans 4 columns */}
            <div
              className="lg:col-span-4 lg:h-full min-h-0 lg:overflow-y-auto"
              data-course-video-list-panel
            >
              {renderAsChapterCourse ? (
                <div className="hidden lg:block">
                  <ChaptersSidebar
                    chapters={courseWithProgress.videos[0].chapters}
                    currentChapterIndex={0}
                  />
                </div>
              ) : (
                <CourseSidebar
                  course={courseWithProgress}
                  currentVideoIndex={initialVideoIndex}
                  watchedVideos={courseWithProgress.videos
                    .filter((video) => video.progress.some((p) => p.completed))
                    .map((video) => video.id)}
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
