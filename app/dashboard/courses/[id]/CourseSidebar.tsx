"use client";

import { useState, useEffect } from "react";
import { Course, Video, VideoProgress } from "@prisma/client";
import { Card } from "@/components/ui/card";
import { Check, Play } from "lucide-react";

type CourseWithProgress = Course & {
  videos: (Video & {
    progress: VideoProgress[];
  })[];
  completionPercentage: number;
};

interface CourseSidebarProps {
  course: CourseWithProgress;
  currentVideoIndex: number;
  watchedVideos: string[];
}

export default function CourseSidebar({
  course,
  currentVideoIndex,
  watchedVideos,
}: CourseSidebarProps) {
  const [localCurrentVideoIndex, setLocalCurrentVideoIndex] =
    useState(currentVideoIndex);
  const [localWatchedVideos, setLocalWatchedVideos] = useState<Set<string>>(
    new Set(watchedVideos)
  );

  // Update local state when props change
  useEffect(() => {
    setLocalCurrentVideoIndex(currentVideoIndex);
  }, [currentVideoIndex]);

  useEffect(() => {
    setLocalWatchedVideos(new Set(watchedVideos));
  }, [watchedVideos]);

  // Listen for progress updates
  useEffect(() => {
    const handleProgressUpdate = (event: CustomEvent) => {
      const { videoId, completed } = event.detail;
      setLocalWatchedVideos((prev) => {
        const newSet = new Set(prev);
        if (completed) {
          newSet.add(videoId);
        } else {
          newSet.delete(videoId);
        }
        return newSet;
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
  }, []);

  const handleVideoClick = (index: number) => {
    setLocalCurrentVideoIndex(index);
    // Emit event to update video player
    window.dispatchEvent(
      new CustomEvent("videoIndexChange", {
        detail: { videoIndex: index },
      })
    );
  };

  return (
    <Card className="sticky top-4 bg-zinc-900 border-zinc-800 shadow-lg h-[calc(100vh-2rem)] flex flex-col">
      <div className="p-6 flex flex-col h-full">
        <div className="flex-1 space-y-1.5 overflow-y-auto pr-2 -mr-2">
          {course.videos.map((video, index) => (
            <div
              key={video.id}
              data-video-index={index}
              className={`group relative rounded-lg border transition-all duration-200 cursor-pointer overflow-hidden min-h-20 ${
                localCurrentVideoIndex === index
                  ? "border-blue-400 bg-gradient-to-r from-blue-950/40 to-indigo-950/40 shadow-lg ring-2 ring-blue-500/30"
                  : "border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800/30"
              }`}
              onClick={() => handleVideoClick(index)}
            >
              <div className="flex items-start gap-3 p-3">
                <div className="flex-shrink-0 mt-1">
                  {localWatchedVideos.has(video.id) ? (
                    <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center shadow-sm">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  ) : localCurrentVideoIndex === index ? (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                      <Play className="h-4 w-4 text-white ml-0.5" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full border-2 border-zinc-600 bg-zinc-800 flex items-center justify-center text-xs font-semibold text-gray-400 transition-all duration-200 group-hover:border-blue-400 group-hover:bg-blue-950/30">
                      {index + 1}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h4
                    className={`text-sm font-medium leading-5 line-clamp-2 mb-1 transition-colors ${
                      localCurrentVideoIndex === index
                        ? "text-blue-100"
                        : "text-gray-100 group-hover:text-blue-300"
                    }`}
                  >
                    {video.title}
                  </h4>

                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-400">
                      Video {index + 1}
                    </span>

                    {localWatchedVideos.has(video.id) && (
                      <span className="text-xs font-medium text-blue-400">
                        • Completed
                      </span>
                    )}
                  </div>
                </div>

                {/* Play indicator for current video */}
                {localCurrentVideoIndex === index && (
                  <div className="flex-shrink-0 animate-pulse">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
