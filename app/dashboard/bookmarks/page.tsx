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
  timestamp?: number | null;
  createdAt?: string;
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

  const nextVideo = videos[0];
  const queueVideos = videos.slice(1);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="p-8 md:p-12">
        <div className="max-w-6xl">
          {/* Header */}
          <div className="mb-16">
            <h1 className="text-xl font-medium text-zinc-400">Paused Tasks</h1>
          </div>

          {videos.length === 0 ? (
            <div className="py-20">
              <p className="text-zinc-600 text-lg">
                No active tasks. You&apos;re all caught up.
              </p>
            </div>
          ) : (
            <div className="space-y-16">
              {/* Primary/First Bookmark */}
              <section>
                <h2 className="text-sm font-medium text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                  Next to finish
                </h2>
                <div className="max-w-md">
                  <VideoCard
                    video={nextVideo}
                    onRemove={() => refetch()}
                    type="bookmark"
                  />
                </div>
              </section>

              {queueVideos.length > 0 && (
                <section>
                  <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-6 pl-1">
                    In Queue
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {queueVideos.map((video) => (
                      <VideoCard
                        key={video.id}
                        video={video}
                        onRemove={() => refetch()}
                        type="bookmark"
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
