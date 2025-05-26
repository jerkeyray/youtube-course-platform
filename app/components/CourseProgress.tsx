import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Course, Video, VideoProgress } from "@prisma/client";

interface CourseProgressProps {
  course: Course & {
    videos: (Video & {
      progress: VideoProgress[];
    })[];
  };
}

export function CourseProgress({ course }: CourseProgressProps) {
  const totalVideos = course.videos.length;
  const completedVideos = course.videos.filter((video) =>
    video.progress.some((p) => p.completed)
  ).length;
  const progress = totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <Link
            href={`/dashboard/courses/${course.id}`}
            className="hover:underline"
          >
            {course.title}
          </Link>
          <span className="text-sm text-muted-foreground">
            {completedVideos}/{totalVideos} videos
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Progress value={progress} className="h-2" />
        <p className="mt-2 text-sm text-muted-foreground">
          {Math.round(progress)}% complete
        </p>
      </CardContent>
    </Card>
  );
}
