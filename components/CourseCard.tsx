"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DeleteCourseDialog } from "./DeleteCourseDialog";

export interface SerializedCourse {
  id: string;
  title: string;
  playlistId: string;
  userId: string;
  deadline: string | null;
  createdAt: string;
  updatedAt: string;
  totalVideos: number;
  completedVideos: number;
  completionPercentage: number;
  nextVideoId: string | null;
}

interface CourseCardProps {
  course: SerializedCourse;
  isPrimary?: boolean;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, isPrimary }) => {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const completionPercentage = course.completionPercentage;

  const isCompleted = completionPercentage === 100;
  const isStarted = completionPercentage > 0;
  const isInProgress = isStarted && !isCompleted;
  const nextVideoId = course.nextVideoId;

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
            {course.totalVideos} videos
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
              disabled={!nextVideoId}
            >
              <Link
                href={
                  nextVideoId
                    ? `/home/courses/${course.id}?videoId=${nextVideoId}`
                    : `/home/courses/${course.id}`
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
