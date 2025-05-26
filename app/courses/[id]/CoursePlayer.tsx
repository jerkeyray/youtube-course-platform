"use client";

import { useState } from "react";
import { Course, Video, VideoProgress } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";

interface CoursePlayerProps {
  course: Course & {
    videos: (Video & {
      progress: VideoProgress[];
    })[];
  };
}

export default function CoursePlayer({ course }: CoursePlayerProps) {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [watchedVideos, setWatchedVideos] = useState<Set<string>>(
    new Set(
      course.videos
        .filter((video) => video.progress[0]?.completed)
        .map((video) => video.id)
    )
  );

  const currentVideo = course.videos[currentVideoIndex];

  const handleVideoComplete = async () => {
    if (!currentVideo) return;

    try {
      const response = await fetch(`/api/courses/${course.id}/progress`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoId: currentVideo.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update progress");
      }

      setWatchedVideos((prev) => new Set([...prev, currentVideo.id]));
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="aspect-video w-full overflow-hidden rounded-lg border bg-muted">
        {currentVideo ? (
          <iframe
            src={`https://www.youtube.com/embed/${currentVideo.videoId}`}
            title={currentVideo.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">No video selected</p>
          </div>
        )}
      </div>

      <Card className="p-4">
        <h2 className="mb-4 text-lg font-semibold">Course Content</h2>
        <div className="space-y-2">
          {course.videos.map((video, index) => (
            <Button
              key={video.id}
              variant={currentVideoIndex === index ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setCurrentVideoIndex(index)}
            >
              <span className="mr-2">{index + 1}.</span>
              {video.title}
              {watchedVideos.has(video.id) && (
                <Check className="ml-auto h-4 w-4" />
              )}
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
}
