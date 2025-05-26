import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";
import { Course, Video, VideoProgress } from "@prisma/client";

interface CourseCardProps {
  course: Course & {
    videos: (Video & {
      progress?: VideoProgress[];
    })[];
    completionPercentage?: number;
  };
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const completedVideos = course.videos.filter(
    (video) => video.progress?.[0]?.completed
  ).length;
  const completionPercentage =
    course.completionPercentage ??
    Math.round((completedVideos / course.videos.length) * 100);

  return (
    <div className="bg-card text-card-foreground overflow-hidden rounded-lg border shadow-sm transition-all hover:shadow-md">
      <div className="p-6">
        <h2 className="mb-2 truncate text-xl font-bold">{course.title}</h2>
        <p className="text-muted-foreground mb-2">
          {course.videos.length} videos
        </p>

        {/* Progress bar and percentage */}
        <div className="mb-4">
          <div className="mb-1 flex items-center justify-between">
            <span className="flex items-center text-sm font-medium">
              <CheckCircle className="mr-1 h-4 w-4 text-green-500" />
              Progress
            </span>
            <span className="text-sm font-medium">{completionPercentage}%</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-2.5 rounded-full bg-green-500"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div>

        <div className="mt-4 flex justify-between">
          <Button asChild variant="default">
            <Link href={`/dashboard/courses/${course.id}`}>
              View
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
