"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import VideoCard from "@/components/VideoCard";

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
        <div className="rounded-lg border bg-card p-8 text-center">
          <h2 className="mb-2 text-xl font-medium">Error loading bookmarks</h2>
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
        <div className="flex items-center justify-center h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Bookmarks</h1>
        <p className="text-muted-foreground mt-1">Videos you've bookmarked</p>
      </div>

      {videos.length === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center">
          <h2 className="mb-2 text-xl font-medium">No bookmarks yet</h2>
          <p className="text-muted-foreground">
            Add bookmarks while watching videos
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
