// components/CoursePlayer.tsx
"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { Course, Video, VideoProgress } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Play,
  Bookmark,
  Pencil,
  Save,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import LoadingScreen from "@/components/LoadingScreen";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type CourseWithProgress = Course & {
  videos: (Video & {
    progress: VideoProgress[];
  })[];
  completionPercentage: number;
};

interface CoursePlayerProps {
  course: CourseWithProgress;
  initialVideoIndex?: number;
}

export default function CoursePlayer({
  course,
  initialVideoIndex = 0,
}: CoursePlayerProps) {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(initialVideoIndex);
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
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const queryClient = useQueryClient();
  const playlistContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to current video when component loads or video index changes
  useEffect(() => {
    const scrollToCurrentVideo = () => {
      if (playlistContainerRef.current) {
        const container = playlistContainerRef.current;
        const videoElements = container.querySelectorAll("[data-video-index]");

        // Calculate which video to scroll to (one before current, or first if current is first)
        const targetIndex = Math.max(0, currentVideoIndex - 1);
        const targetVideoElement = Array.from(videoElements).find(
          (el) => el.getAttribute("data-video-index") === targetIndex.toString()
        );

        if (targetVideoElement) {
          targetVideoElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
            inline: "nearest",
          });
        }
      }
    };

    // Add a small delay to ensure DOM is fully rendered
    const timeoutId = setTimeout(scrollToCurrentVideo, 100);

    return () => clearTimeout(timeoutId);
  }, [currentVideoIndex]);

  const handleVideoProgress = useCallback(
    async (videoId: string) => {
      const isCompleted = watchedVideos.has(videoId);
      // Optimistically update UI
      setWatchedVideos((prev) => {
        const newSet = new Set(prev);
        if (isCompleted) {
          newSet.delete(videoId);
        } else {
          newSet.add(videoId);
        }
        return newSet;
      });
      try {
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

        // Emit custom event for progress update
        window.dispatchEvent(
          new CustomEvent("videoProgressUpdate", {
            detail: { videoId, completed: !isCompleted },
          })
        );

        toast.success(
          isCompleted
            ? "Video marked as not completed"
            : "Video marked as completed"
        );
      } catch {
        // Revert optimistic update
        setWatchedVideos((prev) => {
          const newSet = new Set(prev);
          if (isCompleted) {
            newSet.add(videoId);
          } else {
            newSet.delete(videoId);
          }
          return newSet;
        });
        toast.error("Failed to update video progress");
      }
    },
    [watchedVideos]
  );

  const handleWatchLater = useCallback(
    async (videoId: string) => {
      const isWatchLater = watchLaterVideos.has(videoId);
      const newWatchLaterStatus = !isWatchLater;

      // Optimistically update UI
      setWatchLaterVideos((prev) => {
        const newSet = new Set(prev);
        if (newWatchLaterStatus) {
          newSet.add(videoId);
        } else {
          newSet.delete(videoId);
        }
        return newSet;
      });

      try {
        const response = await fetch(`/api/videos/${videoId}/watch-later`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            watchLater: newWatchLaterStatus,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update watch later status");
        }

        if (newWatchLaterStatus) {
          toast.success("Added to watch later");
        } else {
          toast.success("Removed from watch later");
        }
      } catch {
        // Revert optimistic update on error
        setWatchLaterVideos((prev) => {
          const newSet = new Set(prev);
          if (newWatchLaterStatus) {
            newSet.delete(videoId);
          } else {
            newSet.add(videoId);
          }
          return newSet;
        });
        toast.error("Failed to update watch later status");
      }
    },
    [watchLaterVideos]
  );

  const handleBookmark = useCallback(
    async (videoId: string, youtubeVideoId: string) => {
      const isBookmarked = bookmarkedVideos.has(videoId);
      const newBookmarkStatus = !isBookmarked;

      // Optimistically update UI
      setBookmarkedVideos((prev) => {
        const newSet = new Set(prev);
        if (newBookmarkStatus) {
          newSet.add(videoId);
        } else {
          newSet.delete(videoId);
        }
        return newSet;
      });

      try {
        const response = await fetch("/api/bookmarks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            videoId: youtubeVideoId,
            courseId: course.id,
            courseVideoId: videoId,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to bookmark video");
        }

        if (newBookmarkStatus) {
          toast.success("Video bookmarked");
        } else {
          toast.success("Bookmark removed");
        }
      } catch {
        // Revert optimistic update on error
        setBookmarkedVideos((prev) => {
          const newSet = new Set(prev);
          if (newBookmarkStatus) {
            newSet.delete(videoId);
          } else {
            newSet.add(videoId);
          }
          return newSet;
        });
        toast.error("Failed to bookmark video");
      }
    },
    [bookmarkedVideos, course.id]
  );

  const handlePreviousVideo = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
    }
  };

  const handleNextVideo = () => {
    if (currentVideoIndex < course.videos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    }
  };

  const currentVideo = useMemo(() => {
    return course.videos[currentVideoIndex];
  }, [course.videos, currentVideoIndex]);

  // Memoize the iframe src to prevent unnecessary re-renders
  const iframeSrc = useMemo(() => {
    // Use youtube-nocookie.com for privacy-enhanced mode to reduce tracking
    const baseUrl = `https://www.youtube-nocookie.com/embed/${currentVideo.videoId}`;
    const params = new URLSearchParams({
      rel: "0",
      showinfo: "0",
      modestbranding: "1",
      enablejsapi: "1",
      // Additional privacy parameters
      iv_load_policy: "3", // Hide video annotations
      fs: "1", // Allow fullscreen
      cc_load_policy: "0", // Don't show closed captions by default
    });
    return `${baseUrl}?${params.toString()}`;
  }, [currentVideo.videoId]);

  // Memoize the iframe component to prevent unnecessary re-renders
  const videoIframe = useMemo(() => {
    if (!currentVideo || !iframeSrc) return null;

    return (
      <iframe
        key={currentVideo.videoId}
        src={iframeSrc}
        title={currentVideo.title}
        className="h-full w-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
      />
    );
  }, [currentVideo?.videoId, iframeSrc]); // Only depend on video ID and iframe src

  // Fetch note for current video only when editor is opened
  const { data: note, isLoading: isNoteLoading } = useQuery({
    queryKey: ["note", currentVideo.id],
    queryFn: async () => {
      const response = await fetch(`/api/notes?videoId=${currentVideo.id}`);
      if (!response.ok) throw new Error("Failed to fetch note");
      return response.json();
    },
    enabled: showNoteEditor,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  });

  // Save note mutation
  const saveNoteMutation = useMutation({
    mutationFn: async ({
      content,
      title,
    }: {
      content: string;
      title: string;
    }) => {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId: currentVideo.id,
          courseId: course.id,
          content,
          title,
        }),
      });
      if (!response.ok) throw new Error("Failed to save note");
      return response.json();
    },
    onSuccess: () => {
      toast.success("Note saved successfully");
      setShowNoteEditor(false);
      queryClient.invalidateQueries({ queryKey: ["note", currentVideo.id] });
    },
    onError: () => {
      toast.error("Failed to save note");
    },
  });

  // Set note content when note changes
  useEffect(() => {
    if (note) {
      setNoteContent(note.content || "");
      setNoteTitle(note.title || "");
    }
  }, [note]);

  // Memoize notes section to prevent unnecessary re-renders
  const notesSection = useMemo(() => {
    return (
      <Card className="p-6 bg-zinc-900 border-zinc-800">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Notes</h3>
            {!showNoteEditor && (
              <Button
                onClick={() => setShowNoteEditor(true)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Pencil className="h-4 w-4" />
                {note?.content ? "Edit Note" : "Create Note"}
              </Button>
            )}
          </div>

          {showNoteEditor ? (
            <div className="space-y-4">
              <input
                type="text"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="Note title (optional)"
                className="w-full rounded-md border px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 bg-zinc-800 border-zinc-700 text-white placeholder-gray-400"
              />
              <Textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Write your notes here... (Markdown supported)"
                className="min-h-[200px] font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 bg-zinc-800 border-zinc-700 text-white placeholder-gray-400"
              />
              <div className="flex gap-2">
                <Button
                  onClick={() =>
                    saveNoteMutation.mutate({
                      content: noteContent,
                      title: noteTitle,
                    })
                  }
                  disabled={saveNoteMutation.isPending}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {saveNoteMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4">
                        <LoadingScreen variant="inline" />
                      </div>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      <span>Save Note</span>
                    </div>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowNoteEditor(false)}
                  className="flex-1"
                >
                  <div className="flex items-center gap-2">
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </div>
                </Button>
              </div>
            </div>
          ) : isNoteLoading ? (
            <div className="flex justify-center py-8">
              <LoadingScreen variant="contained" />
            </div>
          ) : note?.content ? (
            <div className="prose prose-sm max-w-none rounded-lg border bg-zinc-800 border-zinc-700 p-4 shadow-sm">
              {note.title && (
                <h4 className="text-lg font-medium text-white mb-2">
                  {note.title}
                </h4>
              )}
              <div className="prose-invert">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {note.content}
                </ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p>No notes yet. Click the button above to add some!</p>
            </div>
          )}
        </div>
      </Card>
    );
  }, [
    showNoteEditor,
    note?.content,
    note?.title,
    noteTitle,
    noteContent,
    isNoteLoading,
    saveNoteMutation.isPending,
    setShowNoteEditor,
    setNoteTitle,
    setNoteContent,
  ]);

  if (!course.videos.length) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-400">No videos available in this course.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 px-4 lg:px-6">
      {/* Video Player Section */}
      <div className="lg:col-span-8">
        <div className="space-y-4">
          {/* Video Player */}
          <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
            {videoIframe}
          </div>

          {/* Video Info and Controls */}
          <Card className="p-6 bg-zinc-900 border-zinc-800">
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {currentVideo.title}
                </h2>
                <p className="text-gray-400">
                  Video {currentVideoIndex + 1} of {course.videos.length}
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={() => handleVideoProgress(currentVideo.id)}
                  variant={
                    watchedVideos.has(currentVideo.id) ? "default" : "outline"
                  }
                  className={`flex items-center gap-2 ${
                    watchedVideos.has(currentVideo.id)
                      ? "bg-blue-600 hover:bg-blue-700"
                      : ""
                  }`}
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
                  className={`flex items-center gap-2 ${
                    watchLaterVideos.has(currentVideo.id)
                      ? "bg-blue-600 hover:bg-blue-700"
                      : ""
                  }`}
                >
                  <Clock className="h-4 w-4" />
                  Watch Later
                </Button>

                <Button
                  onClick={() =>
                    handleBookmark(currentVideo.id, currentVideo.videoId)
                  }
                  variant={
                    bookmarkedVideos.has(currentVideo.id)
                      ? "default"
                      : "outline"
                  }
                  className={`flex items-center gap-2 ${
                    bookmarkedVideos.has(currentVideo.id)
                      ? "bg-blue-600 hover:bg-blue-700"
                      : ""
                  }`}
                >
                  <Bookmark className="h-4 w-4" />
                  Bookmark
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

          {/* Notes Section */}
          {notesSection}
        </div>
      </div>

      {/* Course Content Sidebar */}
      <div className="lg:col-span-4">
        <Card className="sticky top-4 bg-zinc-900 border-zinc-800 shadow-lg">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Play className="h-5 w-5 text-blue-500" />
                Course Content
              </h3>
              <div className="flex flex-col items-end">
                <div className="text-sm font-medium text-blue-400">
                  {watchedVideos.size}/{course.videos.length} completed
                </div>
                <div className="w-16 h-1.5 bg-zinc-700 rounded-full mt-1 overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        (watchedVideos.size / course.videos.length) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5 max-h-[calc(100vh-16rem)] overflow-y-auto pr-2 -mr-2">
              {course.videos.map((video, index) => (
                <div
                  key={video.id}
                  data-video-index={index}
                  className={`group relative rounded-lg border transition-all duration-200 cursor-pointer overflow-hidden min-h-20 ${
                    currentVideoIndex === index
                      ? "border-blue-400 bg-gradient-to-r from-blue-950/40 to-indigo-950/40 shadow-lg ring-2 ring-blue-500/30"
                      : "border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800/30"
                  }`}
                  onClick={() => setCurrentVideoIndex(index)}
                >
                  <div className="flex items-start gap-3 p-3">
                    <div className="flex-shrink-0 mt-1">
                      {watchedVideos.has(video.id) ? (
                        <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center shadow-sm">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      ) : currentVideoIndex === index ? (
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
                          currentVideoIndex === index
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

                        {watchedVideos.has(video.id) && (
                          <span className="text-xs font-medium text-green-400">
                            • Completed
                          </span>
                        )}

                        {watchLaterVideos.has(video.id) && (
                          <span className="text-xs font-medium text-orange-400">
                            • Watch Later
                          </span>
                        )}

                        {bookmarkedVideos.has(video.id) && (
                          <span className="text-xs font-medium text-purple-400">
                            • Bookmarked
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Play indicator for current video */}
                    {currentVideoIndex === index && (
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
      </div>
    </div>
  );
}
