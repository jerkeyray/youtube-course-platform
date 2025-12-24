// components/CoursePlayer.tsx
"use client";

import { useState, useCallback, useEffect, useMemo, useRef, memo } from "react";
import { Course, Video, VideoProgress } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { YouTubePlayer } from "react-youtube";

import {
  Check,
  ChevronLeft,
  ChevronRight,
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
import VideoPlayer from "./VideoPlayer";

type CourseWithProgress = Course & {
  videos: (Video & {
    progress: (VideoProgress & { lastWatchedSeconds: number })[];
  })[];
  completionPercentage: number;
};

interface CoursePlayerProps {
  course: CourseWithProgress;
  initialVideoIndex?: number;
  initialTimestamp?: number;
}

// Stable container to prevent re-renders of the video player wrapper
const StableVideoContainer = memo(
  ({
    videoId,
    startTime,
    onReady,
    onProgress,
    isReadingMode,
  }: {
    videoId: string;
    startTime: number;
    onReady: (player: YouTubePlayer) => void;
    onProgress: (time: number) => void;
    isReadingMode: boolean;
  }) => {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
        <VideoPlayer
          videoId={videoId}
          initialTimestamp={startTime}
          onReady={onReady}
          onProgress={onProgress}
          isReadingMode={isReadingMode}
        />
      </div>
    );
  },
  (prev, next) =>
    prev.videoId === next.videoId && prev.isReadingMode === next.isReadingMode
);

// Helper function to clean YouTube titles
function cleanVideoTitle(
  title: string,
  lessonNumber: number,
  courseTitle: string
): { primary: string; secondary?: string } {
  // Extract course name (simplify "Statistics" from title patterns)
  const courseName = courseTitle.split(" ")[0] || "Course";

  // Look for patterns like "Topic: Description" or "Topic - Description"
  const colonMatch = title.match(/^([^:]+?):\s*(.+)$/);
  if (colonMatch) {
    const before = colonMatch[1].trim();
    const after = colonMatch[2].trim();

    // Extract lesson number from before part if it exists
    const lessonMatch = before.match(
      /(?:Lecture|Lec|Video|Episode|Part)\s*(\d+[\.\d]*)/i
    );
    const lessonNum = lessonMatch ? lessonMatch[1] : lessonNumber.toString();

    return {
      primary: after,
      secondary: `${courseName} · Lecture ${lessonNum}`,
    };
  }

  // Look for dash patterns
  const dashMatch = title.match(/^([^-]+?)\s*-\s*(.+)$/);
  if (dashMatch) {
    const before = dashMatch[1].trim();
    const after = dashMatch[2].trim();

    const lessonMatch = before.match(
      /(?:Lecture|Lec|Video|Episode|Part)\s*(\d+[\.\d]*)/i
    );
    const lessonNum = lessonMatch ? lessonMatch[1] : lessonNumber.toString();

    return {
      primary: after,
      secondary: `${courseName} · Lecture ${lessonNum}`,
    };
  }

  // Try to remove common prefixes
  let cleaned = title
    .replace(/^(Lecture|Video|Episode|Part|Chapter)\s*\d+[\.\-\:]?\s*/i, "")
    .replace(/^Statistics\s+(Lecture|Video|Lec)?\s*\d+[\.\-\:]?\s*/i, "")
    .replace(/^[^:]+:\s*/, "") // Remove anything before colon
    .trim();

  // If we cleaned it significantly, use the cleaned version
  if (cleaned !== title && cleaned.length > 0) {
    return {
      primary: cleaned,
      secondary: `${courseName} · Lecture ${lessonNumber}`,
    };
  }

  // Fallback: just return the title as primary
  return {
    primary: title,
    secondary: `${courseName} · Lecture ${lessonNumber}`,
  };
}

