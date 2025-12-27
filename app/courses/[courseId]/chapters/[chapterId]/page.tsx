import { prisma } from "@/lib/prisma";
import { CoursePlayer } from "@/components/CoursePlayer";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ courseId: string; chapterId: string }>;
}) {
  const session = await auth();
  if (!session) {
    redirect("/api/auth/signin");
  }

  const { courseId, chapterId } = await params;

  const video = await prisma.video.findUnique({
    where: { id: chapterId },
  });

  if (!video) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <CoursePlayer
        videoId={video.videoId}
        videoDatabaseId={video.id}
        courseId={courseId}
      />
    </div>
  );
}
