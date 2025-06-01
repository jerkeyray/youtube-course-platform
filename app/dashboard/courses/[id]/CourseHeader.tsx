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
    <div className="mb-6">
      <div className="mb-4">
        <h1 className="text-3xl font-bold mb-2 text-white">{course.title}</h1>

        {/* Subtle Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{course.videos.length} videos</span>
          <span>•</span>
          <span>{completedVideos} completed</span>
          <span>•</span>
          <span>{completionPercentage}% progress</span>
        </div>
      </div>
    </div>
  );
}
