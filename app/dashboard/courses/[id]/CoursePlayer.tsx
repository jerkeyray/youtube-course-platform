// components/CoursePlayer.tsx
"use client";

import { useState, useCallback } from "react";
import { Course, Video, VideoProgress } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";

interface CoursePlayerProps {
  course: Course & {
    videos: (Video & { progress: VideoProgress[] })[];
    completionPercentage: number;
  };
}

export default function CoursePlayer({ course }: CoursePlayerProps) {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [watchedVideos, setWatchedVideos] = useState<string[]>(
    course.videos
      .filter((video) => video.progress.some((p) => p.completed))
      .map((video) => video.id)
  );

  const handleVideoSelect = useCallback(
    (index: number) => {
      setCurrentVideoIndex(index);
      // Update the iframe src
      const iframe = document.querySelector("iframe");
      if (iframe && course.videos[index]) {
        iframe.src = `https://www.youtube.com/embed/${course.videos[index].videoId}`;
      }
    },
    [course.videos]
  );

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
    <Card className="p-4">
      <h2 className="text-lg font-semibold mb-4" id="course-content">
        Course Content
      </h2>
      <div
        role="list"
        className="space-y-2 max-h-[calc(100vh-12rem)] overflow-y-auto"
        aria-labelledby="course-content"
      >
        {course.videos.map((video, index) => (
          <Button
            key={video.id}
            role="listitem"
            variant={currentVideoIndex === index ? "default" : "ghost"}
            className="w-full justify-start truncate"
            onClick={() => handleVideoSelect(index)}
            aria-current={currentVideoIndex === index ? "true" : undefined}
            aria-label={`Play video ${index + 1}: ${video.title}`}
          >
            <span className="mr-2 flex-shrink-0">{index + 1}.</span>
            <span className="truncate">{video.title}</span>
            {watchedVideos.includes(video.id) && (
              <Check
                className="ml-auto h-4 w-4 flex-shrink-0"
                aria-hidden="true"
              />
            )}
          </Button>
        ))}
      </div>
    </Card>
  );
}
