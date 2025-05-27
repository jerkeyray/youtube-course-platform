// components/CoursePlayer.tsx
"use client";

import { useState, useCallback } from "react";
import { Course, Video, VideoProgress } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Play,
  Bookmark,
} from "lucide-react";
import { toast } from "sonner";

type CourseWithProgress = Course & {
  videos: (Video & {
    progress: VideoProgress[];
  })[];
  completionPercentage: number;
};

interface CoursePlayerProps {
  course: CourseWithProgress;
}

export default function CoursePlayer({ course }: CoursePlayerProps) {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [watchedVideos, setWatchedVideos] = useState<Set<string>>(
    new Set(
      course.videos
        .filter((video) => video.progress.some((p) => p.completed))
        .map((video) => video.id)
    )
  );
  const [watchLaterVideos, setWatchLaterVideos] = useState<Set<string>>(
    new Set()
  );
  const [bookmarkedVideos, setBookmarkedVideos] = useState<Set<string>>(
    new Set()
  );

  const handleVideoProgress = useCallback(
    async (videoId: string) => {
      try {
        const isCompleted = watchedVideos.has(videoId);
        const response = await fetch(`/api/videos/${videoId}/progress`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            completed: !isCompleted,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update video progress");
        }

        setWatchedVideos((prev) => {
          const newSet = new Set(prev);
          if (isCompleted) {
            newSet.delete(videoId);
            toast.success("Video marked as not completed");
          } else {
            newSet.add(videoId);
            toast.success("Video marked as completed");
          }
          return newSet;
        });
      } catch (error) {
        console.error("Error updating video progress:", error);
        toast.error("Failed to update video progress");
      }
    },
    [watchedVideos]
  );

  const handleWatchLater = useCallback(
    async (videoId: string) => {
      try {
        const isWatchLater = watchLaterVideos.has(videoId);
        const response = await fetch(`/api/videos/${videoId}/watch-later`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            watchLater: !isWatchLater,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update watch later status");
        }

        setWatchLaterVideos((prev) => {
          const newSet = new Set(prev);
          if (isWatchLater) {
            newSet.delete(videoId);
            toast.success("Removed from watch later");
          } else {
            newSet.add(videoId);
            toast.success("Added to watch later");
          }
          return newSet;
        });
      } catch (error) {
        console.error("Error updating watch later status:", error);
        toast.error("Failed to update watch later status");
      }
    },
    [watchLaterVideos]
  );

  const handleBookmark = useCallback(
    async (videoId: string) => {
      try {
        const isBookmarked = bookmarkedVideos.has(videoId);
        const response = await fetch("/api/bookmarks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            videoId,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update bookmark status");
        }

        setBookmarkedVideos((prev) => {
          const newSet = new Set(prev);
          if (isBookmarked) {
            newSet.delete(videoId);
            toast.success("Removed from bookmarks");
          } else {
            newSet.add(videoId);
            toast.success("Added to bookmarks");
          }
          return newSet;
        });
      } catch (error) {
        console.error("Error updating bookmark status:", error);
        toast.error("Failed to update bookmark status");
      }
    },
    [bookmarkedVideos]
  );

  const handlePreviousVideo = useCallback(() => {
    setCurrentVideoIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const handleNextVideo = useCallback(() => {
    setCurrentVideoIndex((prev) =>
      prev < course.videos.length - 1 ? prev + 1 : prev
    );
  }, [course.videos.length]);

  const currentVideo = course.videos[currentVideoIndex];

  if (!course.videos.length) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">
          No videos available in this course.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Video Player Section */}
      <div className="lg:col-span-8">
        <div className="space-y-4">
          {/* Video Player */}
          <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
            <iframe
              src={`https://www.youtube.com/embed/${currentVideo.videoId}`}
              className="h-full w-full"
              allowFullScreen
            />
          </div>

          {/* Video Info and Controls */}
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold">{currentVideo.title}</h2>
                <p className="text-muted-foreground">
                  Video {currentVideoIndex + 1} of {course.videos.length}
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={() => handleVideoProgress(currentVideo.id)}
                  variant={
                    watchedVideos.has(currentVideo.id) ? "default" : "outline"
                  }
                  className="flex items-center gap-2"
                >
                  <Check className="h-4 w-4" />
                  {watchedVideos.has(currentVideo.id)
                    ? "Completed"
                    : "Mark as Completed"}
                </Button>

                <Button
                  onClick={() => handleWatchLater(currentVideo.id)}
                  variant={
                    watchLaterVideos.has(currentVideo.id)
                      ? "default"
                      : "outline"
                  }
                  className="flex items-center gap-2"
                >
                  <Clock className="h-4 w-4" />
                  {watchLaterVideos.has(currentVideo.id)
                    ? "Watch Later"
                    : "Save for Later"}
                </Button>

                <Button
                  onClick={() => handleBookmark(currentVideo.id)}
                  variant={
                    bookmarkedVideos.has(currentVideo.id)
                      ? "default"
                      : "outline"
                  }
                  className="flex items-center gap-2"
                >
                  <Bookmark className="h-4 w-4" />
                  {bookmarkedVideos.has(currentVideo.id)
                    ? "Bookmarked"
                    : "Bookmark"}
                </Button>

                <div className="flex gap-2">
                  <Button
                    onClick={handlePreviousVideo}
                    disabled={currentVideoIndex === 0}
                    variant="outline"
                    size="icon"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={handleNextVideo}
                    disabled={currentVideoIndex === course.videos.length - 1}
                    variant="outline"
                    size="icon"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Course Content Sidebar */}
      <div className="lg:col-span-4">
        <Card className="sticky top-4">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Course Content</h3>
              <div className="text-sm text-muted-foreground">
                {watchedVideos.size}/{course.videos.length} completed
              </div>
            </div>
            <div className="space-y-1 max-h-[calc(100vh-12rem)] overflow-y-auto">
              {course.videos.map((video, index) => (
                <div
                  key={video.id}
                  className={`group relative rounded-lg border p-3 cursor-pointer transition-all hover:bg-muted/50 ${
                    currentVideoIndex === index
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  }`}
                  onClick={() => setCurrentVideoIndex(index)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {watchedVideos.has(video.id) ? (
                        <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      ) : currentVideoIndex === index ? (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <Play className="h-3 w-3 text-white ml-0.5" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center text-sm font-medium text-muted-foreground">
                          {index + 1}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium leading-tight line-clamp-2 mb-1">
                        {video.title}
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          Video {index + 1}
                        </span>
                        {watchLaterVideos.has(video.id) && (
                          <div className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium border border-gray-200">
                            <Clock className="h-2 w-2 mr-1" />
                            Later
                          </div>
                        )}
                        {bookmarkedVideos.has(video.id) && (
                          <div className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium border border-gray-200">
                            <Bookmark className="h-2 w-2 mr-1" />
                            Bookmarked
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
