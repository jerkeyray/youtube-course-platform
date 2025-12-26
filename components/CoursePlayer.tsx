"use client";

import React, { useRef, useCallback, useState } from "react";
import YouTube, { YouTubePlayer } from "react-youtube";
import { NotesSidebar } from "./NotesSidebar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { NotebookPen } from "lucide-react";

interface CoursePlayerProps {
  videoId: string; // YouTube Video ID
  videoDatabaseId: string; // Database UUID
  courseId: string;
  className?: string;
}

export function CoursePlayer({
  videoId,
  videoDatabaseId,
  courseId,
  className,
}: CoursePlayerProps) {
  const playerRef = useRef<YouTubePlayer | null>(null);
  const [isNotesOpen, setIsNotesOpen] = useState(false);

  const onReady = (event: unknown) => {
    const maybe = event as { target?: YouTubePlayer };
    if (maybe?.target) {
      playerRef.current = maybe.target;
    }
  };

  const getCurrentTime = useCallback(() => {
    const t = playerRef.current?.getCurrentTime?.();
    return typeof t === "number" && Number.isFinite(t) ? t : 0;
  }, []);

  // We no longer render the time label in the UI; keep getCurrentTime for saving notes.

  const seekTo = useCallback((seconds: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(seconds, true);
      playerRef.current.playVideo();
    }
  }, []);

  return (
    <div
      className={cn(
        "flex h-screen overflow-hidden bg-background relative",
        className
      )}
    >
      <div className="flex-1 relative bg-black flex items-center justify-center">
        <div className="w-full h-full">
          <YouTube
            videoId={videoId}
            onReady={onReady}
            className="w-full h-full"
            iframeClassName="w-full h-full"
            opts={{
              height: "100%",
              width: "100%",
              playerVars: {
                autoplay: 0,
                modestbranding: 1,
                rel: 0,
              },
            }}
          />
        </div>
      </div>

      <div className="absolute bottom-4 left-4 z-10">
        <Button
          variant="secondary"
          size="icon"
          onClick={() => {
            const next = !isNotesOpen;
            if (next) {
              try {
                playerRef.current?.pauseVideo?.();
              } catch {
                // ignore
              }
            }
            setIsNotesOpen(next);
          }}
          aria-label={isNotesOpen ? "Close notes" : "Open notes"}
          title={isNotesOpen ? "Close notes" : "Open notes"}
        >
          <NotebookPen className="h-4 w-4" />
        </Button>
      </div>

      <NotesSidebar
        courseId={courseId}
        videoId={videoDatabaseId}
        getCurrentTime={getCurrentTime}
        seekTo={seekTo}
        isOpen={isNotesOpen}
        onOpenChange={setIsNotesOpen}
      />
    </div>
  );
}
