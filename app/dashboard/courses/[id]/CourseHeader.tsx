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

  return (
    <div className="mb-3">
      <div className="mb-2">
        <h1 className="text-2xl font-bold mb-2 text-white">{course.title}</h1>

        {/* Stats with better styling */}
        <div className="flex items-center gap-6 text-sm text-gray-400">
          <span className="flex items-center gap-1">
            <span className="font-semibold text-blue-400">
              {course.videos.length}
            </span>
            <span>videos</span>
          </span>
          <span className="text-zinc-600">•</span>
          <span className="flex items-center gap-1">
            <span className="font-semibold text-blue-400">
              {completedVideos}
            </span>
            <span>completed</span>
          </span>
          <span className="text-zinc-600">•</span>
          <span className="flex items-center gap-1">
            <span className="font-semibold text-blue-400">
              {completionPercentage}%
            </span>
            <span>progress</span>
          </span>
        </div>
      </div>
    </div>
  );
}
