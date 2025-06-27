"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import VideoCard from "@/components/VideoCard";
import LoadingScreen from "@/components/LoadingScreen";
import { Bookmark } from "lucide-react";

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
      <div className="min-h-screen bg-black text-white">
        <div className="p-6 md:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-8 text-center">
              <h2 className="mb-2 text-xl font-medium text-white">
                Error loading bookmarks
              </h2>
              <p className="mb-4 text-gray-400">
                Please try refreshing the page
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Bookmark className="h-8 w-8 text-blue-500" />
              <h1 className="text-3xl font-bold text-white">My Bookmarks</h1>
            </div>
            <p className="text-gray-400">Your saved videos for quick access</p>
          </div>

          {videos.length === 0 ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800">
                  <Bookmark className="h-8 w-8 text-gray-500" />
                </div>
                <div>
                  <h2 className="text-xl font-medium text-white mb-2">
                    No bookmarks yet
                  </h2>
                  <p className="text-gray-400">
                    Add bookmarks while watching videos
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
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
        </div>
      </div>
    </div>
  );
}
