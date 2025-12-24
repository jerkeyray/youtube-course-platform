"use client";

import { useEffect, useState } from "react";
import { Course, Video, VideoProgress } from "@prisma/client";

type CourseWithProgress = Course & {
  videos: (Video & {
    progress: VideoProgress[];
  })[];
  completionPercentage: number;
};

interface CourseHeaderProps {
  course: CourseWithProgress;
  onProgressUpdate?: (
    completedVideos: number,
    completionPercentage: number
  ) => void;
}

export default function CourseHeader({
  course,
  onProgressUpdate,
}: CourseHeaderProps) {
  const [completedVideos, setCompletedVideos] = useState(() => {
    return course.videos.filter((video) =>
      video.progress.some((p) => p.completed)
    ).length;
  });

  const [completionPercentage, setCompletionPercentage] = useState(() => {
    const totalVideos = course.videos.length;
    return totalVideos > 0
      ? Math.round((completedVideos / totalVideos) * 100)
      : 0;
  });

  // Listen for progress updates from other components
  useEffect(() => {
    const handleProgressUpdate = (event: CustomEvent) => {
      const { videoId, completed } = event.detail;

      setCompletedVideos((prev) => {
        const video = course.videos.find((v) => v.id === videoId);
        if (!video) return prev;

        const wasCompleted = video.progress.some((p) => p.completed);

        if (completed && !wasCompleted) {
          return prev + 1;
        } else if (!completed && wasCompleted) {
          return prev - 1;
        }
        return prev;
      });
    };

    window.addEventListener(
      "videoProgressUpdate",
      handleProgressUpdate as EventListener
    );

    return () => {
      window.removeEventListener(
        "videoProgressUpdate",
        handleProgressUpdate as EventListener
      );
    };
  }, [course.videos]);

  // Update completion percentage when completed videos change
  useEffect(() => {
    const totalVideos = course.videos.length;
    const newPercentage =
      totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;
    setCompletionPercentage(newPercentage);

    // Notify parent if callback provided
    if (onProgressUpdate) {
      onProgressUpdate(completedVideos, newPercentage);
    }
  }, [completedVideos, course.videos.length, onProgressUpdate]);

  const totalVideos = course.videos.length;
  const showPercentage = completedVideos > 0;

  return (
    <div className="mb-6 border-b border-white/5 pb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 uppercase tracking-widest">
            <span>Course</span>
            <span>/</span>
            <span>Playing</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-white">Lesson</h1>
          <p className="text-sm text-neutral-500">{course.title}</p>
        </div>

        {/* Stats with better styling */}
        <div className="flex items-center gap-8 text-sm">
          <div className="flex flex-col items-end">
            <span className="text-lg font-medium text-white">
              {completedVideos} of {totalVideos} lessons completed
            </span>
            {showPercentage && (
              <span className="text-xs text-neutral-500 mt-0.5">{completionPercentage}%</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
