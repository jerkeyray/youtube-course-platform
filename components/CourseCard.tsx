"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Trash2 } from "lucide-react";
import { Course, Video, VideoProgress } from "@prisma/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DeleteCourseDialog } from "./DeleteCourseDialog";

interface CourseCardProps {
  course: Course & {
    videos: (Video & {
      progress?: VideoProgress[];
    })[];
    completionPercentage?: number;
  };
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const completedVideos = course.videos.filter(
    (video) => video.progress?.[0]?.completed
  ).length;
  const completionPercentage =
    course.completionPercentage ??
    Math.round((completedVideos / course.videos.length) * 100);

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
    } catch (error) {
      toast.error("Failed to delete course");
      console.error("Error deleting course:", error);
    }
  };

  return (
    <>
      <div className="bg-card text-card-foreground overflow-hidden rounded-lg border shadow-sm transition-all hover:shadow-md">
        <div className="p-6">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="truncate text-xl font-bold">{course.title}</h2>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
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
              <span className="flex items-center text-sm font-medium">
                <CheckCircle className="mr-1 h-4 w-4 text-green-500" />
                Progress
              </span>
              <span className="text-sm font-medium">
                {completionPercentage}%
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-2.5 rounded-full bg-green-500"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="mt-4">
            <Button asChild variant="default" className="w-full">
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
