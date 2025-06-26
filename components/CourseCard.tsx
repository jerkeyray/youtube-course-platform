"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DeleteCourseDialog } from "./DeleteCourseDialog";

interface VideoProgress {
  id: string;
  userId: string;
  videoId: string;
  completed: boolean;
  updatedAt: string;
}

interface SerializedVideo {
  id: string;
  title: string;
  videoId: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  progress: VideoProgress[];
}

interface SerializedCourse {
  id: string;
  title: string;
  playlistId: string;
  userId: string;
  deadline: string | null;
  createdAt: string;
  updatedAt: string;
  videos: SerializedVideo[];
}

interface CourseCardProps {
  course: SerializedCourse;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const completedVideos = course.videos.filter(
    (video) => video.progress?.[0]?.completed
  ).length;

  const completionPercentage = Math.round(
    (completedVideos / course.videos.length) * 100
  );

  // Find the next unwatched video
  const getNextUnwatchedVideo = () => {
    // Handle edge case: no videos in course
    if (!course.videos || course.videos.length === 0) {
      return null;
    }

    // If no videos are completed, start with the first video
    if (completedVideos === 0) {
      return course.videos[0];
    }

    // Find the last completed video index
    let lastCompletedIndex = -1;
    for (let i = course.videos.length - 1; i >= 0; i--) {
      if (course.videos[i].progress?.[0]?.completed) {
        lastCompletedIndex = i;
        break;
      }
    }

    // If all videos are completed, return the last video
    if (lastCompletedIndex === course.videos.length - 1) {
      return course.videos[course.videos.length - 1];
    }

    // Return the video after the last completed video
    return course.videos[lastCompletedIndex + 1];
  };

  const nextVideo = getNextUnwatchedVideo();

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/courses/${course.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete course");
      }

      toast.success("Course deleted successfully");
      router.refresh();
    } catch {
      toast.error("Failed to delete course");
      // console.error("Error deleting course:", error);
    }
  };

  return (
    <>
      <div className="bg-card text-card-foreground overflow-hidden rounded-lg border dark:border-blue-800 shadow-sm transition-all hover:shadow-md">
        <div className="p-6">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="truncate text-xl font-bold dark:text-blue-100">
              {course.title}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-muted-foreground mb-2">
            {course.videos.length} videos
          </p>

          {/* Progress bar and percentage */}
          <div className="mb-4">
            <div className="mb-1 flex items-center justify-between">
              {/* <span className="flex items-center text-sm font-medium dark:text-blue-200">
                <CheckCircle className="mr-1 h-4 w-4 text-green-500 dark:text-green-400" />
                Progress
              </span> */}
              {/* <span className="text-sm font-medium dark:text-blue-200">
                {completionPercentage}%
              </span> */}
            </div>
            <div className="h-2.5 w-full rounded-full bg-gray-200 dark:bg-blue-800">
              <div
                className="h-2.5 rounded-full bg-green-500 dark:bg-green-400"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="mt-4">
            <Button
              asChild
              variant="default"
              className="w-full dark:bg-blue-700 dark:hover:bg-blue-600"
              disabled={!nextVideo}
            >
              <Link
                href={
                  nextVideo
                    ? `/dashboard/courses/${course.id}?videoId=${nextVideo.id}`
                    : `/dashboard/courses/${course.id}`
                }
              >
                Continue
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <DeleteCourseDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        courseTitle={course.title}
      />
    </>
  );
};

export default CourseCard;
