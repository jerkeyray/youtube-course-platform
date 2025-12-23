"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Trash2 } from "lucide-react";
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

export interface SerializedCourse {
  id: string;
  title: string;
  playlistId: string;
  userId: string;
  deadline: string | null;
  createdAt: string;
  updatedAt: string;
  videos: SerializedVideo[];
  completionPercentage?: number;
}

interface CourseCardProps {
  course: SerializedCourse;
  isPrimary?: boolean;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, isPrimary }) => {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const completedVideos = course.videos.filter(
    (video) => video.progress?.[0]?.completed
  ).length;

  const completionPercentage =
    course.completionPercentage ??
    Math.round((completedVideos / course.videos.length) * 100);

  const isCompleted = completionPercentage === 100;
  const isStarted = completionPercentage > 0;
  const isInProgress = isStarted && !isCompleted;

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
    }
  };

  return (
    <>
      <div
        className={`bg-[#0D1016] text-white overflow-hidden rounded-xl border transition-all duration-200 ${
          isCompleted
            ? "border-white/5 shadow-sm opacity-60 hover:opacity-100"
            : isPrimary
            ? "border-blue-500/30 shadow-lg shadow-blue-900/10 hover:border-blue-500/50 hover:shadow-blue-900/20"
            : "border-white/10 shadow-lg hover:shadow-xl hover:border-white/20"
        }`}
      >
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="truncate text-xl font-medium text-white tracking-tight">
              {course.title}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              className="text-neutral-500 hover:text-white hover:bg-white/5"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-neutral-500 mb-4 font-light text-sm uppercase tracking-wide">
            {course.videos.length} videos
          </p>

          {/* Progress bar and percentage */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-neutral-400 mb-2 font-mono">
              <span>Progress</span>
              <span>{completionPercentage}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/5">
              <div
                className="h-1.5 rounded-full bg-white"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="mt-4">
            <Button
              asChild
              className="w-full bg-white text-black hover:bg-neutral-200 shadow-none hover:shadow-lg transition-all duration-200 border-0 font-medium"
              disabled={!nextVideo}
            >
              <Link
                href={
                  nextVideo
                    ? `/dashboard/courses/${course.id}?videoId=${nextVideo.id}`
                    : `/dashboard/courses/${course.id}`
                }
              >
                {isCompleted ? "Review" : isInProgress ? "Resume" : "Start"}
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
