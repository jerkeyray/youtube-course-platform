import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Trophy, BookOpen, Clock } from "lucide-react";

export default async function ProfilePage() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    redirect("/sign-in");
  }

  // Fetch user's courses with progress
  const courses = await prisma.course.findMany({
    where: { userId },
    include: {
      videos: {
        include: {
          progress: {
            where: { userId },
          },
        },
      },
      certificates: true,
    },
  });

  // Calculate statistics
  const totalCourses = courses.length;
  const completedCourses = courses.filter((course) => {
    const totalVideos = course.videos.length;
    const completedVideos = course.videos.filter((video) =>
      video.progress.some((p) => p.completed)
    ).length;
    return completedVideos === totalVideos && totalVideos > 0;
  }).length;

  const totalVideos = courses.reduce(
    (acc, course) => acc + course.videos.length,
    0
  );
  const completedVideos = courses.reduce((acc, course) => {
    return (
      acc +
      course.videos.filter((video) => video.progress.some((p) => p.completed))
        .length
    );
  }, 0);

  return (
    <main className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Profile</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Card */}
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-6">
            <div className="relative h-24 w-24 overflow-hidden rounded-full">
              {user.imageUrl ? (
                <Image
                  src={user.imageUrl}
                  alt={user.fullName ?? "Profile"}
                  fill
                  className="object-cover"
                  sizes="96px"
                  quality={100}
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary text-2xl text-primary-foreground">
                  {user.fullName?.charAt(0) ?? "U"}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{user.fullName}</h2>
              <p className="text-muted-foreground">
                {user.primaryEmailAddress?.emailAddress}
              </p>
              {user.username && (
                <p className="text-muted-foreground">@{user.username}</p>
              )}
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold">Learning Statistics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-muted p-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">
                  Total Courses
                </span>
              </div>
              <p className="mt-1 text-2xl font-bold">{totalCourses}</p>
            </div>
            <div className="rounded-lg bg-muted p-4">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">Completed</span>
              </div>
              <p className="mt-1 text-2xl font-bold">{completedCourses}</p>
            </div>
            <div className="rounded-lg bg-muted p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">
                  Videos Watched
                </span>
              </div>
              <p className="mt-1 text-2xl font-bold">
                {completedVideos}/{totalVideos}
              </p>
            </div>
            <div className="rounded-lg bg-muted p-4">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">
                  Completion Rate
                </span>
              </div>
              <p className="mt-1 text-2xl font-bold">
                {totalVideos > 0
                  ? Math.round((completedVideos / totalVideos) * 100)
                  : 0}
                %
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
