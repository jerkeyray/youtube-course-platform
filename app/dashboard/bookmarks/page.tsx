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

async function getBookmarks() {
  const response = await fetch("/api/bookmarks");
  if (!response.ok) {
    throw new Error("Failed to fetch bookmarks");
  }
  return response.json() as Promise<Video[]>;
}

export default function BookmarksPage() {
  const {
    data: videos = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["bookmarks"],
    queryFn: getBookmarks,
  });

  if (error) {
    toast.error("Failed to load bookmarks");
    return (
      <main className="container py-8">
        <div className="rounded-lg border bg-card dark:bg-gray-800 dark:border-gray-700 p-8 text-center">
          <h2 className="mb-2 text-xl font-medium dark:text-white">
            Error loading bookmarks
          </h2>
          <p className="mb-4 text-muted-foreground dark:text-gray-400">
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
        <h1 className="text-3xl font-bold dark:text-white">My Bookmarks</h1>
      </div>

      {videos.length === 0 ? (
        <div className="rounded-lg border bg-card dark:bg-blue-900/50 p-8 text-center">
          <h2 className="mb-2 text-xl font-medium dark:text-blue-100">
            No bookmarks yet
          </h2>
          <p className="text-muted-foreground">
            Add bookmarks while watching videos
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 max-w-screen-xl mx-auto">
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onRemove={() => refetch()}
              type="bookmark"
            />
          ))}
        </div>
      )}
    </main>
  );
}