export default function CoursePlayer({
  course,
  initialVideoIndex = 0,
  initialTimestamp,
}: CoursePlayerProps) {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(initialVideoIndex);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [watchedVideos, setWatchedVideos] = useState<Set<string>>(
    new Set(
      course.videos
        .filter((video) => video.progress.some((p) => p.completed))
        .map((video) => video.id)
    )
  );
  const [bookmarkedVideos, setBookmarkedVideos] = useState<Set<string>>(
    new Set()
  );
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const queryClient = useQueryClient();

  // Sync video index changes to other components (like Sidebar)
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("videoIndexChange", {
        detail: { videoIndex: currentVideoIndex },
      })
    );
  }, [currentVideoIndex]);

  // Listen for video index changes from sidebar
  useEffect(() => {
    const handleVideoIndexChange = (event: CustomEvent) => {
      const { videoIndex } = event.detail;
      setCurrentVideoIndex(videoIndex);
    };

    window.addEventListener(
      "videoIndexChange",
      handleVideoIndexChange as EventListener
    );

    return () => {
      window.removeEventListener(
        "videoIndexChange",
        handleVideoIndexChange as EventListener
      );
    };
  }, []);

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

        // Auto-remove bookmark if marking as completed
        if (!isCompleted && bookmarkedVideos.has(videoId)) {
          const video = course.videos.find((v) => v.id === videoId);
          if (video) {
            // We don't await this to not block the UI feedback
            fetch(`/api/bookmarks/${video.videoId}`, { method: "DELETE" })
              .then(() => {
                setBookmarkedVideos((prev) => {
                  const newSet = new Set(prev);
                  newSet.delete(videoId);
                  return newSet;
                });
                toast.info("Bookmark removed (completed)");
              })
              .catch(() => {
                // Ignore error
              });
          }
        }

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
    [watchedVideos, bookmarkedVideos, course.videos]
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

      // Optimistic toast for immediate feedback
      if (newBookmarkStatus) {
        toast.success("Video bookmarked");
      } else {
        toast.success("Bookmark removed");
      }

      try {
        let response;
        if (newBookmarkStatus) {
          // Add bookmark
          const currentTime = playerRef.current?.getCurrentTime() || 0;
          response = await fetch("/api/bookmarks", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              videoId: videoId,
              courseId: course.id,
              courseVideoId: videoId,
              timestamp: Math.floor(currentTime),
            }),
          });
        } else {
          // Remove bookmark
          response = await fetch(`/api/bookmarks/${youtubeVideoId}`, {
            method: "DELETE",
          });
        }

        if (!response.ok) {
          throw new Error("Failed to update bookmark");
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
        toast.error("Failed to update bookmark");
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

  const startTime = useMemo(() => {
    if (
      initialTimestamp &&
      currentVideoIndex === initialVideoIndex &&
      initialTimestamp > 0
    ) {
      return initialTimestamp;
    }
    const progress = currentVideo.progress[0];
    if (progress?.lastWatchedSeconds && progress.lastWatchedSeconds > 0) {
      return progress.lastWatchedSeconds;
    }
    return 0;
  }, [currentVideo, currentVideoIndex, initialTimestamp, initialVideoIndex]);

  const saveProgress = useCallback(
    async (time: number, completed: boolean = false) => {
      if (!currentVideo) return;

      try {
        await fetch(`/api/videos/${currentVideo.id}/progress`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            completed,
            lastWatchedSeconds: Math.floor(time),
          }),
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to save progress", error);
      }
    },
    [currentVideo]
  );

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  const onPlayerReady = useCallback((event: { target: YouTubePlayer }) => {
    playerRef.current = event.target;
  }, []);

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
    // Only show notes section if there's actual content
    if (!note?.content) {
      return null;
    }

    return (
      <Card className="p-6 bg-zinc-900 border-zinc-800">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Notes</h3>
          </div>

          {isNoteLoading ? (
            <div className="flex justify-center py-8">
              <LoadingScreen variant="contained" />
            </div>
          ) : (
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
          )}
        </div>
      </Card>
    );
  }, [isNoteLoading, note?.content, note?.title]);

  if (!course.videos.length) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-400">No videos available in this course.</p>
      </div>
    );
  }

  const totalVideos = course.videos.length;
  const currentLessonNumber = currentVideoIndex + 1;
  const titleInfo = cleanVideoTitle(
    currentVideo.title,
    currentLessonNumber,
    course.title
  );
  const isVideoCompleted = watchedVideos.has(currentVideo.id);

  return (
    <div className="space-y-4">
      {/* Lesson indicator above video */}
      <p className="text-sm text-neutral-500">
        Lesson {currentLessonNumber} of {totalVideos}
      </p>

      {/* Video Player */}
      <StableVideoContainer
        key={currentVideo.videoId}
        videoId={currentVideo.videoId}
        startTime={startTime}
        onReady={onPlayerReady}
        onProgress={saveProgress}
        isReadingMode={showNoteEditor}
      />

      {/* Video Title Above Buttons */}
      <div className="mt-4 mb-2">
        <h2 className="text-xl font-semibold text-white">
          {titleInfo.primary}
        </h2>
        {titleInfo.secondary && (
          <p className="text-xs text-neutral-500 mt-1.5">
            {titleInfo.secondary}
          </p>
        )}
      </div>

      {/* Action Buttons with hierarchy */}
      <div className="space-y-6">
        {/* Primary action: Mark as Completed - conclusion, not a button */}
        <div>
          <Button
            onClick={() => handleVideoProgress(currentVideo.id)}
            className={`w-full flex items-center justify-center gap-2 font-medium transition-colors duration-150 ${
              isVideoCompleted
                ? "bg-white text-black hover:bg-neutral-200 border-0"
                : "bg-white text-black hover:bg-neutral-200 border-0"
            }`}
          >
            <Check className="h-4 w-4" />
            {isVideoCompleted ? "Completed" : "Mark as Completed"}
          </Button>
        </div>

        {/* Secondary actions row */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() =>
              handleBookmark(currentVideo.id, currentVideo.videoId)
            }
            variant="outline"
            size="icon"
            className={`flex items-center gap-2 bg-transparent border border-white/10 hover:bg-white/5 hover:border-white/20 transition-colors duration-150 ${
              bookmarkedVideos.has(currentVideo.id)
                ? "text-white border-white/30 bg-white/10"
                : "text-neutral-400 hover:text-white"
            }`}
            title="Bookmark"
          >
            <Bookmark
              className={`h-4 w-4 ${
                bookmarkedVideos.has(currentVideo.id) ? "fill-current" : ""
              }`}
            />
          </Button>

          <Button
            onClick={() => setShowNoteEditor((v) => !v)}
            variant="outline"
            size="icon"
            className="flex items-center gap-2 bg-transparent border border-white/10 text-neutral-400 hover:text-white hover:bg-white/5 hover:border-white/20 transition-colors duration-150"
            title={note?.content ? "Edit Note" : "Capture what you learned"}
          >
            <Pencil className="h-4 w-4" />
          </Button>

          <Button
            onClick={handlePreviousVideo}
            disabled={currentVideoIndex === 0}
            variant="outline"
            size="icon"
            className="bg-transparent border border-white/10 text-neutral-400 hover:text-white hover:bg-white/5 hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
            title="Previous lesson"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            onClick={handleNextVideo}
            disabled={currentVideoIndex === course.videos.length - 1}
            variant="outline"
            size="icon"
            className="bg-transparent border border-white/10 text-neutral-400 hover:text-white hover:bg-white/5 hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
            title="Next lesson"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Note Editor Field (revealed below buttons) */}
      {showNoteEditor && (
        <div className="mt-4">
          <Card className="p-6 bg-[#0D1016] border-white/5">
            <div className="space-y-4">
              <input
                type="text"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="Note title (optional)"
                className="w-full rounded-md border px-3 py-2 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-white bg-black/50 border-white/10 text-white placeholder-neutral-500"
              />
              <Textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Write your notes here... (Markdown supported)"
                className="min-h-[200px] font-mono text-sm resize-none focus:ring-1 focus:ring-white bg-black/50 border-white/10 text-white placeholder-neutral-500"
              />
              <div className="flex gap-3">
                <Button
                  onClick={() =>
                    saveNoteMutation.mutate({
                      content: noteContent,
                      title: noteTitle,
                    })
                  }
                  disabled={saveNoteMutation.isPending}
                  className="flex-1 bg-white text-black hover:bg-neutral-200 font-medium border-0"
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
                  className="flex-1 bg-transparent border border-white/10 text-neutral-300 hover:text-white hover:bg-white/5 hover:border-white/20"
                >
                  <div className="flex items-center gap-2">
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </div>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Notes Section (display only) */}
      {!showNoteEditor && notesSection}
    </div>
  );
}
