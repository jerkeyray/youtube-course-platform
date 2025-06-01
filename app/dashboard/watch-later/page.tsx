"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import VideoCard from "@/components/VideoCard";
import LoadingScreen from "@/components/LoadingScreen";

interface Video {
  id: string;
  title: string;
  thumbnailUrl: string;
  duration: string;
  youtubeId: string;
  courseTitle: string;
  courseId: string;
}

async function getWatchLaterVideos() {
  const response = await fetch("/api/watch-later");
  if (!response.ok) {
    throw new Error("Failed to fetch watch later videos");
  }
  const data = await response.json();
  return data.videos as Video[];
}

export default function WatchLaterPage() {
  const {
    data: videos = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["watch-later"],
    queryFn: getWatchLaterVideos,
  });

  if (error) {
    toast.error("Failed to load watch later videos");
    return (
      <main className="container py-8">
        <div className="rounded-lg border bg-card dark:bg-blue-900/50 p-8 text-center">
          <h2 className="mb-2 text-xl font-medium dark:text-blue-100">
            Error loading videos
          </h2>
          <p className="mb-4 text-muted-foreground">
            Please try refreshing the page
          </p>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="container py-8">
        <LoadingScreen variant="fullscreen" />
      </main>
    );
  }

  return (
    <main className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold dark:text-white">Watch Later</h1>
      </div>

      {videos.length === 0 ? (
        <div className="rounded-lg border bg-card dark:bg-blue-900/50 p-8 text-center">
          <h2 className="mb-2 text-xl font-medium dark:text-blue-100">
            No videos in watch later
          </h2>
          <p className="text-muted-foreground">
            Add videos to your watch later list while browsing courses
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 max-w-screen-xl mx-auto">
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onRemove={() => refetch()}
            />
          ))}
        </div>
      )}
    </main>
  );
}
