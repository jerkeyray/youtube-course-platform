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
              <span className="flex items-center text-sm font-medium dark:text-blue-200">
                <CheckCircle className="mr-1 h-4 w-4 text-green-500 dark:text-green-400" />
                Progress
              </span>
              <span className="text-sm font-medium dark:text-blue-200">
                {completionPercentage}%
              </span>
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
            >
              <Link href={`/dashboard/courses/${course.id}`}>
                View Course
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
